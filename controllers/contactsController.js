const mongoose = require("mongoose");
const Contactsbase = require("../models/ContactsModel");

const getContacts = async (req, res) => {
  try {
    const userId = req.user
      ? new mongoose.Types.ObjectId(req.user._id)
      : req.userId;
    const contacts = await Contactsbase.find({ user: userId });
    res.status(201).json({ contacts });
  } catch (error) {
    res.status(500).json({ message: `Error fetching contacts: ${error}` });
  }
};
const createContact = async (req, res) => {
  try {
    //testing, using auth middleware. pls dont forget silly guy
    const userId = req.user
      ? new mongoose.Types.ObjectId(req.user._id)
      : req.userId;
    const { contact } = req.body;
    const contactData = {
      user: userId,
      first: contact.first,
      last: contact.last,
      phoneNumber: contact.phoneNumber,
      pfp: contact.pfp,
      defaultTexter: contact.defaultTexter,
    };
    const newContact = await Contactsbase.create(contactData);
    res.status(201).json({ contactData: newContact });
  } catch (error) {
    res.status(500).json({ message: `Error creating contact: ${error}` });
  }
};
const editContact = async (req, res) => {
  try {
    const { contactToEdit, newContactData } = req.body;
    const updatedContact = await Contactsbase.findByIdAndUpdate(
      contactToEdit._id,
      newContactData,
      { new: true }
    );
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: `Error updating contact: ${error}.` });
  }
};
const deleteContact = async (req, res) => {
  try {
    const { contactId } = req.body;
    const deletedContact = await Contactsbase.findByIdAndDelete(
      new mongoose.Types.ObjectId(contactId)
    );
    res.status(201).json({ deletedContact });
  } catch (error) {
    res.status(500).json({ message: `Error deleting contact: ${error}` });
  }
};
module.exports = {
  getContacts,
  createContact,
  editContact,
  deleteContact,
};
