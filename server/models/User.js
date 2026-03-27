const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // Auth fields
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Profile fields
  FirstName: { type: String },
  LastName: { type: String },
  Email: { type: String },
  Age: { type: Number },
  Major: { type: String },
  Bio: { type: String },

  // Matching system
  Matches: { type: [String], default: [] },
  LikedUsers: { type: [String], default: [] }
});

module.exports = mongoose.model("User", UserSchema);