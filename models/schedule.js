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
      tablesIds: [{ time: Number, tablesId: ObjectId }],
      pacingsId: ObjectId,
      statusesId: ObjectId,
    },
  ],
});

const Schedule = mongoose.model("Schedule", scheduleSchema);

function validateSchedule(schedule) {
  const schema = Joi.object({
    restaurant: Joi.objectId(),
    name: Joi.string().required(),
    startDate: Joi.date().allow(null).required(),
    lastDate: Joi.date().allow(null).required(),
    length: Joi.number().allow(null).required(),
    days: Joi.array(
      Joi.object({
        _id: Joi.allow(),
        day: Joi.number(),
        tablesIds: Joi.array().required(),
        pacingsId: Joi.objectId(),
        statusesId: Joi.objectId(),
      })
    ).required(),
    _id: Joi.allow(),
    __v: Joi.allow(),
  });

  return schema.validate(schedule);
}

module.exports.Schedule = Schedule;
module.exports.validateSchedule = validateSchedule;
