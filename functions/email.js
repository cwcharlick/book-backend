const nodemailer = require('nodemailer');
const config = require('config');
const { ConfirmationEmail } = require('../models/publicStatus.js');

const EMAIL_ADDRESS = config.get('EMAIL_ADDRESS');
const EMAIL_PASSWORD = config.get('EMAIL_PASSWORD');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: EMAIL_ADDRESS, pass: EMAIL_PASSWORD },
});

function sendConfirmation(booking) {
  const confirmationEmail = createConfirmationEmail(booking);
  confirmationEmail.populate(restaurant);
  const mailOptions = {
    from: 'no-reply@simplyserve.io',
    to: booking.email,
    subject: 'Your booking @ ' + booking.restaurant.name,
    html:
      '<h1>Booking Confirmation</h1><p>Hi ' +
      booking.name +
      ",</p><p>Here's your booking confirmation for " +
      booking.covers +
      ' people at ' +
      booking.time +
      ' on ' +
      booking.date +
      '. If you need to make any alterations please give ' +
      restaurant.name +
      ' a call. If you need to cancel your booking, just <a href="www.simplyserve.io/cancel/' +
      booking._id +
      '/' +
      confirmationEmail._id +
      '">click here</a>.',
  };
  // return (  );
}

async function createConfirmationEmail(booking) {
  await ConfirmationEmail.deleteMany({ booking: booking._id });

  const confirmationEmail = new ConfirmationEmail({
    booking: booking._id,
    restaurant: booking.restaurant,
    expires: booking.date,
  });

  await confirmationEmail.save();

  return confirmationEmail;
}

export default sendConfirmation;
