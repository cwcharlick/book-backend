function superAdmin(req, res, next) {
  if (req.user.level !== "super_admin")
    return res.status(403).send("Access denied.");
  next();
}

module.exports = superAdmin;
