const express = require("express");
const { sendEmail } = require("../controllers/contactFormController");
const router = express.Router();

router.route("/").post(sendEmail);

module.exports = router;
