const express = require("express");
const router = express.Router();
const quizController = require("../Controllers/quiz");
const verifyToken = require("../Middlewares/verifyToken");

router.post("/create", verifyToken, quizController.createQuiz);
router.patch("/edit/:quizId", verifyToken, quizController.editQuiz);
router.delete("/delete/:quizId", verifyToken, quizController.deleteQuiz);
router.get("/quizbyid/:quizId", quizController.getQuizById);
router.get("/all", verifyToken, quizController.getAllQuizzes);
router.get("/stats", verifyToken, quizController.getQuizStatistics);
router.post("/submit/:quizId", quizController.submitQuiz);
router.get("/analytics/:quizId", verifyToken, quizController.getQuizAnalytics);
router.get("/share/:quizId", verifyToken, quizController.shareQuiz);

module.exports = router;
