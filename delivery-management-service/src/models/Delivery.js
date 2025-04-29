const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    id: String,
    orderId: String,
    driverId: String,
    status: { type: String, enum: ['assigned', 'in_transit', 'delivered'], default: 'assigned' },
    startLocation: {
        longitude: { type: Number, required: true },
        latitude: { type: Number, required: true }
    },
    endLocation: {
        longitude: { type: Number, required: true },
        latitude: { type: Number, required: true }
    }
});

module.exports = mongoose.model('Delivery', deliverySchema);