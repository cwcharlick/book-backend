const auth = require('../middleware/auth');
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

module.exports = router;
