const express = require("express");
const router = express.Router();
const {
  registerUser,
  validateToken,
  loginUser,
  getSignature,
} = require("../controllers/authController");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/validate-token").post(validateToken);
router.route("/signature").get(getSignature);

module.exports = router;
