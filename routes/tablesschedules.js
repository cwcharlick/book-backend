const auth = require("../middleware/auth");
const {
  TablesSchedule,
  validateTablesSchedule,
} = require("../models/tablesSchedule.js");
const express = require("express");
const router = express.Router();
const addTryCatch = require("../middleware/async");

router.post(
  "/",
  auth,
  addTryCatch(async (req, res) => {
    const { error } = validateTablesSchedule(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const tablesSchedule = new TablesSchedule({
      restaurant: req.user.selectedRestaurant._id,
      name: req.body.name,
      tables: req.body.tables,
    });

    await tablesSchedule.save();

    res.send(tablesSchedule);
  })
);

// also probably need router.get("/me") when there is more info in restaurants

router.get(
  "/",
  auth,
  addTryCatch(async (req, res) => {
    const tablesSchedules = await TablesSchedule.find({
      restaurant: req.user.selectedRestaurant._id,
    });
    res.send(tablesSchedules);
  })
);

module.exports = router;
