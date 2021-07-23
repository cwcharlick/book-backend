const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const tagSchema = new Schema({
  restaurant: { type: ObjectId, ref: "Restaurant", required: true },
  text: String,
  color: String,
});

const Tag = mongoose.model("Tag", tagSchema);

function validateTag(tag) {
  const schema = Joi.object({
    restaurant: Joi.objectId(),
    text: Joi.string(),
    color: Joi.string(),
  });

  return schema.validate(tag);
}

module.exports.Tag = Tag;
module.exports.validateTag = validateTag;
