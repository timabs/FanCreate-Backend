const express = require("express");
const router = express.Router();
const {
  getAllConversations,
  createNewConversation,
  deleteConvo,
  setActiveConvo,
  fetchActiveConvo,
  fetchMessages,
  fetchActiveConvoUsers,
  addUserToConvo,
  deleteUserFromConvo,
  editGroupChatName,
  editGroupChatPfp,
  updateSysDetails,
} = require("../controllers/conversationsController");

router
  .route("/")
  .get(getAllConversations)
  .post(createNewConversation)
  .patch(addUserToConvo)
  .delete(deleteConvo);
router.route("/:conversationId").patch(editGroupChatName);
router.route("/:conversationId/pfp").patch(editGroupChatPfp);
router.route("/:conversationId/sys-details").patch(updateSysDetails);
router.route("/:conversationId/:participantId").delete(deleteUserFromConvo);
router.route("/:conversationId/messages").get(fetchMessages);
router.route("/setActive").get(fetchActiveConvo).post(setActiveConvo);
router.route("/:conversationId/users").get(fetchActiveConvoUsers);
module.exports = router;
