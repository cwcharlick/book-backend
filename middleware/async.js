// can use express-async-errors to auto patch this without writing it on the handlers
// I havent for learning / readibility

module.exports = function addTryCatch(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (ex) {
      next(ex);
    }
  };
};
