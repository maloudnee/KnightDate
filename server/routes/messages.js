const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const Message = require("../models/Message");
const verifyJWT = require('../verifyJWT');

router.use(verifyJWT);

// SEND MESSAGE
router.post("/send", async (req, res) => {
  const { senderID, recieverID, messageText } = req.body;

  if (!senderID || !recieverID || !messageText) {
    return res.status(400).json({ message: "Missing fields" });
  }

  if (senderID === recieverID) {
    return res.status(400).json({ message: "Cannot send a message to yourself" });
  }
  
  const message = new Message({
    senderID,
    recieverID,
    messageText
  });

  await message.save();

  res.json({ message: "Message sent", data: message });
});

// GET CONVERSATION
router.get("/conversation/:userA/:userB", async (req, res) => {
  const { userA, userB } = req.params;

  const messages = await Message.find({
    $or: [
      { senderID: userA, recieverID: userB },
      { senderID: userB, recieverID: userA }
    ]
  })
    .populate("senderID", "username ProfilePicture")
    .populate("recieverID", "username ProfilePicture")
    .sort({ timestamp: 1 });

  res.json(messages);
});

// GET ALL CONVERSATIONS FOR A USER
router.get("/inbox/:userID", async (req, res) => {
  const { userID } = req.params;

  const userObjId = new mongoose.Types.ObjectId(userID);

  const inbox = await Message.aggregate([
    {
      $match: {
        $or: [
          { senderID: userObjId },
          { recieverID: userObjId }
        ]
      }
    },
    {
      $sort: { timestamp: -1 }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ["$senderID", userObjId] },
            "$recieverID",
            "$senderID"
          ]
        },
        lastMessage: { $first: "$messageText" },
        lastTimestamp: { $first: "$timestamp" }
      }
    }
  ]);

  await User.populate(inbox, {
    path: "_id",
    model: "User",
    select: "username ProfilePicture"
  });

  res.json(inbox);
});

module.exports = router;