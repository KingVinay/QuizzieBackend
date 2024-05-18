const User = require("../Models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register User API (with user data and password encryption)
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ errorMessage: "Bad Request!: Enter All Credentials" });
    }

    const isExistingEmail = await User.findOne({ email: email });
    if (isExistingEmail) {
      return res.status(409).json({ errorMessage: "Email already exists!" });
    }

    if (password !== confirmPassword) {
      return res.status(401).json({ errorMessage: "Password doesn't match" });
    }

    // password hashing using bcrypt module for password encryption
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = new User({
      name,
      email,
      password: hashedPassword,
    });

    await userData.save();

    res.json({ message: "User Registered Successfully!" });
  } catch (error) {
    next(error);
  }
};

// Login User API (User Details check and Password Match with JWT token generation)

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        errorMessage: "Bad Request! : Enter Both Credentials",
      });
    }
    const userDetails = await User.findOne({ email: email });
    if (!userDetails) {
      return res.status(401).json({ errorMessage: "User Doesn't Exist!" });
    }
    const isPasswordMatch = await bcrypt.compare(
      password,
      userDetails.password
    );
    if (!isPasswordMatch) {
      return res.status(401).json({ errorMessage: "Invalid Credentials" });
    }

    const token = jwt.sign(
      {
        userId: userDetails._id,
        email: userDetails.email,
      },
      process.env.SECRET_CODE,
      { expiresIn: "2d" }
    );

    res.json({
      Message: "User Logged In Successfully!",
      token: token,
      name: userDetails.name,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
