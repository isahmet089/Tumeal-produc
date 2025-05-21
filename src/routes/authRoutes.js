const express = require("express");
const router = express.Router();
const AUTH_CONTROLLER = require("../controller/authController");

router.post("/register", AUTH_CONTROLLER.registerUser);
router.post("/login", AUTH_CONTROLLER.loginUser);
router.post("/logout", AUTH_CONTROLLER.logoutUser);




module.exports = router;
