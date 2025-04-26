const express = require('express');
const axios = require('axios');
const kafka = require('../config/kafka');
const authenticate = require('../middleware/auth');
const restrictTo = require('../middleware/restrict');

const router = express.Router();
const producer = kafka.producer();

router.post('/users/register', async (req, res) => {
    try {
        await producer.connect();
        const userData = { ...req.body, id: Date.now().toString() };
        await producer.send({
            topic: 'user-events',
            messages: [{ value: JSON.stringify({ action: 'register', data: userData }) }],
        });
        await producer.disconnect();
        res.status(201).json({ message: 'User registration request sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:3001/api/login', req.body);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/users/:id', authenticate, restrictTo('admin'), async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:3001/api/users/${req.params.id}`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/menu', authenticate, restrictTo('restaurant_admin'), async (req, res) => {
    try {
        await producer.connect();
        const menuData = { ...req.body, restaurantId: req.user.id, id: Date.now().toString() };
        await producer.send({
            topic: 'menu-events',
            messages: [{ value: JSON.stringify({ action: 'create', data: menuData }) }],
        });
        await producer.disconnect();
        res.status(201).json({ message: 'Menu item creation request sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/menu/:id', authenticate, restrictTo('restaurant_admin'), async (req, res) => {
    try {
        await producer.connect();
        const menuData = { ...req.body, id: req.params.id, restaurantId: req.user.id };
        await producer.send({
            topic: 'menu-events',
            messages: [{ value: JSON.stringify({ action: 'update', data: menuData }) }],
        });
        await producer.disconnect();
        res.json({ message: 'Menu item update request sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/menu/:id', authenticate, restrictTo('restaurant_admin'), async (req, res) => {
    try {
        await producer.connect();
        const menuData = { id: req.params.id, restaurantId: req.user.id };
        await producer.send({
            topic: 'menu-events',
            messages: [{ value: JSON.stringify({ action: 'delete', data: menuData }) }],
        });
        await producer.disconnect();
        res.json({ message: 'Menu item deletion request sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/restaurants/:id/availability', authenticate, restrictTo('restaurant_admin'), async (req, res) => {
    try {
        await producer.connect();
        const availabilityData = { id: req.params.id, available: req.body.available };
        await producer.send({
            topic: 'restaurant-events',
            messages: [{ value: JSON.stringify({ action: 'update_availability', data: availabilityData }) }],
        });
        await producer.disconnect();
        res.json({ message: 'Restaurant availability update request sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/orders', authenticate, restrictTo('customer'), async (req, res) => {
    try {
        await producer.connect();
        const orderData = { ...req.body, customerId: req.user.id, id: Date.now().toString(), status: 'pending', email: req.user.email };
        await producer.send({
            topic: 'order-events',
            messages: [{ value: JSON.stringify({ action: 'create', data: orderData }) }],
        });
        await producer.disconnect();
        res.status(201).json({ message: 'Order creation request sent', orderId: orderData.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/orders/:id', authenticate, restrictTo('customer'), async (req, res) => {
    try {
        await producer.connect();
        const orderData = { ...req.body, id: req.params.id, customerId: req.user.id, email: req.user.email };
        await producer.send({
            topic: 'order-events',
            messages: [{ value: JSON.stringify({ action: 'update', data: orderData }) }],
        });
        await producer.disconnect();
        res.json({ message: 'Order update request sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/orders/:id', authenticate, restrictTo('customer'), async (req, res) => {
    try {
        await producer.connect();
        const orderData = { id: req.params.id, customerId: req.user.id, email: req.user.email };
        await producer.send({
            topic: 'order-events',
            messages: [{ value: JSON.stringify({ action: 'cancel', data: orderData }) }],
        });
        await producer.disconnect();
        res.json({ message: 'Order cancellation request sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/orders/:id/confirm', authenticate, restrictTo('customer'), async (req, res) => {
    try {
        const { paymentId, restaurantId } = req.body;
        if (!paymentId) {
            return res.status(400).json({ error: 'Payment ID required' });
        }
        await producer.connect();
        const orderData = { id: req.params.id, paymentId, restaurantId, orderId: req.params.id };
        // Trigger payment confirmation
        await producer.send({
            topic: 'payment-events',
            messages: [{ value: JSON.stringify({ action: 'confirm', data: { paymentId, orderId: req.params.id } }) }],
        });
        // Trigger order confirmation
        await producer.send({
            topic: 'order-events',
            messages: [{ value: JSON.stringify({ action: 'confirm', data: orderData }) }],
        });
        await producer.disconnect();
        res.json({ message: 'Order and payment confirmation request sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/orders/:id', authenticate, restrictTo('customer', 'restaurant_admin', 'delivery_personnel'), async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:3003/api/orders/${req.params.id}`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/orders/:id/prepare', authenticate, restrictTo('restaurant_admin'), async (req, res) => {
    try {
        await producer.connect();
        const orderData = { id: req.params.id, restaurantId: req.user.id, email: req.body.customerEmail };
        await producer.send({
            topic: 'order-events',
            messages: [{ value: JSON.stringify({ action: 'prepare', data: orderData }) }],
        });
        await producer.disconnect();
        res.json({ message: 'Order preparation request sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/orders/:id/ready', authenticate, restrictTo('restaurant_admin'), async (req, res) => {
    try {
        await producer.connect();
        const orderData = { id: req.params.id, restaurantId: req.user.id };
        await producer.send({
            topic: 'order-events',
            messages: [{ value: JSON.stringify({ action: 'ready', data: orderData }) }],
        });
        await producer.disconnect();
        res.json({ message: 'Order ready request sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/orders/:id/cancel', authenticate, restrictTo('restaurant_admin'), async (req, res) => {
    try {
        await producer.connect();
        const orderData = { id: req.params.id, restaurantId: req.user.id, email: req.body.customerEmail };
        await producer.send({
            topic: 'order-events',
            messages: [{ value: JSON.stringify({ action: 'cancel', data: orderData }) }],
        });
        await producer.disconnect();
        res.json({ message: 'Order cancellation request sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/orders/:id/deliver', authenticate, restrictTo('delivery_personnel'), async (req, res) => {
    try {
        await producer.connect();
        const orderData = { id: req.params.id, email: req.body.customerEmail };
        await producer.send({
            topic: 'order-events',
            messages: [{ value: JSON.stringify({ action: 'deliver', data: orderData }) }],
        });
        await producer.disconnect();
        res.json({ message: 'Order delivery request sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/orders', authenticate, restrictTo('customer'), async (req, res) => {
    try {
        const { status } = req.query;
        const response = await axios.get('http://localhost:3003/api/orders', {
            params: { customerId: req.user.id, status }
        });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delivery Management
router.post('/deliveries', authenticate, restrictTo('customer'), async (req, res) => {
    try {
        await producer.connect();
        const deliveryData = { ...req.body, orderId: req.body.orderId, id: Date.now().toString() };
        await producer.send({
            topic: 'delivery-events',
            messages: [{ value: JSON.stringify({ action: 'assign', data: deliveryData }) }],
        });
        await producer.disconnect();
        res.status(201).json({ message: 'Delivery assignment request sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/deliveries/:id', authenticate, restrictTo('customer', 'delivery_personnel'), async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:3004/api/deliveries/${req.params.id}`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/deliveries/:id/status', authenticate, restrictTo('delivery_personnel'), async (req, res) => {
    try {
        await producer.connect();
        const deliveryData = { id: req.params.id, status: req.body.status };
        await producer.send({
            topic: 'delivery-events',
            messages: [{ value: JSON.stringify({ action: 'update_status', data: deliveryData }) }],
        });
        await producer.disconnect();
        res.json({ message: 'Delivery status update request sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/payments', authenticate, restrictTo('customer'), async (req, res) => {
    try {
        console.log(req.body);
        const response = await axios.post('http://localhost:3005/api/payments', req.body);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/refunds', authenticate, restrictTo('restaurant_admin', 'admin'), async (req, res) => {
    try {
        const response = await axios.post('http://localhost:3005/api/refunds', req.body);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;