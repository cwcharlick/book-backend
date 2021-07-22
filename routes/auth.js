const { User } = require("../models/user.js");
const { Restaurant } = require("../models/restaurant.js");
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const auth = require("../middleware/auth");
const addTryCatch = require("../middleware/async");

// JWT header will need current selected restaurant. If you only have access to one it's automatic. Otherwise when you select one you re-auth to set that header.

router.post(
  "/",
  addTryCatch(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email }).populate(
      "restaurants"
    );

    if (!user)
      return res.status(400).send("Incorrect email + password combination.");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(400).send("Incorrect email + password combination.");

    const token = user.generateAuthToken();

    res.send(token);
  })
);

// select a restaurant

router.post(
  "/:restId",
  auth,
  addTryCatch(async (req, res) => {
    // check if their jwt has access to this restaurant. If it doesnt we return 404 not found rather than 403 forbidden so this end point cannot be used to check for valid ids.

    if (
      (req.user.restaurants.filter(
        (rest) => rest.id === req.params.restId
      ).length = 0 && req.user.level !== "super_admin")
    )
      return res.status(404).send("Restaurant for given id not found.");

    // confirm restaurant with given id exists. Should be redundant as if it doesnt exist it shouldnt be in the users restaurants array.

    const restaurant = await Restaurant.findById(req.params.restId);
    if (!restaurant)
      return res.status(404).send("Restaurant for given id not found.");

    // grab the user to generate a new jwt with the header parameter set for the selected restaurant.

    const user = await User.findById(req.user._id).populate("restaurants");
    const token = user.generateAuthToken(restaurant);

    res.send(token);
  })
);

function validate(user) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().max(255).required(),
  });

  return schema.validate(user);
}

module.exports = router;
