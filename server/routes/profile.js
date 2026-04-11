const router = require('express').Router();
const User = require('../models/User');
const multer = require("multer");
const verifyJWT = require('../verifyJWT');

router.use(verifyJWT);

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// UPDATE PROFILE
router.post('/register-profile', async (req, res) => {
  const { username, firstName, lastName, email, age, major, bio, sexualOrientation, gender } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: "User not found" });

  // update profile fields
  user.FirstName = firstName;
  user.LastName = lastName;
  user.Email = email;
  user.Age = age;
  user.Major = major;
  user.Bio = bio;
  user.SexualOrientation = sexualOrientation;
  user.Gender = gender;

  await user.save();

  res.json({ message: "Profile updated" });
});

// GET PROFILE
router.get('/:username', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
});

// UPLOAD PROFILE PICTURE
router.post("/upload-picture", upload.single("profilePicture"), async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: "User not found" });

  user.ProfilePicture = `/uploads/${req.file.filename}`;
  await user.save();

  res.json({ message: "Profile picture updated", path: user.ProfilePicture });
});

module.exports = router;