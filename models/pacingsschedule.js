const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const pacingsScheduleSchema = new Schema({
  restaurant: { type: ObjectId, ref: "Restaurant", required: true },
  name: String,
  services: Array,
  maxPacing: Number,
  defaultPacing: Number,
  pacings: [{ time: Number, max: Number, booked: Number }],
});

const PacingsSchedule = mongoose.model(
  "PacingsSchedule",
  pacingsScheduleSchema
);

function validatePacingsSchedule(pacingsSchedule) {
  const schema = Joi.object({
    restaurant: Joi.objectId(),
    name: Joi.string().required(),
    services: Joi.array().required(),
    maxPacing: Joi.number().required(),
    defaultPacing: Joi.number().required(),
    pacings: Joi.array().required(),
    _id: Joi.allow(),
    __v: Joi.allow(),
  });

  return schema.validate(pacingsSchedule);
}

module.exports.PacingsSchedule = PacingsSchedule;
module.exports.validatePacingsSchedule = validatePacingsSchedule;
