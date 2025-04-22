const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    id: String,
    name: String,
    available: { type: Boolean, default: true },
});

module.exports = mongoose.model('Restaurant', restaurantSchema);