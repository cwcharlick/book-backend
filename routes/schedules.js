const auth = require("../middleware/auth");
const { Schedule, validateSchedule } = require("../models/schedule.js");
const express = require("express");
const router = express.Router();
const addTryCatch = require("../middleware/async");

router.post(
  "/",
  auth,
  addTryCatch(async (req, res) => {
    const { error } = validateSchedule(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const schedule = new Schedule({
      restaurant: req.user.selectedRestaurant._id,
      name: req.body.name,
      startDate: req.body.startDate,
      lastDate: req.body.lastDate,
      length: req.body.length,
      days: req.body.days,
    });

    await schedule.save();

    res.send(schedule);
  })
);

// also probably need router.get("/me") when there is more info in restaurants

router.get(
  "/",
  auth,
  addTryCatch(async (req, res) => {
    const schedules = await Schedule.find({
      restaurant: req.user.selectedRestaurant._id,
    });
    res.send(schedules);
  })
);

module.exports = router;
