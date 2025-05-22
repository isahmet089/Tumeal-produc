const express = require("express");
const app = express();
const path = require('path');
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(morgan("dev"));

// flash messages
app.use(flash());


// view engine setup EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//app.use(expressLayouts);
//app.set('layout', 'layouts/main');

// Routes-require
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const wwwRoutes = require("./routes/www/wwwRoutes");


// Routes-use
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/", wwwRoutes);

// home redirect
app.get("/", (req, res) => {
    res.redirect("/home");
});

//global değişkenler
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
  });

module.exports = app;
