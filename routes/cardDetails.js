const express = require('express');
const router = express.Router();
const addTryCatch = require('../middleware/async');

const config = require('config');
const STRIPE_SECRET_KEY = config.get('STRIPE_SECRET_KEY');
const stripe = require('stripe')(STRIPE_SECRET_KEY);

router.get(
  '/secret',
  addTryCatch(async (req, res) => {
    const customer = await stripe.customers.create();

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
    });

    res.send({ client_secret: setupIntent.client_secret });
  })
);

module.exports = router;
