const auth = require('../middleware/auth');
const {
  PacingOverride,
  validatePacingOverride,
} = require('../models/pacingoverride.js');
const { updateListeners } = require('../models/listener.js');
const express = require('express');
const router = express.Router();
const addTryCatch = require('../middleware/async');

router.post(
  '/',
  auth,
  addTryCatch(async (req, res) => {
    const { error } = validatePacingOverride(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const pacingOverride = new PacingOverride({
      restaurant: req.user.selectedRestaurant._id,
      date: req.body.date,
      time: req.body.time,
      max: req.body.max,
    });

    const compareDate = new Date(req.body.date);

    await PacingOverride.deleteMany({
      restaurant: req.user.selectedRestaurant._id,
      date: compareDate,
      time: req.body.time,
    });

    await pacingOverride.save();

    res.send(pacingOverride);
    updateListeners(
      req.user.selectedRestaurant._id,
      { refreshRequired: true },
      req.listenerId
    );
  })
);

// also probably need router.get("/me") when there is more info in restaurants

router.get(
  '/',
  auth,
  addTryCatch(async (req, res) => {
    const pacingOverrides = await PacingOverride.find({
      restaurant: req.user.selectedRestaurant._id,
    });
    res.send(pacingOverrides);
  })
);

router.get(
  '/public/:restId',
  addTryCatch(async (req, res) => {
    const pacingOverrides = await PacingOverride.find({
      restaurant: req.params.restId,
    });
    res.send(pacingOverrides);
  })
);

module.exports = router;
