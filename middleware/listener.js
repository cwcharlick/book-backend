const { Listener } = require("../models/listener.js");

async function listener(req, res, next) {
  try {
    const listenerId = req.header("x-listener-id");

    // for now reject any requests to listener-required routes. Require relog.

    const listener = await Listener.findById(listenerId);

    if (!listener)
      return res
        .status(400)
        .send(
          "No valid listener supplied. You may be out of sync with the database, and must relog before performing any database altering actions."
        );

    req.listenerId = listenerId;
    console.log("hello");
    next();
  } catch (error) {
    res
      .status(400)
      .send(
        "No valid listener supplied. You may be out of sync with the database, and must relog before performing any database altering actions."
      );
  }
}

module.exports = listener;
