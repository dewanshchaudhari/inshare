const express = require("express");
const app = express();
const connectDB = require("./config/db");
const path = require("path");
const cors = require("cors");
const files = require("./router/files");
const show = require("./router/show");
const download = require("./router/download");
app.use(express.json());
app.use(express.static("public"));
app.use(cors);
connectDB();
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");
//routes
app.use("/api/files", files);
app.use("/files", show);
app.use("/files/download", download);
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`servering on https://localhost:${port}`);
});
