const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./config/dbConfig");
dotenv.config();

connectDB();


app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

