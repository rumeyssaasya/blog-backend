const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const userController = require("../controllers/userController");


router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserProfile);
router.get("/search",userController.searchUsers)
router.put("/:id", protect, userController.uploadAvatar, userController.updateUserProfile);
router.delete("/:id", protect, userController.deleteUserProfile);

module.exports = router;
