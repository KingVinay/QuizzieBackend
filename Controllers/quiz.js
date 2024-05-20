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
        !question.option ||
        question.option.length === 0
      ) {
        return res.status(400).json({
          errorMessage: "All questions must have required fields!",
        });
      }

      for (const option of question.option) {
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

module.exports = {
  createQuiz,
};
