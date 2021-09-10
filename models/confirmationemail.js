const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const confirmationEmailSchema = new Schema({
  booking: { type: ObjectId, ref: "Booking", required: true },
  restaurant: { type: ObjectId, ref: "Restaurant", required: true },
  expires: Date,
});

const ConfirmationEmail = mongoose.model(
  "ConfirmationEmail",
  confirmationEmailSchema
);

function validateConfirmationEmail(confirmationEmail) {
  const schema = Joi.object({
    booking: Joi.objectId(),
    restaurant: Joi.objectId(),
    expires: Joi.date(),
  });

  return schema.validate(confirmationEmail);
}

module.exports.ConfirmationEmail = ConfirmationEmail;
module.exports.validateConfirmationEmail = validateConfirmationEmail;
