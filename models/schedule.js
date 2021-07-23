const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const scheduleSchema = new Schema({
  restaurant: { type: ObjectId, ref: "Restaurant", required: true },
  name: String,
  startDate: Date,
  lastDate: Date,
  length: Number,
  days: [
    {
      day: Number,
      tablesId: ObjectId,
      pacingsId: ObjectId,
      statusesId: ObjectId,
    },
  ],
});

const Schedule = mongoose.model("Schedule", scheduleSchema);

function validateSchedule(schedule) {
  const schema = Joi.object({
    restaurant: Joi.objectId(),
    name: Joi.string(),
    startDate: Joi.date().allow(null),
    lastDate: Joi.date().allow(null),
    length: Joi.number().allow(null),
    days: Joi.array(),
  });

  return schema.validate(schedule);
}

module.exports.Schedule = Schedule;
module.exports.validateSchedule = validateSchedule;
