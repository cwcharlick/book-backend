const Joi = require('joi');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const bookingLogSchema = new Schema({
  booking: { type: ObjectId, ref: 'Booking', required: true },
  restaurant: { type: ObjectId, ref: 'Restaurant', required: true },
  initials: { type: String, default: '' },
  value: {},
});

const BookingLog = mongoose.model('BookingLog', bookingLogSchema);

function validateBookingLog(bookingLog) {
  const schema = Joi.object({
    booking: Joi.objectId(),
    restaurant: Joi.objectId(),
    initials: Joi.String(),
    id: Joi.allow(),
    _id: Joi.allow(),
    __v: Joi.allow(),
  });

  return schema.validate(bookingLog);
}

module.exports.BookingLog = BookingLog;
module.exports.validateBookingLog = validateBookingLog;
