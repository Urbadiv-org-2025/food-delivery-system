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
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    }
});

orderSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);