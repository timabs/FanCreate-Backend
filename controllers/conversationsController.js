const mongoose = require("mongoose");
const Conversationsbase = require("../models/ConversationsModel");
const ActiveConvobase = require("../models/ActiveConversationModel");
const Messagesbase = require("../models/MessagesModel");

const getAllConversations = async (req, res) => {
  try {
    const userId = req.user
      ? new mongoose.Types.ObjectId(req.user._id)
      : req.userId;
    const conversations = await Conversationsbase.find({ user: userId });
    res.status(200).json({ conversations });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};
const fetchMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }
    const conversationWithMessages = await Conversationsbase.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(conversationId) } },
      {
        $lookup: {
          from: "Messages", // the collection name of messages
          localField: "messages",
          foreignField: "_id",
          as: "fullMessages",
        },
      },
      { $unwind: "$fullMessages" },
      { $sort: { "fullMessages.createdAt": 1 } },
      {
        $group: {
          _id: "$_id",
          user: { $first: "$user" },
          participants: { $first: "$participants" },
          fullMessages: { $push: "$fullMessages" },
        },
      },
    ]);
    if (conversationWithMessages.length === 0) {
      return res.status(404).json({
        message: `No messages in conversation: ${conversationWithMessages.length}`,
      });
    }

    res.status(200).json(conversationWithMessages[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error retrieving conversation: ${error}` });
  }
};
const fetchActiveConvo = async (req, res) => {
  try {
    //query for testing
    const userId = req.user
      ? new mongoose.Types.ObjectId(req.user._id)
      : req.userId;
    const activeConvo = await ActiveConvobase.findOne({ userId: userId });
    res.status(200).json({ activeConvo });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching active conversation: ${error}` });
  }
};
const fetchActiveConvoUsers = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res
        .status(400)
        .json({ message: `Invalid conversation ID. Got: ${conversationId}` });
    }
    const conversationWithUsers = await Conversationsbase.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(conversationId) } },
      {
        $addFields: {
          lookupConvoUsers: {
            $map: {
              input: {
                $slice: ["$participants", 1, { $size: "$participants" }],
              },
              as: "participant",
              in: { $toObjectId: "$$participant" },
            },
          },
        },
      },
      {
        $lookup: {
          from: "Contacts",
          localField: "lookupConvoUsers",
          foreignField: "_id",
          as: "fullContacts",
        },
      },
    ]);
    res.status(200).json(conversationWithUsers[0]);
  } catch (error) {
    res.status(500).json({ message: `Error fetching participants: ${error}` });
  }
};
//eval creation of new conversation
const createNewConversation = async (req, res) => {
  try {
    //const userId = req.userId;
    //only for testing
    const userId = req.user
      ? new mongoose.Types.ObjectId(req.user._id)
      : req.userId;
    const { participants } = req.body;
    const conversationData = {
      user: userId,
      participants,
      messages: [],
    };
    const newConversation = await Conversationsbase.create(conversationData);
    res.status(201).json({ data: newConversation });
  } catch (error) {
    res.status(500).json({ message: `Error starting conversation: ${error}` });
  }
};
const deleteConvo = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const objectId = new mongoose.Types.ObjectId(conversationId);
    const deletedConvo = await Conversationsbase.findByIdAndDelete(objectId);
    const deleteActive = await ActiveConvobase.deleteOne({
      activeConversationId: objectId,
    });
    console.log(deleteActive);
    await Messagesbase.deleteMany({
      conversationId: objectId,
    });
    res.status(200).json({ deletedConvo });
  } catch (error) {
    res.status(500).json({ message: `Error deleting conversation: ${error}` });
  }
};
const setActiveConvo = async (req, res) => {
  const { conversationId } = req.body;
  const userId = req.user
    ? new mongoose.Types.ObjectId(req.user._id)
    : req.userId;
  try {
    const existingActive = await ActiveConvobase.findOne({ userId });
    if (existingActive) {
      existingActive.activeConversationId = conversationId;
      await existingActive.save();
      res.status(200).json({
        data: existingActive,
        message: "Active conversation updated successfully",
      });
    } else {
      const newActive = await ActiveConvobase.create({
        userId,
        activeConversationId: conversationId,
      });
      res.status(201).json({
        data: newActive,
        message: "Active conversation updated successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: `Error updating active conversation: ${error}`,
    });
  }
};
const addUserToConvo = async (req, res) => {
  try {
    const { conversationId, contact } = req.body;
    if (Array.isArray(contact)) {
      const contactIds = contact.map((c) => c._id);
      await Conversationsbase.findByIdAndUpdate(conversationId, {
        $push: { participants: { $each: contactIds } },
      });
    } else {
      await Conversationsbase.findByIdAndUpdate(conversationId, {
        $push: { participants: contact._id },
      });
    }
    res.status(201).json({
      contact,
      conversationId,
      message: "Contact added to conversation successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error adding contact to conversation: ${error}` });
  }
};
const deleteUserFromConvo = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const participantId = req.params.participantId;

    const messages = await Messagesbase.find({
      senderId: participantId,
    }).select("_id");
    const messageIds = messages.map((msg) => msg._id);

    await Messagesbase.deleteMany({
      senderId: participantId,
    });
    const deletedFromConvo = await Conversationsbase.findByIdAndUpdate(
      conversationId,
      {
        $pull: {
          messages: { $in: messageIds },
          participants: participantId,
        },
      }
    );

    res.status(201).json({ messageIds, deletedFromConvo, participantId });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error deleting user from conversation: ${error}` });
  }
};

const editGroupChatName = async (req, res) => {
  const conversationId = req.params.conversationId;
  const { gcName } = req.body;
  try {
    const editGc = await Conversationsbase.findByIdAndUpdate(
      conversationId,
      {
        groupChatName: gcName,
      },
      { new: true }
    );
    res
      .status(201)
      .json({ editGc, message: "Group chat name edited successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error editing group chat name: ${error}` });
  }
};

