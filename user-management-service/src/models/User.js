const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['customer', 'delivery_personnel', 'restaurant_admin', 'admin'] },
  location: {
    type: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    default: null,
  },
});

module.exports = mongoose.model('User', userSchema);