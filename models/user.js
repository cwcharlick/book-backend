const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

// userSchema uses normalisation for it's restaurants relationships.

const userSchema = new Schema({
  name: { type: String, minlength: 3, required: true },
  restaurants: { type: [{ type: ObjectId, ref: "Restaurant" }], default: [] },
  level: {
    type: String,
    enum: ["user", "account_admin", "super_admin"],
    default: "user",
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 5, maxlength: 1024 },
});

userSchema.methods.generateAuthToken = function (select) {
  // users can only query their currently selected restaurant.
  // Selecting a restaurant is done with auth post "/:restId" route ...
  // ... or set automatically below if you only have access to one.

  let selectedRestaurant =
    this.restaurants.length === 1 ? this.restaurants[0] : null;

  if (select) selectedRestaurant = select;

  return jwt.sign(
    {
      _id: this._id,
      level: this.level,
      restaurants: this.restaurants,
      selectedRestaurant,
    },
    config.get("jwtPrivateKey")
  );
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    restaurants: Joi.array().items(Joi.objectId().required()),
    level: Joi.string().valid("user", "account_admin", "super_admin"),
    email: Joi.string().email().required(),
    password: Joi.string().max(255).required(),
  });

  return schema.validate(user);
}

module.exports.User = User;
module.exports.validateUser = validateUser;
