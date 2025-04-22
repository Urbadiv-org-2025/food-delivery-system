const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    id: String,
    restaurantId: String,
    name: String,
    price: Number,
    description: String,
});

module.exports = mongoose.model('MenuItem', menuSchema);