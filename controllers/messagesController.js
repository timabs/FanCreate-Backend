const mongoose = require("mongoose");
const Messagesbase = require("../models/MessagesModel");
const Conversationsbase = require("../models/ConversationsModel");

const createMessage = async (req, res) => {
  try {
    const { conversationId, messageObj } = req.body;
    const messageData = {
      conversationId,
      message: messageObj.message,
      senderId: messageObj.senderId,
      senderName: messageObj.senderName,
      date: messageObj.date,
      time: messageObj.time,
      pfp: messageObj.pfp,
      imgInMsg: messageObj.imgInMsg,
      replyingTo: messageObj.replyingTo,
    };
    const newMessage = await Messagesbase.create(messageData);
    await Conversationsbase.findByIdAndUpdate(conversationId, {
      $push: { messages: newMessage._id },
    });
    res.status(201).json({ messageData: newMessage });
  } catch (error) {
    res.status(500).json({ message: `Error creating message: ${error}` });
  }
};
const editMessage = async (req, res) => {
  try {
    const msgId = req.params.msgId;
    const { newMsgData } = req.body;
    const newMsg = {
      message: newMsgData,
    };
    const updatedMsg = await Messagesbase.findByIdAndUpdate(msgId, newMsg, {
      new: true,
    });
    res.status(201).json({ updatedMsg });
  } catch (error) {
    res.status(500).json({ message: `Error editing message: ${error}` });
  }
};
const editSender = async (req, res) => {
  try {
    const msgId = req.params.msgId;
    const { newSenderData } = req.body;
    const newSender = {
      senderId: newSenderData._id,
      senderName: newSenderData.senderName,
      phoneNumber: newSenderData.phoneNumber,
      pfp: newSenderData.pfp,
    };
    const updatedSender = await Messagesbase.findByIdAndUpdate(
      msgId,
      newSender,
      { new: true }
    );
    res.status(201).json({ updatedSender });
  } catch (error) {
    res.status(500).json({ message: `Error editing sender: ${error}` });
  }
};
const deleteMessage = async (req, res) => {
  try {
    const msgId = req.params.msgId;
    const conversationId = req.body.conversationId;
    const msgObjId = new mongoose.Types.ObjectId(msgId);
    const deletedMsg = await Messagesbase.findByIdAndDelete(msgObjId);
    const convoToDeleteMsgIn = await Conversationsbase.findByIdAndUpdate(
      conversationId,
      {
        $pull: { messages: msgObjId },
      }
    );
    res.status(200).json({ deletedMsg });
  } catch (error) {
    res.status(500).json({ message: `Error deleting message: ${error}` });
  }
};

const addEmojiReaction = async (req, res) => {
  try {
    const { msgId, emojiCode } = req.body;
    const msgToAddEmojiTo = await Messagesbase.findByIdAndUpdate(
      msgId,
      {
        emojiReact: emojiCode,
      },
      { new: true }
    );
    if (!msgToAddEmojiTo) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.status(200).json({ msgToAddEmojiTo });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error add emoji reaction to message: ${error}` });
  }
};

module.exports = {
  createMessage,
  editMessage,
  editSender,
  deleteMessage,
  addEmojiReaction,
};
