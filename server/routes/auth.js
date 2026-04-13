const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ msg: "Username is already taken" });

    const emailExists = await User.findOne({ Email });
    if (emailExists) return res.status(400).json({ msg: "Email is already taken" });

    const hashed = await bcrypt.hash(password, 10);

    // Create User
    const user = new User({
       username, 
       password: hashed, 
       Email: email
      });
    await user.save();
    console.log("User saved to database:", user.collection.name);
    console.log("Database in use:", mongoose.connection.name);

    // Create verification token
    const verificationToken = jwt.sign(
      { id: user._id},
      process.env.JWT_SECRET,
      {expiresIn: "1h"}
    );

    const url = `${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}`;
     // Send the email
    await transporter.sendMail({
      from: '"KnightDate Team" <noreply@knightdate.com>',
      to: email.trim(),
      subject: "Verify Your Account",
      html: `<h3>Welcome to KnightDate!</h3>
         <p>Please verify your email by clicking on the link provided:</p>
         <a href="${url}">Click here to verify your account</a>`
        
    });

    res.json({ msg: "Registered! Please verify your account using the link sent to your email's inbox." });
  } catch (err) {
    res.status(500).json({ msg: "Server error during registering" });
    console.error(err);
  }
});

// Verification link
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const updatedUser = await User.findByIdAndUpdate(decoded.id, { isVerified: true});
    if(updatedUser){
      res.send("<h1>Email Verified!<h1><p>You can close this tab and log in</p>");
    } else {
      res.status(404).send("User not found.");
    }
  } catch{
    res.status(400).send("Invalid or expired token.");
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    if(!user.isVerified){
      return res.status(401).json({msg: "Please verify your email before loggin in."});
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;