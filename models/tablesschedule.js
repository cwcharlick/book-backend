const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const tablesScheduleSchema = new Schema({
  restaurant: { type: ObjectId, ref: "Restaurant", required: true },
  name: String,
  tables: [
    {
      name: String,
      covers: Number,
      online: Boolean,
    },
  ],
});

const TablesSchedule = mongoose.model("TablesSchedule", tablesScheduleSchema);

function validateTablesSchedule(tablesSchedule) {
  const schema = Joi.object({
    restaurant: Joi.objectId(),
    name: Joi.string().required(),
    tables: Joi.array().required(),
    _id: Joi.allow(),
    __v: Joi.allow(),
  });

  return schema.validate(tablesSchedule);
}

module.exports.TablesSchedule = TablesSchedule;
module.exports.validateTablesSchedule = validateTablesSchedule;
