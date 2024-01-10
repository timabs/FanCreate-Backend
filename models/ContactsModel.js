const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.Mixed,
    // ref: "User",
    required: true,
  },
  first: {
    type: String,
    required: true,
  },
  last: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  pfp: {
    type: String,
    //add default pfp
  },
  defaultTexter: {
    type: Boolean,
  },
});

module.exports = mongoose.model("ContactsModel", contactSchema, "Contacts");
