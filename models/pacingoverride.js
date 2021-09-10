const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const pacingOverrideSchema = new Schema({
  restaurant: { type: ObjectId, ref: "Restaurant", required: true },
  date: { type: Date, required: true },
  time: { type: Number, required: true },
  max: { type: Number, required: true },
});

const PacingOverride = mongoose.model("PacingOverride", pacingOverrideSchema);

function validatePacingOverride(pacingOverride) {
  const schema = Joi.object({
    restaurant: Joi.objectId(),
    date: Joi.date().required(),
    time: Joi.number().required(),
    max: Joi.number().required(),
    _id: Joi.allow(),
    __v: Joi.allow(),
  });

  return schema.validate(pacingOverride);
}

module.exports.PacingOverride = PacingOverride;
module.exports.validatePacingOverride = validatePacingOverride;
