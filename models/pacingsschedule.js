const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const pacingsScheduleSchema = new Schema({
  restaurant: { type: ObjectId, ref: "Restaurant", required: true },
  name: String,
  servicesId: ObjectId,
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
    name: Joi.string(),
    servicesId: Joi.objectId(),
    maxPacing: Joi.number(),
    defaultPacing: Joi.number(),
    pacings: Joi.array(),
  });

  return schema.validate(pacingsSchedule);
}

module.exports.PacingsSchedule = PacingsSchedule;
module.exports.validatePacingsSchedule = validatePacingsSchedule;
