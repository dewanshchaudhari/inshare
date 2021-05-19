const File = require("./models/file");
const fs = require("fs");
const connectDB = require("./config/db");
connectDB();
const fetchData = async () => {
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const files = await File.find({ createdAt: { $lt: pastDate } });
  if (files.length) {
    for (const file of files) {
      try {
        fs.unlinkSync(file.path);
        await file.remove();
        console.log(`successfully deleted file: ${file.filename}`);
      } catch (error) {
        console.log(error);
      }
    }
    console.log("Job done!");
  }
};
fetchData().then(process.exit);
