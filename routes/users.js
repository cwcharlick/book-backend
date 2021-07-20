const auth = require("../middleware/auth");
const superAdmin = require("../middleware/superAdmin");
const { User, validateUser } = require("../models/user.js");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const addTryCatch = require("../middleware/async");

router.post(
  "/",
  [auth, superAdmin],
  addTryCatch(async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });

    if (user)
      return res
        .status(400)
        .send("User with given email address already exists.");

    user = new User(
      _.pick(req.body, ["name", "restaurants", "level", "email", "password"])
    );

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    res.send(_.pick(user, ["id", "name", "email", "restaurants", "level"]));
  })
);

router.put(
  "/:id",
  [auth, superAdmin],
  addTryCatch(async (req, res) => {
    // req.body must be the full user, not just the bits you want to edit

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).send("Booking Id invalid.");

    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findById(req.params.id);
    if (!user) return res.status(400).send("User with request Id not found.");

    user.name = req.body.name;
    user.level = req.body.level;
    user.email = req.body.email;
    user.restaurants = req.body.restaurants;

    await user.save();

    res.send(user);
  })
);

// will need router.put("/me", auth, async (req, res)=>{}) for users to edit themselves

router.get(
  "/me",
  auth,
  addTryCatch(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    res.send(user);
  })
);

router.get(
  "/",
  [auth, superAdmin],
  addTryCatch(async (req, res) => {
    const users = await User.find();
    res.send(users);
  })
);

router.get(
  "/:id",
  [auth, superAdmin],
  addTryCatch(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).send("User Id invalid.");

    const user = await User.findById(req.params.id).populate(
      "restaurants",
      "name"
    );

    if (!user) return res.status(404).send("User with supplied Id not found");

    res.send(user);
  })
);

router.delete(
  "/:id",
  [auth, superAdmin],
  addTryCatch(async (req, res) => {
    // shouldnt ever delete a user... should anonymise really.
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).send("User Id invalid.");

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user)
      return res.status(404).send("User with the given Id was not found.");

    res.send(user);
  })
);

module.exports = router;
