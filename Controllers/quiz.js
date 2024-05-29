const Quiz = require("../Models/quiz");

const createQuiz = async (req, res, next) => {
  try {
    const { quizName, quizType, questions } = req.body;

    if (!quizName || !quizType || !questions || questions.length === 0) {
      return res.status(400).json({ errorMessage: "All fields are required!" });
    }

    for (const question of questions) {
      if (
        !question.questionName ||
        !question.timer ||
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

    const createdBy = req.userId;

    const quizData = new Quiz({
      quizName,
      quizType,
      questions,
      createdBy,
      shareableLink: "",
    });

    const savedQuiz = await quizData.save();

    // Generate shareable link
    const shareableLink = `${process.env.FRONTEND_HOST}/quiz/${savedQuiz._id}`;
    savedQuiz.shareableLink = shareableLink;
    await savedQuiz.save();

    res.json({ message: "Quiz created successfully!", shareableLink });
  } catch (error) {
    next(error);
  }
};

const editQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { questions } = req.body;

    if (!quizId) {
      return res.status(400).json({ errorMessage: "Quiz ID is required!" });
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({ errorMessage: "All Fields are required!" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ failureMessage: "Quiz not found!" });
    }

    for (const question of questions) {
      if (
        !question.questionName ||
        !question.timer ||
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

const getAllQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.userId }).sort({
      impressions: -1,
    });
    res.json(quizzes);
  } catch (error) {
    next(error);
  }
};

const getQuizStatistics = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.userId });

    const totalQuizzes = quizzes.length;
    const totalQuestions = quizzes.reduce(
      (acc, quiz) => acc + quiz.questions.length,
      0
    );
    const totalImpressions = quizzes.reduce(
      (acc, quiz) => acc + (quiz.impressions || 0),
      0
    );

    res.json({
      totalQuizzes,
      totalQuestions,
      totalImpressions,
    });
  } catch (error) {
    next(error);
  }
};

const submitQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { responses } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ errorMessage: "Quiz not found!" });
    }

    const totalQuestions = quiz.questions.length;
    const correctQuestions = 0;

    quiz.totalSubmissions += 1;

    for (const response of responses) {
      const question = quiz.questions.id(response.questionId);
      if (!question) {
        continue; // Skip if the question is not found
      }

      if (quiz.quizType === "q&a") {
        const correctOption = question.options.find(
          (option) => option.isCorrect
        );
        const selectedOption = question.options.id(response.selectedOptionId);

        if (selectedOption && correctOption) {
          if (selectedOption._id.equals(correctOption._id)) {
            question.correctSubmissions += 1;
            correctQuestions += 1;
          } else {
            question.wrongSubmissions += 1;
          }
        }
      } else if (quiz.quizType === "poll") {
        const selectedOption = question.options.id(response.selectedOptionId);
        if (selectedOption) {
          selectedOption.selectedCount += 1;
        }
      }
    }

    await quiz.save();

    if (quiz.quizType === "poll") {
      return res.json({ message: "Quiz submitted successfully!" });
    }

    res.json({
      message: "Quiz submitted successfully!",
      correctQuestions,
      totalQuestions,
    });
  } catch (error) {
    next(error);
  }
};

const getQuizAnalytics = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ errorMessage: "Quiz not found!" });
    }

    const analytics = {
      quizName: quiz.quizName,
      quizType: quiz.quizType,
      createdAt: quiz.createdAt,
      impressions: quiz.impressions,
      totalSubmissions: quiz.totalSubmissions,
      questions: [],
    };

    if (quiz.quizType === "q&a") {
      analytics.questions = quiz.questions.map((question) => ({
        questionName: question.questionName,
        correctSubmissions: question.correctSubmissions,
        wrongSubmissions: question.wrongSubmissions,
      }));
    } else if (quiz.quizType === "poll") {
      analytics.questions = quiz.questions.map((question) => ({
        questionName: question.questionName,
        options: question.options.map((option) => ({
          selectedCount: option.selectedCount,
        })),
      }));
    }

    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

const shareQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({ _id: quizId, createdBy: req.userId });
    if (!quiz) {
      return res.status(404).json({ errorMessage: "Quiz not found!" });
    }

    res.json({ shareableLink: quiz.shareableLink });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuiz,
  editQuiz,
  deleteQuiz,
  getQuizById,
  getAllQuizzes,
  getQuizStatistics,
  submitQuiz,
  getQuizAnalytics,
  shareQuiz,
};
