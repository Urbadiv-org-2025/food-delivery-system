const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    id: String,
    customerId: String,
    restaurantId: String,
    items: [{ name: String, price: Number, quantity: Number }],
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'canceled'],
        default: 'pending'
    },
    total: Number,
    paymentId: String,
});

module.exports = mongoose.model('Order', orderSchema);