const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

function toCapitalise(str) {
  let result = str.toLowerCase().split(" ");

  for (let i = 0; i < result.length; i++) {
    result[i] = result[i][0].toUpperCase() + result[i].substring(1);
  }

  result = result.join(" ");

  return result;
}

const bookingSchema = new Schema(
  {
    restaurant: { type: ObjectId, ref: "Restaurant", required: true },
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
          "Validation error: Manually assigned booking without a specified table.",
      },
    },
    phone: { type: String, default: "", required: true },
    email: { type: String, default: "", required: true },
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
    manual_end_time: {
      type: Number,
      minlength: 4,
      maxlength: 4,
      required: true,
    },
    table_assigned: { type: Boolean, default: false, required: true },
    statusesId: { type: ObjectId, required: true },
    statusId: { type: ObjectId, required: true },
    phase: { type: Number, required: true },
    statusesDefault: { type: Boolean, default: true, required: true },
    status_changed: { type: Boolean, default: false, required: true },
    description: { type: String, default: "", required: true },
    tags: { type: [ObjectId], default: [], required: true },
    history: {
      type: [{ statusId: ObjectId, date: Date }],
      default: [],
      required: true,
    },
  },
  {
    toJSON: {
      getters: true,
    },
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

function validateBooking(booking) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    restaurant: Joi.objectId(),
  });

  return schema.validate(booking);
}

module.exports.Booking = Booking;
module.exports.validateBooking = validateBooking;
