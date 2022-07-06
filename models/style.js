const Joi = require('joi');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const styleSchema = new Schema({
  restaurant: { type: ObjectId, ref: 'Restaurant', required: true },
  logoUrl: String,
  logoStyle: Object,
  homeUrl: String,
  colors: Object,
  phone: String,
});

const Style = mongoose.model('Style', styleSchema);

function validateStyle(Style) {
  const schema = Joi.object({
    restaurant: Joi.objectId(),
    logoUrl: Joi.string(),
    logoStyle: Joi.object(),
    homeUrl: Joi.string(),
    colors: Joi.object(),
    phone: Joi.string(),
  });

  return schema.validate(Style);
}

module.exports.Style = Style;
module.exports.validateStyle = validateStyle;
