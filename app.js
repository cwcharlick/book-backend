const winston = require("winston");
const express = require("express");
const app = express();
const cors = require("cors");
const { expireListeners } = require("./models/listener.js");

// defining a templating engine to return html markup to the client instead of json. Not really needed for a restful API but I'll use it for the "/" endpoint for quick reference documentation
app.set("view engine", "pug");
app.set("views", "./views"); //this is the default
// urlencoded if you need form data (key value pairs).
// static if you need to parse static files

// bug: Logging (winston) isnt logging errors on app startup, but does log properly after then (eg 500 route errors)
// using throw new Error("oops");
app.use(cors());
require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/database")();
require("./startup/config")(app);
require("./startup/validation")();
require("./startup/prod")(app);
// port to listen on. 3000 is default.
//winston.error("test");
const tidyListeners = setInterval(expireListeners, 60000);

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  winston.info(`Listening on port ${port}...`);
});

module.exports = server;
