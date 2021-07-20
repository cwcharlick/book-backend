const debug = require("debug")("app:startup:config");
const config = require("config");

// if the jwtPrivateKey is not set, exit.

module.exports = function (app) {
  const jwtPrivateKey = config.get("jwtPrivateKey");

  if (!jwtPrivateKey) {
    throw new Error("FATAL ERROR: jwtPrivateKey is not defined");
  }
  // bit of handy debugging info

  debug(`NODE_ENV: ${process.env.NODE_ENV}`);
  debug(`app: ${app.get("env")}`);
  debug("Application Name: " + config.get("name"));
};
