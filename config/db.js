const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = async () => {
  mongoose.connect(process.env.MONGO_CONNECTION_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  });
  const connection = mongoose.connection;
  connection
    .once("open", () => {
      console.log("database connected");
    })
    .catch((err) => {
      console.log(`err:${err}`);
    });
};
module.exports = connectDB;
