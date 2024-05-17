const User = require("../Models/user");
const bcrypt = require("bcrypt");

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

module.exports = {
  registerUser,
};
