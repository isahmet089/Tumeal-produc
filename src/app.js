const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Routes-require
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");


// Routes-use
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);




module.exports = app;
