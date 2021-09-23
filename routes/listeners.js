const auth = require("../middleware/auth");
const listener = require("../middleware/listener");
const { Listener, validateListener } = require("../models/listener.js");
const express = require("express");
const router = express.Router();
const addTryCatch = require("../middleware/async");

router.post(
  "/",
  auth,
  addTryCatch(async (req, res) => {
    const user = {
      user: req.user._id,
      restaurant: req.user.selectedRestaurant._id,
    };

    const { error } = validateListener(user);
    if (error) return res.status(400).send(error.details[0].message);

    // register a new entry
    const listener = new Listener({
      restaurant: req.user.selectedRestaurant._id,
      user: req.user._id,
      lastCheckIn: new Date(),
      refreshRequired: false,
    });

    await listener.save();

    res.send(listener);
  })
);

router.get(
  "/",
  [auth, listener],
  addTryCatch(async (req, res) => {
    const listener = await Listener.findById(req.listenerId).populate(
      "bookings"
    );

    // this is a checkin, so update it to now.

    listener.lastCheckIn = new Date();

    // send the document to the user

    res.send(listener);

    // wipe all the changes, so next checkin it's only new stuff.

    listener.bookings = [];
    listener.refreshRequired = false;
    listener.save();
  })
);

module.exports = router;
