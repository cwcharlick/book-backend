const addTryCatch = require("../middleware/async");
const auth = require("../middleware/auth");
const superAdmin = require("../middleware/superAdmin");
const { Booking, validateBooking } = require("../models/booking.js");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// ALWAYS NEED TO VALIDATE that the documents being accessed are their own. Maybe include restaurant id in auth...? or a new rest auth and have it in the req header? part of the JWT?
// Probably "isOwnedByAuthenticated()" method on each of the mongoose schemas, which checks the current jwt.

// All endpoints are basically good.
// All require Auth.
// Once statuses, users and restaurant collections are sorted:
// Put needs expanding for all booking fields (currently name only, rest is hard coded for easy testing).
// Post needs expanding for all booking fields (currently you only update name, for easy testing).
// Joi schema needs expanding.
// Mongoose model is just OK. Some good examples in there, could easily be expanded.

//update
router.put(
  "/:id",
  auth,
  addTryCatch(async (req, res) => {
    // Optional REFACTOR: change to findByIdAndUpdate so you send 1 instruction to the database instead of 2 (find and save).

    // Validate route.params.id

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).send("Booking Id invalid.");

    // Validate req.body from the client

    const { error } = validateBooking(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // look up course

    const booking = await Booking.findOne({
      _id: req.params.id,
      restaurant: { _id: req.user.selectedRestaurant._id },
    });
    if (!booking)
      return res.status(404).send("Booking with supplied Id not found");

    // update booking

    booking.name = req.body.name;

    await booking.save();

    // send result

    res.send(booking);
  })
);

router.get(
  "/",
  auth,
  addTryCatch(async (req, res) => {
    const bookings = await Booking.find({
      restaurant: { _id: req.user.selectedRestaurant._id },
    }).populate("restaurant", "name");

    res.send(bookings);
  })
);

router.get(
  "/:id",
  auth,
  addTryCatch(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).send("Booking Id invalid.");

    const booking = await Booking.findOne({
      _id: req.params.id,
      restaurant: { _id: req.user.selectedRestaurant._id },
    });

    if (!booking)
      return res.status(404).send("Booking with the given ID was not found");

    res.send(booking);
  })
);

//update
router.post(
  "/",
  auth,
  addTryCatch(async (req, res) => {
    const { error } = validateBooking(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // make sure user is posting to restaurant their jwt currently has selected
    if (req.body.restaurant !== req.user.selectedRestaurant)
      return res
        .status(401)
        .send("Unauthorised to post to restaurant with given id.");
    // hard coded a bunch of example booking data so you only need to send a name to test it.

    const booking = new Booking({
      restaurant: req.body.restaurant,
      time: 1200,
      table: [],
      phone: "07875292131",
      email: "christopherhasalongemailaddress@gmail.com",
      name: req.body.name,
      covers: 6,
      date: new Date(),
      default_turntime: true,
      turntime: 90,
      end_time: 1400,
      projected_end_time: 1400,
      usable_end_time: 1415,
      manual_end_time: 1415,
      table_assigned: false,
      statusesId: mongoose.Types.ObjectId(),
      statusId: mongoose.Types.ObjectId(),
      phase: 1,
      statusesDefault: true,
      status_changed: false,
      description:
        "Can I grab a table by the window? It's my birthday. I'm allergic to fish.",
      tags: [],
      history: [],
    });

    await booking.save();

    res.send(booking);
  })
);

router.delete(
  "/:id",
  [auth, superAdmin],
  addTryCatch(async (req, res) => {
    // shouldnt ever delete a booking when you can cancel
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).send("Booking Id invalid.");

    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking)
      res.status(404).send("Booking with the given Id was not found.");

    res.send(booking);
  })
);

module.exports = router;
