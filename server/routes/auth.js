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

    const emailExists = await User.findOne({ email });
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

// Resend verification link for email
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ Email: email });
    if(!user) {
      return res.status(404).json({ msg: "No account found with this email." });
    }
    if(user.isVerified) {
      return res.status(404).json({msg: "This account is already verified."})
    }
    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h"}
    );
    const url = `${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}`;
    
    await transporter.sendMail({
      from: '"KnightDate Team" <noreply@knightdate.com>',
      to: email.trim(),
      subject: "New Verification Link",
      html: `<h3>Verify Your KnightDate Account</h3>
             <p>Use the link below to verify your account:</p>
             <a href="${url}">Click here to verify your account</a>`
    });

    res.json({ msg: "A new verification link has been sent to your email." });

  } catch (err) {
    console.error(err);
    res.status(500).json({msg: "Server error while resending email verification."});
  }
});

// Send password reset email
router.post("/forgot-password", async ( req, res ) => {
  const { email } = req.body;
  const user = await User.findOne({ Email: email });
  if(!user) return res.status(404).json({msg: "User not found."});
  try{
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {expiresIn: "1h"});
    const url = `${process.env.FRONTEND_PASSWORD_RESET_URL}/reset-password/${resetToken}`;
    
    await transporter.sendMail({
      to: email,
      subject: "KnightDate Password Reset",
      html: `<p>Click <a href="${url}">here</a> to reset your password. This link expires in 1 hour.</p>`
    });
    res.json({ msg: "Reset link sent!" });
  } catch (err){
    res.json({msg: "Server issue while sending password reset"});
  }
});

// Reset password
router.post("/reset-password/:token", async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
    res.json({ msg: "Password updated successfully!" });
  } catch (err) {
    res.status(400).json({ msg: "Link expired or invalid." });
  }
});

module.exports = router;