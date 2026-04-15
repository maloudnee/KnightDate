const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const verifyJWT = require("../verifyJWT");

router.use(verifyJWT);

// Adds target user to the current user's liked list
router.post("/like-user", async ( req, res ) => {
    const  { targetID } = req.body;
    const userID = req.user;
    try{ 
        const targetUser = await User.findById(targetID);
        
        if(!targetUser){
            return res.status(404).json({msg: "Target user was not found"});
        }
        await User.updateOne(
            { _id: userID },
            { $addToSet: { LikedUsers: targetUser._id}}
        );
        return res.status(200).json({msg: "Liked!"});
    } catch(err){
        console.error("Error Details:", err.stack);
        res.status(500).json({msg: "Server error while liking"});
    }
});

router.post("/dislike-user", async ( req, res ) => {
    const  { targetID } = req.body;
    const userID = req.user;
    try{ 
        const targetUser = await User.findById(targetID);
        
        if(!targetUser){
            return res.status(404).json({msg: "Target user was not found"});
        }
        await User.updateOne(
            { _id: userID },
            { $addToSet: { DislikedUsers: targetUser._id}}
        );
        return res.status(200).json({msg: "Disliked"});
    } catch(err){
        console.error("Error Details:", err.stack);
        res.status(500).json({msg: "Server error while disliking"});
    }
});

// Checks if match between two users exists
router.post("/match-users", async ( req, res ) => {
    const { targetID } = req.body;
    const userID = req.user;
    try{
        const currentUser = await User.findById(userID);
        const targetUser = await User.findById( targetID );

        if(!targetUser || !currentUser){
            return res.status(404).json({ msg: "One or both users not found"});
        }
        const currentUserLikesTarget = currentUser.LikedUsers.map(id => id.toString()).includes(targetID);
        const targetUserLikesCurrent = targetUser.LikedUsers.map(id => id.toString()).includes(userID);

        if(currentUserLikesTarget && targetUserLikesCurrent){
            await User.updateOne(
                { _id: userID},
                { $addToSet: { Matches: targetID }}
            );
            await User.updateOne(
                { _id: targetID},
                { $addToSet: { Matches: userID }}
            );
             return res.status(200).json({msg: "It's a match!", matched: true});
        }
        return res.status(200).json({msg: "Not a match", matched: false});
    } catch(err){
        console.error("Error Details:", err.stack);
        res.status(500).json({msg: "Server error during matching"});
    }
});

//Discover people (not working yet)
router.post("/discover", async (req, res ) => {
    const userID = req.user;
    try{
        const user = await User.findById( userID );
        if(!user){
            return res.status(404).json({msg: "User not found"});
        }
        // Set soft specifications to filter out potential matches
        const query = {
            _id: {
                $ne: userID,
                $nin: [...user.LikedUsers, ...user.DislikedUsers, ...user.Matches]
            },
            Age: { $gte: user.MinDatingAge, $lte: user.MaxDatingAge },
            Gender: { $in: user.InterestedIn }
        };
        let potentialMatches = await User.find(query);
        potentialMatches = potentialMatches.map(match => {

            const sharedInterests = potentialMatch.Interests.filter(
                interest => user.Interests.includes(interest)
            );
            return {
                ...potentialMatch._doc,
                score: sharedInterests.length
            };
        });
        potentialMatches.sort((a, b) => b.score - a.score);
        res.json(potentialMatches.slice(0,10));

    } catch (err){
        console.error("Error Details:", err.stack);
        res.status(500).json({msg: "Server error during discovery"});
    }
});

module.exports = router;