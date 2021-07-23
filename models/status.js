const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

//list id's and validation is quick and lazy. Needs updating.

const statusSchema = new Schema({
  restaurant: { type: ObjectId, ref: "Restaurant", required: true },
  name: String,
  useAdvancedTurns: Boolean,
  turnTimeTotal: [{ tableSize: Number, time: Number }],
  list: [{ phase: Number, active: Number, name: String, icon: String }],
});

const Status = mongoose.model("Status", statusSchema);

function validateStatus(status) {
  const schema = Joi.object({
    restaurant: Joi.objectId(),
    name: Joi.string(),
    useAdvancedTurns: Joi.boolean(),
    turnTimeTotal: Joi.array(),
    list: Joi.array(),
  });

  return schema.validate(status);
}

module.exports.Status = Status;
module.exports.validateStatus = validateStatus;
