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

  // Validate all fields are provided
  if (!username || !password || !email) {
    return res.status(400).json({ msg: "Username, password, and email are required" });
  }

  // Validate field types
  if (typeof username !== 'string' || typeof password !== 'string' || typeof email !== 'string') {
    return res.status(400).json({ msg: "Username, password, and email must be strings" });
  }

  // Trim and validate non-empty
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();
  const trimmedEmail = email.trim();

  if (!trimmedUsername || !trimmedPassword || !trimmedEmail) {
    return res.status(400).json({ msg: "Fields cannot be empty" });
  }

  // Validate minimum lengths
  if (trimmedUsername.length < 3) {
    return res.status(400).json({ msg: "Username must be at least 3 characters" });
  }

  if (trimmedPassword.length < 6) {
    return res.status(400).json({ msg: "Password must be at least 6 characters" });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return res.status(400).json({ msg: "Please provide a valid email address" });
  }

  try {
    const userExists = await User.findOne({ username: trimmedUsername });
    if (userExists) return res.status(400).json({ msg: "Username is already taken" });

    const emailExists = await User.findOne({ Email: trimmedEmail });
    if (emailExists) return res.status(400).json({ msg: "Email is already taken" });

    const hashed = await bcrypt.hash(trimmedPassword, 10);

    // Create User
    const user = new User({
       username: trimmedUsername, 
       password: hashed, 
       Email: trimmedEmail
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
      to: trimmedEmail,
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
      res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
        
        :root {
            --font-sans: "Plus Jakarta Sans", sans-serif;
            --color-primary: #F2CC00;
            --color-background: #0A0A0A;
            --color-surface: #131313;
            --color-on-surface: #F5F5F5;
            --color-on-surface-variant: #D0C5AF;
        }

        body {
            background-color: var(--color-background);
            color: var(--color-on-surface);
            font-family: var(--font-sans);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }

        .gradient-gold {
            background: linear-gradient(135deg, #D4AF37 0%, #F2CC00 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .prestige-card {
            background-color: var(--color-surface);
            border: 1px solid rgba(212, 175, 55, 0.15);
            padding: 3rem;
            border-radius: 1.5rem;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .check-icon {
            color: var(--color-primary);
            font-size: 3rem;
            margin-bottom: 1.5rem;
        }
    </style>
</head>
<body>
    <div class="prestige-card">
        <div class="check-icon">✓</div>
        <h1 class="gradient-gold" style="font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem;">
            Email Verified
        </h1>
        <p style="color: var(--color-on-surface-variant); font-size: 1.1rem;">
            Your account is now active.
        </p>
        <div style="margin-top: 2rem; opacity: 0.8; font-size: 0.9rem;">
            You can safely close this tab and log in.
        </div>
    </div>
</body>
</html>`);
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

  // Validate all fields are provided
  if (!username || !password) {
    return res.status(400).json({ msg: "Username and password are required" });
  }

  // Validate field types
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ msg: "Username and password must be strings" });
  }

  // Trim and validate non-empty
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedPassword) {
    return res.status(400).json({ msg: "Username and password cannot be empty" });
  }

  try {
    const user = await User.findOne({ username: trimmedUsername });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    if(!user.isVerified){
      return res.status(401).json({msg: "Please verify your email before loggin in."});
    }

    const match = await bcrypt.compare(trimmedPassword, user.password);
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

  // Validate email is provided
  if (!email) {
    return res.status(400).json({ msg: "Email is required" });
  }

  // Validate email type
  if (typeof email !== 'string') {
    return res.status(400).json({ msg: "Email must be a string" });
  }

  // Trim and validate non-empty
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return res.status(400).json({ msg: "Email cannot be empty" });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return res.status(400).json({ msg: "Please provide a valid email address" });
  }

  try {
    const user = await User.findOne({ Email: trimmedEmail });
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
      to: trimmedEmail,
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

  // Validate email is provided
  if (!email) {
    return res.status(400).json({ msg: "Email is required" });
  }

  // Validate email type
  if (typeof email !== 'string') {
    return res.status(400).json({ msg: "Email must be a string" });
  }

  // Trim and validate non-empty
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return res.status(400).json({ msg: "Email cannot be empty" });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return res.status(400).json({ msg: "Please provide a valid email address" });
  }

  try {
    const user = await User.findOne({ Email: trimmedEmail });
    if(!user) return res.status(404).json({msg: "User not found."});
    
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {expiresIn: "1h"});
    const url = `${process.env.FRONTEND_PASSWORD_RESET_URL}/reset-password/${resetToken}`;
    
    await transporter.sendMail({
      to: trimmedEmail,
      subject: "KnightDate Password Reset",
      html: `<p>Click <a href="${url}">here</a> to reset your password. This link expires in 1 hour.</p>`
    });
    res.json({ msg: "Reset link sent!" });
  } catch (err){
    res.status(500).json({msg: "Server error while sending password reset"});
    console.error(err);
  }
});

// Reset password
router.post("/reset-password/:token", async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  // Validate password is provided
  if (!password) {
    return res.status(400).json({ msg: "Password is required" });
  }

  // Validate password type
  if (typeof password !== 'string') {
    return res.status(400).json({ msg: "Password must be a string" });
  }

  // Trim and validate non-empty
  const trimmedPassword = password.trim();

  if (!trimmedPassword) {
    return res.status(400).json({ msg: "Password cannot be empty" });
  }

  // Validate minimum length
  if (trimmedPassword.length < 6) {
    return res.status(400).json({ msg: "Password must be at least 6 characters" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
    res.json({ msg: "Password updated successfully!" });
  } catch (err) {
    res.status(400).json({ msg: "Link expired or invalid." });
  }
});

module.exports = router;