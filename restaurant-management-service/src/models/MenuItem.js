const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  id: String,
  restaurantId: String,
  name: String,
  price: Number,
  description: String,
  image: { type: String },
  available: { type: Boolean, default: true },
  category: {
    type: String,
    enum: ["appetizer", "main course", "dessert", "beverage"],
    required: true,
  },
  ingredients: { type: [String], required: true },
  dietaryRestrictions: {
    type: [String],
    enum: ["vegetarian", "vegan", "gluten-free", "nut-free"],
    default: [],
  },
});

module.exports = mongoose.model("MenuItem", menuSchema);
