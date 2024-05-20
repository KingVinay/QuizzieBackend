const express = require("express");
const router = express.Router();
const quizController = require("../Controllers/quiz");
const verifyToken = require("../Middlewares/verifyToken");

router.post("/create", verifyToken, quizController.createQuiz);

module.exports = router;
