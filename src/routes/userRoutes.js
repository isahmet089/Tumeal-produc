const express = require("express");
const router = express.Router();
const USER_CONTROLLER = require("../controller/userController");

router.get("/", USER_CONTROLLER.getUser);
router.get("/:id", USER_CONTROLLER.getUserById);
router.put("/:id", USER_CONTROLLER.updateUser);
router.delete("/:id", USER_CONTROLLER.deleteUser);

module.exports = router;
