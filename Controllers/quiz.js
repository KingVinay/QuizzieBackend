const Quiz = require("../Models/quiz");

const createQuiz = async (req, res, next) => {
  try {
    const { quizName, quizType, timer, questions } = req.body;
    if (
      !quizName ||
      !quizType ||
      !timer ||
      !questions ||
      questions.length === 0
    ) {
      return res.status(400).json({ errorMessage: "All fields are required!" });
    }

    for (const question of questions) {
      if (
        !question.questionName ||
        !question.optionType ||
        !question.options ||
        question.options.length === 0
      ) {
        return res.status(400).json({
          errorMessage: "All questions must have required fields!",
        });
      }

      for (const option of question.options) {
        if (question.optionType === "text and image url") {
          if (!option.text || !option.imageUrl) {
            return res
              .status(400)
              .json({ errorMessage: "All options must have required fields!" });
          }
        } else {
          if (!option.text && !option.imageUrl) {
            return res
              .status(400)
              .json({ errorMessage: "All options must have required fields!" });
          }
        }
      }
    }

    const quizData = new Quiz({
      quizName,
      quizType,
      timer,
      questions,
    });

    await quizData.save();
    res.json({ message: "Quiz created successfully!" });
  } catch (error) {
    next(error);
  }
};

const editQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { timer, questions } = req.body;

    if (!quizId) {
      return res.status(400).json({ errorMessage: "Quiz ID is required!" });
    }

    if (!timer || !questions || questions.length === 0) {
      return res.status(400).json({ errorMessage: "All Fields are required!" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ failureMessage: "Quiz not found!" });
    }

    for (const question of questions) {
      if (
        !question.questionName ||
        !question.optionType ||
        !question.options ||
        question.options.length === 0
      ) {
        return res.status(400).json({
          errorMessage: "All questions must have required fields!",
        });
      }

      for (const option of question.options) {
        if (question.optionType === "text and image url") {
          if (!option.text || !option.imageUrl) {
            return res.status(400).json({
              errorMessage: "All options must have required fields!",
            });
          }
        } else {
          if (!option.text && !option.imageUrl) {
            return res.status(400).json({
              errorMessage: "All options must have required fields!",
            });
          }
        }
      }
    }

    quiz.timer = timer;
    quiz.questions = questions;

    await quiz.save();
    res.json({ message: "Quiz updated successfully!" });
  } catch (error) {
    next(error);
  }
};

const deleteQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    if (!quizId) {
      return res.status(400).json({ errorMessage: "Quiz ID is required!" });
    }

    const quiz = await Quiz.findByIdAndDelete(quizId);

    if (!quiz) {
      return res.status(404).json({ errorMessage: "Quiz not found!" });
    }

    res.json({ message: "Quiz deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

const getQuizById = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    if (!quizId) {
      return res.status(400).json({ errorMessage: "Quiz ID is required!" });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ errorMessage: "Quiz not found!" });
    }

    // Increment impressions
    quiz.impressions += 1;
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuiz,
  editQuiz,
  deleteQuiz,
  getQuizById,
};
