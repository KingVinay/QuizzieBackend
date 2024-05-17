const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const authRoute = require("./Routes/auth");

// express parser
app.use(express.json());

const PORT = process.env.PORT;

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("DB Connected!"))
  .catch((err) => console.log("DB Failed to Connect!", err));

app.get("/api/health", (req, res) => {
  console.log("hey health!");
  res.json({
    service: "Quizzie Server",
    status: "active",
    time: new Date(),
  });
});

// Middleware
app.use("/api/auth", authRoute);

// Middleware for Error
app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).json({ errorMessage: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Quizzie Server is running at ${PORT}`);
});
