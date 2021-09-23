const auth = require("../middleware/auth");
const { Schedule, validateSchedule } = require("../models/schedule.js");
const { updateListeners } = require("../models/listener.js");
const express = require("express");
const router = express.Router();
const addTryCatch = require("../middleware/async");
const mongoose = require("mongoose");

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
    updateListeners(
      req.user.selectedRestaurant._id,
      { refreshRequired: true },
      req.listenerId
    );
  })
);

router.put(
  "/:id",
  auth,
  addTryCatch(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).send("Schedule Id invalid.");

    const { error } = validateSchedule(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // look up course

    const schedule = await Schedule.findOne({
      _id: req.params.id,
      restaurant: { _id: req.user.selectedRestaurant._id },
    });
    if (!schedule)
      return res.status(404).send("Schedule with supplied Id not found");

    // update booking

    schedule.name = req.body.name;
    schedule.startDate = req.body.startDate;
    schedule.lastDate = req.body.lastDate;
    schedule.length = req.body.length;
    schedule.days = req.body.days;

    await schedule.save();

    // send result

    res.send(schedule);
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
    const schedules = await Schedule.find({
      restaurant: req.user.selectedRestaurant._id,
    });
    res.send(schedules);
  })
);

router.get(
  "/public/:restId",
  addTryCatch(async (req, res) => {
    const schedules = await Schedule.find({
      restaurant: req.params.restId,
    });
    res.send(schedules);
  })
);

module.exports = router;
