const mongoose = require("mongoose");
const User = mongoose.model("User");
const sha256 = require("js-sha256");
const jwt = require("jwt-then");
const {validationResult} = require("express-validator")

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }
    
  const { username, email, password, confirmPassword} = req.body;

  if (password === confirmPassword) {
    
    const userExists = await User.findOne({
      email,
    });

    if (userExists) throw "User with same email already exits.";

    const user = new User({
      username,
      email,
      password: sha256(password + process.env.SALT),
    });

    await user.save();

    res.json({
      message: "User [" + username + "] registered successfully!",
    });
  }else{
    res.json({
      message: "confirmPassword is empty",
    })
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
    password: sha256(password + process.env.SALT),
  });

  if (!user) throw "Email and Password did not match.";

  const secret = process.env.SECRET;

  const token = await jwt.sign({ id: user.id }, secret);

  res.json({
    message: "User logged in successfully!",
    token,
  });
};