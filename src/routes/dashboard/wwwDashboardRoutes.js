const express = require("express");
const router = express.Router();
const wwwDashboardController = require("../../controller/dashboard/wwwDashboardController");
const { authenticate } = require("../../middleware/auth");

router.get("/home", authenticate, wwwDashboardController.home);
router.get("/login", wwwDashboardController.showLogin);
router.get("/register", wwwDashboardController.showRegister);

//auth
router.post("/login", wwwDashboardController.login);
router.post("/register", wwwDashboardController.register);
router.post("/logout", wwwDashboardController.logout);

//users
router.get("/users", authenticate, wwwDashboardController.getUsers);
router.get("/user/edit", authenticate, wwwDashboardController.getUser);
router.get("/user/:id", authenticate, wwwDashboardController.getUserById);
router.post("/user/create", authenticate, wwwDashboardController.createUser);
router.put("/user/:id", authenticate, wwwDashboardController.updateUser);
router.delete("/user/:id", authenticate, wwwDashboardController.deleteUser);

//meal
router.get("/meal", authenticate, wwwDashboardController.getMeal);
router.get("/meal/edit", authenticate, wwwDashboardController.getMealEdit);
router.get("/meal/:id", authenticate, wwwDashboardController.getMealById);
router.post("/meal/create", authenticate, wwwDashboardController.createMeal);
router.put("/meal/:id", authenticate, wwwDashboardController.updateMeal);
router.delete("/meal/:id", authenticate, wwwDashboardController.deleteMeal);

//comment
// Yorum yönetimi route'ları
router.get("/comment/edit", authenticate, wwwDashboardController.getCommentEdit);
router.get("/comment/:id", authenticate, wwwDashboardController.getCommentById);
router.delete("/comment/:id", authenticate, wwwDashboardController.deleteComment);

//post
router.get("/post/edit", authenticate, wwwDashboardController.getPostEdit);
router.get("/post/:id", authenticate, wwwDashboardController.getPostById);
router.post("/post/create", authenticate, wwwDashboardController.createPost);
router.put("/post/:id", authenticate, wwwDashboardController.updatePost);
router.delete("/post/:id", authenticate, wwwDashboardController.deletePost);


//log
router.get('/log/data', authenticate, wwwDashboardController.getLogData);
router.get('/log/:id', authenticate, wwwDashboardController.getLogById);

//notification
router.get('/notification', authenticate, wwwDashboardController.getNotificationPage);
router.post('/notification/create', authenticate, wwwDashboardController.createNotification);
router.get('/notification/:id', authenticate, wwwDashboardController.getNotificationById);
router.delete('/notification/:id', authenticate, wwwDashboardController.deleteNotification);
//404
router.get("/404", wwwDashboardController.show404);

module.exports = router;
