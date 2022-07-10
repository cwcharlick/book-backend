const Joi = require('joi');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

function toCapitalise(str) {
  let result = str.toLowerCase().split(' ');

  for (let i = 0; i < result.length; i++) {
    result[i] = result[i][0].toUpperCase() + result[i].substring(1);
  }

  result = result.join(' ');

  return result;
}

const bookingSchema = new Schema(
  {
    restaurant: { type: ObjectId, ref: 'Restaurant', required: true },
    time: { type: Number, minlength: 4, maxlength: 4, required: true },
    table: {
      type: [String],
      default: [],
      required: true,
      validate: {
        validator: function (v) {
          return (
            (this.table_assigned && v && v.length > 0) || !this.table_assigned
          );
        },
        message:
          'Validation error: Manually assigned booking without a specified table.',
      },
    },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    name: {
      type: String,
      minlength: 3,
      maxlength: 255,
      required: true,
      get: (v) => toCapitalise(v),
      set: (v) => toCapitalise(v),
    },
    covers: { type: Number, minlength: 1, maxlength: 3, required: true },
    date: { type: Date, required: true },
    default_turntime: { type: Boolean, default: true, required: true },
    turntime: { type: Number, required: true },
    end_time: { type: Number, minlength: 4, maxlength: 4, required: true },
    projected_end_time: {
      type: Number,
      minlength: 4,
      maxlength: 4,
      required: true,
    },
    usable_end_time: {
      type: Number,
      minlength: 4,
      maxlength: 4,
      required: true,
    },
    manual_end_time: mongoose.Mixed,
    table_assigned: { type: Boolean, default: false, required: true },
    statusesId: { type: ObjectId, required: true },
    statusId: { type: ObjectId, required: true },
    phase: { type: Number, required: true },
    statusesDefault: { type: Boolean, default: true, required: true },
    status_changed: { type: Date, default: null },
    description: { type: String, default: '' },
    tags: { type: [ObjectId], default: [], required: true },
    history: {
      type: [{ statusId: ObjectId, date: Date, phase: Number }],
      default: [],
      required: true,
    },
    walkIn: { type: Boolean, default: false },
  },
  {
    toJSON: {
      getters: true,
    },
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

function validateBooking(booking) {
  const schema = Joi.object({
    restaurant: Joi.objectId(),
    time: Joi.number(),
    table: Joi.array(),
    phone: Joi.string().allow(''),
    email: Joi.string().allow(''),
    name: Joi.string().min(3).required(),
    covers: Joi.number(),
    date: Joi.date(),
    default_turntime: Joi.boolean(),
    turntime: Joi.number(),
    end_time: Joi.number(),
    projected_end_time: Joi.number(),
    usable_end_time: Joi.number(),
    manual_end_time: Joi.number().allow(false),
    table_assigned: Joi.boolean(),
    statusesId: Joi.objectId(),
    statusId: Joi.objectId(),
    phase: Joi.number(),
    statusesDefault: Joi.boolean(),
    status_changed: Joi.date().allow(null),
    description: Joi.string().allow(''),
    tags: Joi.array(),
    history: Joi.array(),
    walkIn: Joi.allow(),
    initials: Joi.string().allow(null).allow(''),
    id: Joi.allow(),
    _id: Joi.allow(),
    __v: Joi.allow(),
  });

  return schema.validate(booking);
}
function validatePublicBooking(booking) {
  const schema = Joi.object({
    restaurant: Joi.objectId().required(),
    time: Joi.number().required(),
    phone: Joi.number().required(),
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
    covers: Joi.number().required(),
    date: Joi.date().required(),
    turn_time: Joi.number().required(),
    statusesId: Joi.objectId().required(),
    statusId: Joi.objectId().required(),
    history: Joi.array().required(),
    usable_end_time: Joi.number().required(),
  });

  return schema.validate(booking);
}

module.exports.Booking = Booking;
module.exports.validateBooking = validateBooking;
module.exports.validatePublicBooking = validatePublicBooking;
