const express = require("express");
const app = express();
const path = require('path');
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const flash = require('connect-flash');
const userLocals = require("./middleware/userLocalsAuth");
const logMiddleware = require("./middleware/log");
const updateLastActive = require('./middleware/updateLastActive');

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan("dev"));
app.use(updateLastActive);
app.use(userLocals);
app.use(logMiddleware);
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
const apiDashboardRoutes = require("./routes/dashboard/apiDashboardRoutes.js");
const wwwDashboardRoutes = require("./routes/dashboard/wwwDashboardRoutes.js");
// Routes-use
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/", wwwRoutes);

app.use("/api/dashboard", apiDashboardRoutes);
app.use("/dashboard", wwwDashboardRoutes);


// home redirect
app.get("/", (req, res) => {
    res.redirect("/home");
});
app.get("/dashboard", (req, res) => {
    res.redirect("/dashboard/log/data");
});
app.get("/dashboard/home", (req, res) => {
    res.redirect("/dashboard/log/data");
});


module.exports = app;
