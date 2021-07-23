const auth = require("../middleware/auth");
const {
  PacingsSchedule,
  validatePacingsSchedule,
} = require("../models/pacingsschedule.js");
const express = require("express");
const router = express.Router();
const addTryCatch = require("../middleware/async");

router.post(
  "/",
  auth,
  addTryCatch(async (req, res) => {
    const { error } = validatePacingsSchedule(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const pacingsSchedule = new PacingsSchedule({
      restaurant: req.user.selectedRestaurant._id,
      name: req.body.name,
      servicesId: req.body.servicesId,
      maxPacing: req.body.maxPacing,
      defaultPacing: req.body.defaultPacing,
      pacings: req.body.pacings,
    });

    await pacingsSchedule.save();

    res.send(pacingsSchedule);
  })
);

// also probably need router.get("/me") when there is more info in restaurants

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
