const mongoose = require("mongoose");

const activeConvSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.Mixed,
    // ref: "User",
    required: true,
  },
  activeConversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConversationsModel",
    required: true,
  },
});

module.exports = mongoose.model(
  "ActiveConvoModel",
  activeConvSchema,
  "ActiveConversation"
);
