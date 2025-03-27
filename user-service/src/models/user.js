const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: {
    type: String,
    enum: ['customer', 'restaurant_admin', 'delivery_personnel'],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);