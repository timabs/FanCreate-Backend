const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.Mixed,
    // ref: "User",
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.Mixed,
    },
  ],
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MessagesModel",
    },
  ],
  groupChatName: {
    type: String,
    required: false,
  },
  groupChatPfp: {
    type: String,
    required: false,
  },
  sysDetails: {
    batteryLevel: {
      type: String,
      required: false,
    },
    time: {
      type: String,
      required: false,
    },
    wifi: {
      type: Number,
      required: false,
    },
    cellSignal: {
      type: Number,
      required: false,
    },
  },
  bgImg: {
    type: String,
    required: false,
  },
});

conversationSchema.path("participants").validate(function (participants) {
  if (participants.length > 0 && typeof participants[0] !== "object") {
    return false;
  }
  return true;
}, "Invalid participants array");

module.exports = mongoose.model(
  "ConversationsModel",
  conversationSchema,
  "Conversations"
);
