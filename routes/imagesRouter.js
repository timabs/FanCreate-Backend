const express = require("express");
const router = express.Router();
const {
  deleteImage,
  deliverChatScreenshot,
} = require("../controllers/imagesController");

router.route("/delete").post(deleteImage);
router.route("/screenshot").post(deliverChatScreenshot);
module.exports = router;
