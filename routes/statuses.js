const auth = require("../middleware/auth");
const { Status, validateStatus } = require("../models/status.js");
const express = require("express");
const router = express.Router();
const addTryCatch = require("../middleware/async");

//list id's and validation is quick and lazy. Needs updating.

router.post(
  "/",
  auth,
  addTryCatch(async (req, res) => {
    const { error } = validateStatus(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const status = new Status({
      restaurant: req.user.selectedRestaurant._id,
      name: req.body.name,
      useAdvancedTurns: req.body.useAdvancedTurns,
      turnTimeTotal: req.body.turnTimeTotal,
      list: req.body.list,
    });

    await status.save();

    res.send(status);
  })
);

// also probably need router.get("/me") when there is more info in restaurants

router.get(
  "/",
  auth,
  addTryCatch(async (req, res) => {
    const statuses = await Status.find({
      restaurant: req.user.selectedRestaurant._id,
    });
    res.send(statuses);
  })
);

router.get(
  "/public/:restId",
  addTryCatch(async (req, res) => {
    const statuses = await Status.find({
      restaurant: req.params.restId,
    });
    res.send(statuses);
  })
);

module.exports = router;
