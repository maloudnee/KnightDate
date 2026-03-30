const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    senderID: { type: mongoose.Schema.Types.ObjectID, ref: 'User', required: true },
    recieverID: { type: mongoose.Schema.Types.ObjectID, ref: 'User', required: true },
    messageText: { type: String, required: True},
    timestamp: { type: Date, default: Date.now},
    isRead: { type: Boolean, default: false}
})

module.exports = mongoose.model("Message", MessageSchema);