const express = require("express");
const router = express.Router();
const authController = require("../Controllers/user");

// user auth routes
router.post("/register", authController.registerUser);

module.exports = router;
