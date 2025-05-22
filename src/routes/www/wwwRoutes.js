const express = require("express");
const router = express.Router();

//www Routes - user
router.get("/login", (req, res) => {
    res.render("www/login", { title: "login" });
});

router.get("/register", (req, res) => {
    res.render("www/register", { title: "register" });
});

router.get("/logout", (req, res) => {
    res.render("www/logout", { title: "logout" });
});
router.get("/home", (req, res) => {
    res.render("www/index", { title: "home" });
});
router.get("/menu", (req, res) => {
    res.render("www/menu", { title: "menu" });
});
router.get("/feed", (req, res) => {
    res.render("www/feed", { title: "feed" });
});
router.get("/profile", (req, res) => {
    res.render("www/profile", { title: "profile" });
});




module.exports = router;