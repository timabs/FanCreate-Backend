const express = require("express");
const router = express.Router();
const {
  getContacts,
  createContact,
  editContact,
  deleteContact,
} = require("../controllers/contactsController");

router.route("/").get(getContacts).post(createContact).patch(editContact);
router.route("/delete").post(deleteContact);
module.exports = router;
