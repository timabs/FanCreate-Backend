const mongoose = require("mongoose");
const Userbase = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require(`dotenv`).config();
const cloudinary = require("cloudinary").v2;
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = await Userbase.create({
      username,
      email,
      passwordHash: password,
    });
    const token = jwt.sign(
      {
        userData: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
    res.status(201).json({
      msg: `User created successfully`,
      user: { username: newUser.username, email: newUser.email },
      token,
    });
  } catch (error) {
    res.status(500).json({ msg: `Error creating user: ${error}` });
  }
};
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Userbase.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Incorrect username" });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    const token = jwt.sign(
      {
        userData: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.status(201).json({
      msg: `User logged in successfully `,
      user: { username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const validateToken = async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(400).send({ valid: false });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ valid: false });
    }
    res.json({ valid: true, userData: decoded.userData });
  });
};
//image hosting config with cloudinary
const getSignature = async (req, res) => {
  try {
    cloudinary.config({
      cloud_name: "fancreate",
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const sig = cloudinary.utils.api_sign_request(
      {
        timestamp,
      },
      cloudinary.config().api_secret
    );

    res
      .status(200)
      .json({ signature: sig, timestamp, apiKey: cloudinary.config().api_key });
  } catch (error) {
    res.status(500).json({ message: `Error getting signature: ${error}` });
  }
};
module.exports = {
  registerUser,
  loginUser,
  validateToken,
  getSignature,
};
