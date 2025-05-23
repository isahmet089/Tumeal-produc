const express = require("express");
const router = express.Router();
const WWWAuthController = require("../../controller/www/wwwAuthController.js");
const WWWUserController = require("../../controller/www/wwwUserController.js");

//www Routes - user

router.get("/home", (req, res) => {
  
    res.render("www/index", { title: "home" });
});

// Auth routes
router.get('/register', WWWAuthController.showRegister);
router.post('/register', WWWAuthController.register);
router.get('/login', WWWAuthController.showLogin);
router.post('/login', WWWAuthController.login);
router.post('/logout', WWWAuthController.logout);
//verify email
router.get('/verify-email/:token', WWWAuthController.verifyEmail);   // Önce spesifik route
router.get('/verify-email-success', WWWAuthController.showAccountVerified);
router.get('/verify-email-failed', WWWAuthController.showAccountVerificationFailed);
//resend verification email
router.post('/resend-verification', WWWAuthController.resendVerificationEmail);


//forgot password
router.get('/forgot-password', WWWAuthController.showForgotPassword);
router.post('/forgot-password', WWWAuthController.forgotPassword);
router.get('/reset-password/:token', WWWAuthController.showResetPassword);
router.post('/reset-password/:token', WWWAuthController.resetPassword);
router.get('/reset-password-error', WWWAuthController.showResetPasswordFailed);
router.get('/reset-password-success', WWWAuthController.showResetPasswordSuccess);




//user routes
router.get('/profile', WWWUserController.showProfile);
router.get('/menu', WWWUserController.showMenu);
router.get('/feed', WWWUserController.showFeed);












module.exports = router;