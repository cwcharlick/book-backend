const auth = require('../middleware/auth');
const superAdmin = require('../middleware/superAdmin');
const { Style, validateStyle } = require('../models/style.js');
const express = require('express');
const router = express.Router();
const addTryCatch = require('../middleware/async');

router.get(
  '/public/:restId',
  addTryCatch(async (req, res) => {
    const styles = await Style.find({
      restaurant: req.params.restId,
    });
    res.send(styles);
  })
);

router.post(
  '/',
  [auth, superAdmin],
  addTryCatch(async (req, res) => {
    const { error } = validateStyle(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const style = new Style({
      restaurant: req.user.selectedRestaurant._id,
      logoUrl: req.body.logoUrl,
      logoStyle: req.body.logoStyle,
      homeUrl: req.body.homeUrl,
      colors: req.body.colors,
      phone: req.body.phone,
    });

    await style.save();

    res.send(style);
  })
);

module.exports = router;
