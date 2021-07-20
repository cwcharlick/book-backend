const winston = require("winston");

module.exports = function () {
  // catch and log errors outside the routes
  const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.simple(),
      winston.format.json(),
      winston.format.prettyPrint()
    ),
    defaultMeta: { service: "user-service" },
    transports: [
      new winston.transports.File({ filename: "logfile.log", level: "info" }),
      new winston.transports.Console({ colorize: true, prettyPrint: true }),
    ],
  });

  winston.add(logger);

  process.on("uncaughtException", (ex) => {
    console.log("!!! Uncaught Exception", ex);
    logger.error(ex.message, ex, () => {
      process.exit(1);
    });
  });

  process.on("unhandledRejection", (ex) => {
    console.log("!!! Unhandled Rejection");
    logger.error(ex.message, ex, () => {
      process.exit(1);
    });
  });
};
