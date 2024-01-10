const express = require("express");
const router = express.Router();
const {
  createMessage,
  editMessage,
  editSender,
  deleteMessage,
  addEmojiReaction,
} = require("../controllers/messagesController");

router.route("/").post(createMessage);
router.route("/:msgId").patch(editMessage).delete(deleteMessage);
router.route("/:msgId/sender").patch(editSender);
router.route("/emoji").post(addEmojiReaction);
module.exports = router;
