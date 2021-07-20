const mongoose = require("mongoose");
const config = require("config");
const debug = require("debug")("app:startup:database");
const winston = require("winston");

module.exports = function () {
  // connect to mongodb

  const uri = config.get("mongo_uri");
  debug("uri: ", uri);

  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then(() => winston.info("Connected to MongoDB..."));
};
