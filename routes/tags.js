const auth = require("../middleware/auth");
const { Tag, validateTag } = require("../models/tag.js");
const { updateListeners } = require("../models/listener.js");
const express = require("express");
const router = express.Router();
const addTryCatch = require("../middleware/async");

router.post(
  "/",
  auth,
  addTryCatch(async (req, res) => {
    const { error } = validateTag(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const tag = new Tag({
      restaurant: req.user.selectedRestaurant._id,
      text: req.body.text,
      color: req.body.color,
    });

    await tag.save();

    res.send(tag);
    updateListeners(
      req.user.selectedRestaurant._id,
      { refreshRequired: true },
      req.listenerId
    );
  })
);

// also probably need router.get("/me") when there is more info in restaurants

router.get(
  "/",
  auth,
  addTryCatch(async (req, res) => {
    const tags = await Tag.find({
      restaurant: req.user.selectedRestaurant._id,
    });
    res.send(tags);
  })
);

module.exports = router;
