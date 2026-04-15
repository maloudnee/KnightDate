const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // Auth fields
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  Email: { type: String, required: true, unique: true},
  isVerified: { type: Boolean, default: false},

  // Profile fields
  FirstName: { type: String },
  LastName: { type: String },
  Age: { type: Number },
  Major: { type: String },
  Bio: { type: String },
  SexualOrientation: { type: String},
  Gender: { type: String},
  
  // Profile picture
  ProfilePicture: {
    type: String,
    default: "/default.png"
  },

  // Matching system
  InterestedIn: {type: [String], default: []}, // Gender type the user is interested in
  MinDatingAge: {type: Number, default: 18},
  MaxDatingAge: {type: Number, default: 100},
  Interests: {type: [String], default: []}, // Tags used to find matches

  Matches: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  LikedUsers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  DislikedUsers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }]


});

module.exports = mongoose.model("User", UserSchema);