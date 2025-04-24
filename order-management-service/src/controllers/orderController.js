const kafka = require('../config/kafka');
const Order = require('../models/Order');
const connectDB = require('../config/db');

connectDB();

const consumer = kafka.consumer({ groupId: 'order-group' });
const producer = kafka.producer();

/**
 * Consumes order-related events from Kafka and processes them
 */
const runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'order-events', fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ message }) => {
            const { action, data } = JSON.parse(message.value);
            if (action === 'create') {
                const order = new Order({
                    id: data.id,
                    customerId: data.customerId,
                    restaurantId: data.restaurantId,
                    items: data.items,
                    status: 'pending',
                    total: data.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
                });
                await order.save();
                console.log(`Order created: ${data.id}`);
                await sendNotification('notify_customer', { orderId: data.id, email: data.email, message: 'Order placed successfully. Please complete payment.' });
            } else if (action === 'confirm') {
                if (!data.paymentId) {
                    console.log(`Order ${data.id} cannot be confirmed; no payment ID provided`);
                    return;
                }
                const order = await Order.findOne({ id: data.id });
                if (order.status !== 'pending') {
                    console.log(`Order ${data.id} cannot be confirmed; status is ${order.status}`);
                    return;
                }
                await Order.updateOne({ id: data.id }, { status: 'confirmed', paymentId: data.paymentId });
                console.log(`Order confirmed: ${data.id}`);
                await sendNotification('notify_restaurant', { restaurantId: data.restaurantId, orderId: data.id, message: 'New order received' });
            } else if (action === 'update') {
                const order = await Order.findOne({ id: data.id });
                if (order.status !== 'pending') {
                    console.log(`Order ${data.id} cannot be updated; status is ${order.status}`);
                    return;
                }
                await Order.updateOne({ id: data.id }, {
                    items: data.items,
                    total: data.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
                });
                console.log(`Order updated: ${data.id}`);
            } else if (action === 'cancel') {
                const order = await Order.findOne({ id: data.id });
                if (['preparing', 'ready', 'delivered'].includes(order.status)) {
                    console.log(`Order ${data.id} cannot be canceled; status is ${order.status}`);
                    return;
                }
                await Order.updateOne({ id: data.id }, { status: 'canceled' });
                console.log(`Order canceled: ${data.id}`);
                if (order.status === 'confirmed' && order.paymentId) {
                    await producer.connect();
                    await producer.send({
                        topic: 'payment-events',
                        messages: [{ value: JSON.stringify({ action: 'refund', data: { paymentId: order.paymentId, orderId: data.id } }) }],
                    });
                    await producer.disconnect();
                }
                await sendNotification('notify_customer', { orderId: data.id, email: data.email, message: order.status === 'confirmed' ? 'Order canceled and refund initiated' : 'Order canceled' });
            } else if (action === 'prepare') {
                await Order.updateOne({ id: data.id }, { status: 'preparing' });
                console.log(`Order preparing: ${data.id}`);
                await sendNotification('notify_customer', { orderId: data.id, email: data.email, message: 'Order is being prepared' });
            } else if (action === 'ready') {
                await Order.updateOne({ id: data.id }, { status: 'ready' });
                console.log(`Order ready: ${data.id}`);
                await producer.connect();
                await producer.send({
                    topic: 'delivery-events',
                    messages: [{ value: JSON.stringify({ action: 'assign', data: { orderId: data.id, restaurantId: data.restaurantId } }) }],
                });
                await producer.disconnect();
            } else if (action === 'deliver') {
                await Order.updateOne({ id: data.id }, { status: 'delivered' });
                console.log(`Order delivered: ${data.id}`);
                await sendNotification('notify_customer', { orderId: data.id, email: data.email, message: 'Order delivered' });
            }
        },
    });
};

/**
 * Helper function to send notifications via Kafka
 */
const sendNotification = async (action, data) => {
    await producer.connect();
    await producer.send({
        topic: 'notification-events',
        messages: [{ value: JSON.stringify({ action, data }) }],
    });
    await producer.disconnect();
};

/**
 * Get order details by ID
 */
const getOrder = async (req, res) => {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
};

module.exports = { runConsumer, getOrder };