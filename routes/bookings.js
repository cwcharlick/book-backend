const addTryCatch = require('../middleware/async');
const auth = require('../middleware/auth');
const superAdmin = require('../middleware/superAdmin');
const {
  Booking,
  validateBooking,
  validatePublicBooking,
} = require('../models/booking.js');

const listener = require('../middleware/listener');
const { updateListeners } = require('../models/listener.js');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const _ = require('lodash');
const { BookingLog } = require('../models/bookingLog');
const { PublicStatus } = require('../models/publicStatus');
const { v4 } = require('uuid');
const { Status } = require('../models/status');
const nodemailer = require('nodemailer');

const config = require('config');
const { Restaurant } = require('../models/restaurant');
const EMAIL_ADDRESS = config.get('EMAIL_ADDRESS');
const EMAIL_PASSWORD = config.get('EMAIL_PASSWORD');

// async..await is not allowed in global scope, must use a wrapper
async function sendEmail(booking, confirmationCode) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: EMAIL_ADDRESS, // generated ethereal user
      pass: EMAIL_PASSWORD, // generated ethereal password
    },
  });
  let restaurant = await Restaurant.findById(booking.restaurant);
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `${restaurant.name} <no-reply@simplyserve.io>`, // sender address
    to: booking.email, // list of receivers
    subject: 'Booking Confirmation', // Subject line
    html: `<html><body>
      <h1>Booking Confirmation</h1>
      <p>Hi ${booking.name},</p>
      <p>Here's your booking confirmation for ${booking.covers} people at ${booking.time} on ${booking.date}.</p>
      <p>If you need to make any alterations please give ${restaurant.name} a call.</p>
      <p>If you need to cancel your booking, just <a href="book.simplyserve.io/cancel/${booking._id}/${booking.restaurant}/${confirmationCode}">click here</a>.</p>
      </body></html>`,
  });
}
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
  '/:id',
  [auth, listener],
  addTryCatch(async (req, res) => {
    // Optional REFACTOR: change to findByIdAndUpdate so you send 1 instruction to the database instead of 2 (find and save).

    // Validate route.params.id

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).send('Booking Id invalid.');

    // Validate req.body from the client

    const { error } = validateBooking(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // look up course

    const booking = await Booking.findOne({
      _id: req.params.id,
      restaurant: { _id: req.user.selectedRestaurant._id },
    });
    if (!booking)
      return res.status(404).send('Booking with supplied Id not found');

    // update booking

    booking.time = req.body.time;
    booking.table = req.body.table;
    booking.phone = req.body.phone;
    booking.email = req.body.email;
    booking.name = req.body.name;
    booking.covers = req.body.covers;
    booking.date = req.body.date;
    booking.default_turntime = req.body.default_turntime;
    booking.turntime = req.body.turntime;
    booking.end_time = req.body.end_time;
    booking.projected_end_time = req.body.projected_end_time;
    booking.usable_end_time = req.body.usable_end_time;
    booking.manual_end_time = req.body.manual_end_time;
    booking.table_assigned = req.body.table_assigned;
    booking.statusesId = req.body.statusesId;
    booking.statusId = req.body.statusId;
    booking.phase = req.body.phase;
    booking.statusesDefault = req.body.statusesDefault;
    booking.status_changed = req.body.status_changed;
    booking.description = req.body.description;
    booking.tags = req.body.tags;
    booking.history = req.body.history;

    await booking.save();

    // send result

    res.send(booking);

    updateListeners(
      req.user.selectedRestaurant._id,
      { booking: booking._id },
      req.listenerId
    );

    const initials = booking.initials ? booking.initials : '';

    const bookingLog = new BookingLog({
      booking: booking._id,
      restaurant: booking.restaurant,
      initials: initials,
      value: booking,
    });
    await bookingLog.save();
  })
);

// public update: cancel from conf email
router.put(
  '/public/:bookingId/:restId/:confCode',
  addTryCatch(async (req, res) => {
    // TODO: booking date & time check (is it too late to cancel)

    //
    // Optional REFACTOR: change to findByIdAndUpdate so you send 1 instruction to the database instead of 2 (find and save).

    // Validate route.params.id

    if (!mongoose.Types.ObjectId.isValid(req.params.bookingId))
      return res.status(400).send('Booking Id invalid.');
    if (!mongoose.Types.ObjectId.isValid(req.params.restId))
      return res.status(400).send('Booking Id invalid.');

    // look up course

    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      restaurant: req.params.restId,
    });
    if (!booking)
      return res.status(404).send('Booking with supplied Id not found');

    // find publicStatus to know what to update booking to

    const publicStatus = await PublicStatus.findOne({
      booking: req.params.bookingId,
      restaurant: req.params.restId,
      confirmationCode: req.params.confCode,
    });

    if (!publicStatus) return res.status(404).send('Confirmation code invalid');

    // update booking

    booking.statusId = publicStatus.toStatus;
    booking.phase = publicStatus.toPhase;
    booking.description =
      'User cancelled booking from email. ' + booking.description;

    await booking.save();

    // send result

    res.send(booking);

    updateListeners(req.params.restId, { booking: booking._id });

    const initials = booking.initials ? booking.initials : '';

    const bookingLog = new BookingLog({
      booking: booking._id,
      restaurant: booking.restaurant,
      initials: initials,
      value: booking,
    });
    await bookingLog.save();
  })
);

