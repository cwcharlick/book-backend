const express = require("express");
const error = require("../middleware/error");
const auth = require("../routes/auth");
const morgan = require("morgan");
const bookings = require("../routes/bookings");
const restaurants = require("../routes/restaurants");
const users = require("../routes/users");
const home = require("../routes/home");
const debug = require("debug")("app:startup:routes");

module.exports = function (app) {
  app.use(express.json()); // sets req.body to json object

  // use morgan for logging http requests. Morgan logs to console, but can log to file.
  // morgan slows the api, so only use for debugging
  app.get("env") === "development" &&
    app.use(morgan("tiny")) &&
    debug("Morgan enabled...");
  // routes

  app.use("/api/bookings", bookings);
  app.use("/api/restaurants", restaurants);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/", home);

  // catch any 500 errors

  app.use(error);
};