const editGroupChatPfp = async (req, res) => {
  const conversationId = req.params.conversationId;
  const { gcPfp } = req.body;
  try {
    const editGcPfp = await Conversationsbase.findByIdAndUpdate(
      conversationId,
      {
        groupChatPfp: gcPfp,
      },
      { new: true }
    );
    res.status(201).json({
      editGcPfp,
      message: "Group chat profile picture edited successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error editing group chat name: ${error}` });
  }
};

const updateSysDetails = async (req, res) => {
  const conversationId = req.params.conversationId;
  const { sysDetails } = req.body;
  try {
    const updatedDetails = await Conversationsbase.findByIdAndUpdate(
      conversationId,
      { sysDetails: sysDetails },
      { new: true }
    );
    res.status(201).json({
      updatedDetails,
      message: "system details edited successfully",
    });
  } catch (error) {
    res.status(500).json({ message: `Error editing system details: ${error}` });
  }
};

const updateBgImg = async (req, res) => {
  const conversationId = req.params.conversationId;
  const { bgImgLink } = req.body;
  try {
    const updatedBgImg = await Conversationsbase.findByIdAndUpdate(
      conversationId,
      { bgImg: bgImgLink },
      { new: true }
    );
    res.status(201).json({
      updatedBgImg,
      message: "Background image updated successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error updating background image: ${error}` });
  }
};

const deleteBgImg = async (req, res) => {
  const conversationId = req.params.conversationId;
  try {
    const result = await Conversationsbase.updateOne(
      { _id: conversationId },
      { $unset: { bgImg: "" } }
    );
    res.status(201).json({
      result,
      message: "Background image deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error deleting background image: ${error}` });
  }
};
module.exports = {
  getAllConversations,
  createNewConversation,
  deleteConvo,
  fetchActiveConvo,
  setActiveConvo,
  fetchMessages,
  fetchActiveConvoUsers,
  addUserToConvo,
  deleteUserFromConvo,
  editGroupChatName,
  editGroupChatPfp,
  updateSysDetails,
  updateBgImg,
  deleteBgImg,
};
