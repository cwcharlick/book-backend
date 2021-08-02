const auth = require("../middleware/auth");
const {
  TablesSchedule,
  validateTablesSchedule,
} = require("../models/tablesschedule.js");
const express = require("express");
const router = express.Router();
const addTryCatch = require("../middleware/async");
const mongoose = require("mongoose");

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

router.put(
  "/:id",
  auth,
  addTryCatch(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).send("TablesSchedule Id invalid.");

    const { error } = validateTablesSchedule(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const tablesSchedule = await TablesSchedule.findOne({
      _id: req.params.id,
      restaurant: { _id: req.user.selectedRestaurant._id },
    });
    if (!tablesSchedule)
      return res.status(404).send("TablesSchedule with supplied Id not found");

    tablesSchedule.name = req.body.name;
    tablesSchedule.tables = req.body.tables;

    await tablesSchedule.save();

    // send result

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

router.get(
  "/public/:restId",
  addTryCatch(async (req, res) => {
    const tables = await TablesSchedule.find({
      restaurant: req.params.restId,
    });
    res.send(tables);
  })
);

module.exports = router;
