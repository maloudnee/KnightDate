const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Adds target user to the current user's liked list
router.post("/like-user", async ( req, res ) => {
    const  { user, target } = req.body;
    try{
        const currentUser = await User.findOne({ username: user});
        const targetUser = await User.findOne({ username: target});
        if(!currentUser || !targetUser){
            return res.status(404).json({msg: "One or both users was not found"});
        }
        await User.updateOne(
            { username: currentUser.username },
            { $addToSet: { LikedUsers: targetUser.username}}
        );
        return res.status(200).json({msg: "Liked!"});
    } catch(err){
        res.status(500).json({msg: "Server error while liking"});
    }
});

// Checks if match between two users exists
router.post("/match-users", async ( req, res ) => {
    const { user, target } = req.body;
    try{
        const userA = await User.findOne({ username: user });
        const userB = await User.findOne({ username: target });

        if(!userA || !userB){
            return res.status(404).json({ msg: "One or both users was not found"});
        }
        const aLikesB = userA.LikedUsers.includes(userB.username);
        const bLikesA = userB.LikedUsers.includes(userA.username);
        if(aLikesB && bLikesA){
            await User.updateOne(
                { username: userA.username},
                { $addToSet: { Matches: userB.username }}
            );
            await User.updateOne(
                { username: userB.username},
                { $addToSet: { Matches: userA.username }}
            );
             return res.status(200).json({msg: "It's a match!", matched: true});
        }
        return res.status(200).json({msg: "Not a match", matched: false});
    } catch(err){
        res.status(500).json({msg: "Server error during matching"});
    }
});

module.exports = router;