// date: { $lt: new Date(2022, 03, 01) }
router.get(
  '/',
  auth,
  addTryCatch(async (req, res) => {
    const today = new Date();
    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );

    const bookings = await Booking.find({
      restaurant: { _id: req.user.selectedRestaurant._id },
      date: { $gte: lastMonthStart },
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

    const booking = await Booking.findOne({
      _id: req.params.id,
      restaurant: { _id: req.user.selectedRestaurant._id },
    });

    if (!booking)
      return res.status(404).send('Booking with the given ID was not found');

    res.send(booking);
  })
);

router.get(
  '/public/:restId/:date',
  addTryCatch(async (req, res) => {
    //const today = new Date().setHours(0, 0, 0, 0);
    //let yesterday = new Date(today);

    //yesterday.setDate(yesterday.getDate() - 1);

    let bookings = await Booking.find({
      restaurant: req.params.restId,
      date: { $eq: req.params.date },
      phase: { $lt: 3 },
    });

    for (let i = 0; bookings.length > i; i++) {
      console.log(bookings, bookings[i]);
      bookings[i] = _.pick(bookings[i], [
        'time',
        'date',
        'table',
        'covers',
        'usable_end_time',
        'table_assigned',
        'phase',
      ]);
    }

    res.send(bookings);
  })
);

// public post route needs some authentication, probably from env variables. Perhaps all public routes do? or cors... or middleware.
router.post(
  '/public/',
  addTryCatch(async (req, res) => {
    const { error } = validatePublicBooking(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const booking = new Booking({
      restaurant: req.body.restaurant,
      time: req.body.time,
      table: [],
      phone: req.body.phone,
      email: req.body.email,
      name: req.body.name,
      covers: req.body.covers,
      date: req.body.date,
      default_turntime: true,
      turntime: req.body.turn_time,
      end_time: req.body.usable_end_time,
      projected_end_time: req.body.usable_end_time,
      usable_end_time: req.body.usable_end_time,
      manual_end_time: false,
      table_assigned: false,
      statusesId: req.body.statusesId,
      statusId: req.body.statusId,
      phase: 1,
      statusesDefault: true,
      status_changed: null,
      description: req.body.description,
      tags: [],
      history: req.body.history,
    });

    await booking.save();

    res.send(booking);
    updateListeners(req.body.restaurant, { booking: booking._id });

    const bookingLog = new BookingLog({
      booking: booking._id,
      restaurant: booking.restaurant,
      initials: '',
      value: booking,
    });
    await bookingLog.save();

    let statuses = await Status.findOne({
      restaurant: req.body.restaurant,
      _id: req.body.statusesId,
    });

    let status = statuses.list.find((s) => s.name === 'cancelled');

    const confirmationCode = v4();

    const publicStatus = new PublicStatus({
      booking: booking._id,
      restaurant: booking.restaurant,
      toStatus: status._id,
      toPhase: 3,
      confirmationCode,
    });

    await publicStatus.save();
    await sendEmail(booking, confirmationCode);
  })
);

router.post(
  '/',
  [auth, listener],
  addTryCatch(async (req, res) => {
    const { error } = validateBooking(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const booking = new Booking({
      restaurant: req.user.selectedRestaurant._id,
      initials: req.body.initials,
      time: req.body.time,
      table: req.body.table,
      phone: req.body.phone,
      email: req.body.email,
      name: req.body.name,
      covers: req.body.covers,
      date: req.body.date,
      default_turntime: req.body.default_turntime,
      turntime: req.body.turntime,
      end_time: req.body.end_time,
      projected_end_time: req.body.projected_end_time,
      usable_end_time: req.body.usable_end_time,
      manual_end_time: req.body.manual_end_time,
      table_assigned: req.body.table_assigned,
      statusesId: req.body.statusesId,
      statusId: req.body.statusId,
      phase: req.body.phase,
      statusesDefault: req.body.statusesDefault,
      status_changed: req.body.status_changed,
      description: req.body.description,
      tags: req.body.tags,
      history: req.body.history,
      walkIn: req.body.walkIn,
    });

    await booking.save();

    console.log('h', booking, req.body.initials);

    res.send(booking);
    updateListeners(
      req.user.selectedRestaurant._id,
      { booking: booking._id },
      req.listenerId
    );

    const initials = booking.initials ? booking.initials : '';

    const bookingLog = new BookingLog({
      booking: booking._id,
      restaurant: booking.restaurant,
      initials: initials,
      value: booking,
    });
    await bookingLog.save();
  })
);

router.delete(
  '/:id',
  [auth, superAdmin],
  addTryCatch(async (req, res) => {
    // shouldnt ever delete a booking when you can cancel
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).send('Booking Id invalid.');

    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking)
      res.status(404).send('Booking with the given Id was not found.');

    res.send(booking);
  })
);

module.exports = router;
