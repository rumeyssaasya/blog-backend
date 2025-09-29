router.get("/:id", userController.getUserProfile);
router.put("/:id", protect, userController.uploadAvatar, userController.updateUserProfile);
router.delete("/:id", protect, userController.deleteUserProfile);