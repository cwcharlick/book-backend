const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const listenerSchema = new Schema({
  restaurant: { type: ObjectId, ref: "Restaurant", required: true },
  user: { type: ObjectId, ref: "User", required: true },
  bookings: [{ type: ObjectId, ref: "Booking" }],
  lastCheckIn: { type: Date, default: new Date() },
  refreshRequired: { type: Boolean, default: false },
});

const Listener = mongoose.model("Listener", listenerSchema);

function validateListener(listener) {
  const schema = Joi.object({
    restaurant: Joi.objectId().required(),
    user: Joi.objectId().required(),
    bookings: Joi.array(),
    lastCheckIn: Joi.allow(),
    refreshRequired: Joi.boolean(),
  });

  return schema.validate(listener);
}

async function expireListeners() {
  //delete any listeners that havent been checked in within 5 minutes

  await Listener.deleteMany({
    lastCheckIn: {
      $lt: new Date(new Date().getTime() - 48 * 60 * 60 * 1000).toISOString(),
    },
  });
}

async function updateListeners(restaurant, data, excludeId) {
  console.log("called");
  if (data.booking) {
    await Listener.updateMany(
      {
        _id: { $ne: excludeId },
        restaurant: restaurant,
      },
      {
        $push: {
          bookings: data.booking,
        },
      }
    );
  }
  if (data.refreshRequired) {
    await Listener.updateMany(
      {
        _id: { $ne: excludeId },
        restaurant: restaurant,
      },
      {
        refreshRequired: true,
      }
    );
  }
}

module.exports.Listener = Listener;
module.exports.validateListener = validateListener;
module.exports.expireListeners = expireListeners;
module.exports.updateListeners = updateListeners;
