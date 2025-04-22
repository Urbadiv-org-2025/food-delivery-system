const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    id: String,
    orderId: String,
    driverId: String,
    status: { type: String, enum: ['assigned', 'in_transit', 'delivered'], default: 'assigned' },
});

module.exports = mongoose.model('Delivery', deliverySchema);