const express = require("express");

const validateRefererMiddleware = (req, res, next) => {
  const referer = req.get("Referer");
  if (!referer || !referer.startsWith("https://yourdomain.com")) {
    return res.status(403).send("Security Check Failed");
  }
  next();
};

module.exports = validateRefererMiddleware;
