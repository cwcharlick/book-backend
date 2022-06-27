const addTryCatch = require('../middleware/async');
const auth = require('../middleware/auth');

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const _ = require('lodash');
const { BookingLog } = require('../models/bookingLog');
// ALWAYS NEED TO VALIDATE that the documents being accessed are their own. Maybe include restaurant id in auth...? or a new rest auth and have it in the req header? part of the JWT?
// Probably "isOwnedByAuthenticated()" method on each of the mongoose schemas, which checks the current jwt.

// All endpoints are basically good.
// All require Auth.
// Once statuses, users and restaurant collections are sorted:
// Put needs expanding for all booking fields (currently name only, rest is hard coded for easy testing).
// Post needs expanding for all booking fields (currently you only update name, for easy testing).
// Joi schema needs expanding.
// Mongoose model is just OK. Some good examples in there, could easily be expanded.

router.get(
  '/',
  auth,
  addTryCatch(async (req, res) => {
    const bookings = await BookingLog.find({
      restaurant: { _id: req.user.selectedRestaurant._id },
    });

    res.send(bookings);
  })
);

router.get(
  '/:id',
  auth,
  addTryCatch(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).send('Booking Id invalid.');

    const bookingLog = await BookingLog.findMany({
      _id: req.params.id,
      restaurant: { _id: req.user.selectedRestaurant._id },
    });

    if (!bookingLog)
      return res
        .status(404)
        .send('Booking logs with the given ID were not found');

    res.send(bookingLog);
  })
);

module.exports = router;
