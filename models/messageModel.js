// models/messageModel.js

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String, required: true },
  seenByReiberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
