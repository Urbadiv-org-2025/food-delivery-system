const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  id: String,
  name: String,
  restaurantAdminId: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  image: { type: String },
  available: { type: Boolean, default: true },
  cuisine: {
    type: String,
    enum: [
      "Italian",
      "Chinese",
      "Indian",
      "Mexican",
      "American",
      "French",
      "Japanese",
      "Mediterranean",
      "Thai",
      "Spanish",
      "Srilankan",
    ],
    required: true,
  },
  rating: { type: Number, min: 0, max: 5 },
  reviews: { type: Number, default: 0 },
  openingHours: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: (props) => `${props.value} is not a valid time format!`,
    },
  },
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
