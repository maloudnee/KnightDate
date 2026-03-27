const router = require('express').Router();
const User = require('../models/User');

router.post('/register-profile', async (req, res) => {
  const { username, firstName, lastName, email, age, major, bio } = req.body;

  // find existing user
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // update profile fields
  user.FirstName = firstName;
  user.LastName = lastName;
  user.Email = email;
  user.Age = age;
  user.Major = major;
  user.Bio = bio;

  await user.save();

  res.json({ message: "Profile updated" });
});

module.exports = router;