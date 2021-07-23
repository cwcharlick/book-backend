const auth = require("../middleware/auth");
const {
  ServicesPacing,
  validateServicesPacing,
} = require("../models/servicesPacing.js");
const express = require("express");
const router = express.Router();
const addTryCatch = require("../middleware/async");

router.post(
  "/",
  auth,
  addTryCatch(async (req, res) => {
    const { error } = validateServicesPacing(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const servicesPacing = new ServicesPacing({
      restaurant: req.user.selectedRestaurant._id,
      name: req.body.name,
      services: req.body.services,
    });

    await servicesPacing.save();

    res.send(servicesPacing);
  })
);

// also probably need router.get("/me") when there is more info in restaurants

router.get(
  "/",
  auth,
  addTryCatch(async (req, res) => {
    const servicesPacings = await ServicesPacing.find({
      restaurant: req.user.selectedRestaurant._id,
    });
    res.send(servicesPacings);
  })
);

module.exports = router;
