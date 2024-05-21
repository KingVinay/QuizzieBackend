const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  isCorrect: {
    type: Boolean,
    default: false,
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

const quizSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: new Date(),
  },
  impressions: { type: Number, default: 0 }, //Impressions Count for Quiz
  totalSubmissions: { type: Number, default: 0 }, // Total submissions for Q&A
});

module.exports = mongoose.model("Quiz", quizSchema);
