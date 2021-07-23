const auth = require("../middleware/auth");
const superAdmin = require("../middleware/superAdmin");
const { Restaurant, validateRestaurant } = require("../models/restaurant.js");
const express = require("express");
const router = express.Router();
const addTryCatch = require("../middleware/async");

router.post(
  "/",
  [auth, superAdmin],
  addTryCatch(async (req, res) => {
    const { error } = validateRestaurant(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const restaurant = new Restaurant({
      name: req.body.name,
    });

    const test = await restaurant.save();

    console.log(test);

    res.send(restaurant);
  })
);

// also probably need router.get("/me") when there is more info in restaurants

router.get(
  "/",
  [auth, superAdmin],
  addTryCatch(async (req, res) => {
    const restaurants = await Restaurant.find();
    res.send(restaurants);
  })
);

module.exports = router;
