const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    senderID: { type: mongoose.Schema.Types.ObjectID, ref: 'User', required: true },
    recieverID: { type: mongoose.Schema.Types.ObjectID, ref: 'User', required: true },
    messageText: { type: String, required: true},
    timestamp: { type: Date, default: Date.now},
})

module.exports = mongoose.model("Message", MessageSchema);