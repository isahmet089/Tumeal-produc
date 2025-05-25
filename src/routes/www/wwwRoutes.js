const express = require("express");
const router = express.Router();
const WWWAuthController = require("../../controller/www/wwwAuthController.js");
const WWWUserController = require("../../controller/www/wwwUserController.js");
const WWWMealController = require("../../controller/www/wwwMealController.js");


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
router.get('/profile', WWWAuthController.showProfile);
router.get('/menu', WWWUserController.showMenu);
router.get('/feed', WWWUserController.showFeed);
router.get('/notification', WWWUserController.showNotification);

//favorite routes
router.post('/toggle-favorite', WWWUserController.toggleFavorite);



//meal routes
router.get('/mealDay', WWWMealController.getMealDay);
router.get('/mealWeek', WWWMealController.getMealWeek);

//post routes
router.post('/create-post', WWWUserController.createPost);
router.get('/get-posts', WWWUserController.getPosts);

//comment routes
router.post('/add-comment', WWWUserController.addComment);

// Kendi postlarını getir
router.get('/get-self-posts', WWWUserController.getSelfPosts);

// Kendi yorumlarını getir
router.get('/self-comments', WWWUserController.getSelfComments);

// Kendi postunu sil
router.delete('/delete-post/:postId', WWWUserController.deletePost);

// Kendi yorumunu sil
router.delete('/delete-comment/:commentId', WWWUserController.deleteComment);



//like routes
router.post('/like-post', WWWUserController.likePost);




// Bugünkü yemek yorumları sayfası
router.get('/feed-bugun', WWWUserController.getFeedBugun);

// Test sayfası
router.get('/user/:id', WWWUserController.getUser);

// İstatistikleri getir
router.get('/stats', WWWUserController.getStats);
router.get('/stats2', WWWUserController.getStats2);

module.exports = router;