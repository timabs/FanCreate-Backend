const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConversationsModel",
    required: true,
  },
  message: {
    type: String,
  },
  senderId: String,
  senderName: String,
  date: Date,
  time: String,
  pfp: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  imgInMsg: String,
  replyingTo: Object,
  emojiReact: String,
});

module.exports = mongoose.model("MessagesModel", messageSchema, "Messages");
