const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    validate: {
      validator: function (value) {
        const parentQuiz = this.ownerDocument();
        if (
          parentQuiz.optionType === "text" ||
          parentQuiz.optionType === "text and image url"
        ) {
          return value != null && value.trim() !== "";
        }
      },
      message: "Text is required for text or both option types.",
    },
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function (value) {
        const parentQuiz = this.ownerDocument();
        if (
          parentQuiz.optionType === "image url" ||
          parentQuiz.optionType === "text and image url"
        ) {
          return value != null && value.trim() !== "";
        }
      },
      message: "Image URL is required for image or both option types.",
    },
  },
  isCorrect: {
    type: Boolean,
    default: false,
    validate: {
      validator: function (value) {
        const parentQuiz = this.ownerDocument().ownerDocument();
        return parentQuiz.quizType !== "poll" || value === undefined;
      },
      message: "Correct answer should not be specified for polls.",
    },
  },
  selectedCount: { type: Number, default: 0 }, // For poll statistics
});

const questionSchema = new mongoose.Schema({
  questionName: {
    type: String,
    required: true,
  },
  optionType: {
    type: String,
    enum: ["text", "image url", "text and image url"],
    required: true,
  },
  options: [optionSchema],
  correctSubmissions: { type: Number, default: 0 }, // For Q&A statistics
  wrongSubmissions: { type: Number, default: 0 }, // For Q&A statistics
});

const quizSchema = new mongoose.Schema(
  {
    quizName: {
      type: String,
      required: true,
    },
    quizType: {
      type: String,
      enum: ["poll", "q&a"],
      required: true,
    },
    timer: {
      type: String,
      enum: ["none", "5s", "10s"],
      default: "none",
    },
    questions: [questionSchema],
    totalSubmissions: { type: Number, default: 0 }, // Total submissions for Q&A
  },
  // to record time of creation and updation of quiz
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("Quiz", quizSchema);
