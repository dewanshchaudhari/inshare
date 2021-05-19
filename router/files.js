const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { v4: uuid } = require("uuid");
const File = require("../models/file");
const sendMail = require("../services/emailService");
const emailTemplate = require("../services/emailTemplate");
let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});
let upload = multer({
  storage,
  limits: { fileSize: 1000000 * 100 },
}).single("myfile");
router.post("/", (req, res) => {
  //validate request

  //store file
  upload(req, res, async (err) => {
    if (!req.file) {
      return res.json(new Error("All fields are required!")).status(500);
    }
    if (err) return res.status(500).send({ err: err.message });
    //store in db
    const file = new File({
      filename: req.file.filename,
      uuid: uuid(),
      path: req.file.path,
      size: req.file.size,
    });
    const response = await file.save();
    return res.json({
      file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
    });
  });
  //response link
});
router.post("/send", async (req, res) => {
  const { uuid, emailTo, emailFrom } = req.body;
  //validate request
  if (!uuid || !emailTo || !emailFrom) {
    return res.status(422).send({ error: "All fields are required!" });
  }
  //get data from database
  const file = await File.findOne({ uuid: uuid });
  if (file.sender)
    return res.status(422).send({ error: "Email already sent." });
  file.sender = emailFrom;
  file.receiver = emailTo;
  const response = await file.save();

  //send email
  sendMail({
    from: emailFrom,
    to: emailTo,
    subjet: "Inshare file sharing",
    text: `${emailFrom} shared file with you!`,
    html: emailTemplate({
      emailFrom: emailFrom,
      downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
      size: parseInt(file.size / 1000) + " KB",
      expires: "24 hours",
    }),
  });
  return res.send({ success: true });
});

module.exports = router;
