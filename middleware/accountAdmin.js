function accountAdmin(req, res, next) {
  if (req.user.level !== "super_admin" || req.user.level !== "account_admin")
    return res.status(403).send("Access denied.");
  next();
}

module.exports = accountAdmin;
