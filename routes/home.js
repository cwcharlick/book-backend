const express = require("express");
const router = express.Router();
const config = require("config");

router.get("/", (req, res) => {
  res.render("index", {
    title: config.get("name"),
    message: "api docs to be written",
  });
});

module.exports = router;
