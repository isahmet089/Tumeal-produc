const User = require("../../models/User");

const showProfile = async (req, res) => {
    res.render("www/profile", {
        error: null,
        success: null
    });
};

const showMenu = async (req, res) => {
    res.render("www/menu", {
        error: null,
        success: null
    });
};

const showFeed = async (req, res) => {
    res.render("www/feed", {
        error: null,
        success: null
    });
};




module.exports = {
    showProfile,
    showMenu,
    showFeed,
};
