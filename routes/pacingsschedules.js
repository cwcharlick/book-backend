const auth = require("../middleware/auth");
const {
  PacingsSchedule,
  validatePacingsSchedule,
} = require("../models/pacingsschedule.js");
const express = require("express");
const router = express.Router();
const addTryCatch = require("../middleware/async");
const mongoose = require("mongoose");

router.post(
  "/",
  auth,
  addTryCatch(async (req, res) => {
    const { error } = validatePacingsSchedule(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const pacingsSchedule = new PacingsSchedule({
      restaurant: req.user.selectedRestaurant._id,
      name: req.body.name,
      services: req.body.services,
      maxPacing: req.body.maxPacing,
      defaultPacing: req.body.defaultPacing,
      pacings: req.body.pacings,
    });

    await pacingsSchedule.save();

    res.send(pacingsSchedule);
  })
);

router.put(
  "/:id",
  auth,
  addTryCatch(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).send("PacingsSchedule Id invalid.");

    const { error } = validatePacingsSchedule(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const pacingsSchedule = await PacingsSchedule.findOne({
      _id: req.params.id,
      restaurant: { _id: req.user.selectedRestaurant._id },
    });
    if (!pacingsSchedule)
      return res.status(404).send("PacingsSchedule with supplied Id not found");

    pacingsSchedule.name = req.body.name;
    pacingsSchedule.services = req.body.services;
    pacingsSchedule.maxPacing = req.body.maxPacing;
    pacingsSchedule.defaultPacing = req.body.defaultPacing;
    pacingsSchedule.pacings = req.body.pacings;

    await pacingsSchedule.save();

    // send result

    res.send(pacingsSchedule);
  })
);

router.get(
  "/",
  auth,
  addTryCatch(async (req, res) => {
    const pacingsSchedules = await PacingsSchedule.find({
      restaurant: req.user.selectedRestaurant._id,
    });
    res.send(pacingsSchedules);
  })
);

module.exports = router;
