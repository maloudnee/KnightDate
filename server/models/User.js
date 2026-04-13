const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // Auth fields
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Profile fields
  FirstName: { type: String },
  LastName: { type: String },
  Email: { type: String, required: true, unique: true},
  Age: { type: Number },
  Major: { type: String },
  Bio: { type: String },
  SexualOrientation: { type: String},
  Gender: { type: String},
  
  // Email Verification
  isVerified: { type: Boolean, default: false},
  

  // Profile picture
  ProfilePicture: {
    type: String,
    default: "/default.png"
  },

  // Matching system
  InterestedIn: {type: [String], default: []},
  Matches: { type: [String], default: [] },
  LikedUsers: { type: [String], default: [] }
});

module.exports = mongoose.model("User", UserSchema);