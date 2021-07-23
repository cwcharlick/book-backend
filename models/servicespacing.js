const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const servicesPacingSchema = new Schema({
  restaurant: { type: ObjectId, ref: "Restaurant", required: true },
  name: String,
  services: [{ name: String, time: Number }],
});

const ServicesPacing = mongoose.model("ServicesPacing", servicesPacingSchema);

function validateServicesPacing(servicesPacing) {
  const schema = Joi.object({
    restaurant: Joi.objectId(),
    name: Joi.string(),
    services: Joi.array(),
  });

  return schema.validate(servicesPacing);
}

module.exports.ServicesPacing = ServicesPacing;
module.exports.validateServicesPacing = validateServicesPacing;
