//user modified status. Onclick = cancel, for example.

const Joi = require('joi');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const publicStatusSchema = new Schema({
  booking: { type: ObjectId, ref: 'Booking', required: true },
  restaurant: { type: ObjectId, ref: 'Restaurant', required: true },
  toStatus: String,
  toPhase: Number,
  confirmationCode: String,
});

const PublicStatus = mongoose.model('PublicStatus', publicStatusSchema);

function validatePublicStatus(publicStatus) {
  const schema = Joi.object({
    booking: Joi.objectId(),
    restaurant: Joi.objectId(),
    toStatus: Joi.string(),
    toPhase: Joi.number(),
    confirmationCode: Joi.string(),
  });

  return schema.validate(publicStatus);
}

module.exports.PublicStatus = PublicStatus;
module.exports.validatePublicStatus = validatePublicStatus;
