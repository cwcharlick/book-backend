const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
  name: { type: String, minlength: 3, unique: true },
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

function validateRestaurant(restaurant) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
  });

  return schema.validate(restaurant);
}

module.exports.Restaurant = Restaurant;
module.exports.validateRestaurant = validateRestaurant;
