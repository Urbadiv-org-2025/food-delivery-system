const kafka = require('../config/kafka');
const Order = require('../models/Order');
const connectDB = require('../config/db');

connectDB();

const consumer = kafka.consumer({ groupId: 'order-group' });
const producer = kafka.producer();

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
                await producer.connect();
                await producer.send({
                    topic: 'notification-events',
                    messages: [{ value: JSON.stringify({ action: 'notify_customer', data: { orderId: data.id, email: data.email, message: 'Order placed successfully' } }) }],
                });
                await producer.send({
                    topic: 'delivery-events',
                    messages: [{ value: JSON.stringify({ action: 'assign', data: { orderId: data.id, restaurantId: data.restaurantId } }) }],
                });
                await producer.disconnect();
            } else if (action === 'update') {
                const order = await Order.findOne({ id: data.id });
                if (order.status !== 'pending') {
                    console.log(`Order ${data.id} cannot be updated; status is ${order.status}`);
                    return;
                }
                await Order.updateOne({ id: data.id }, { items: data.items, total: data.items.reduce((sum, item) => sum + item.price * item.quantity, 0) });
                console.log(`Order updated: ${data.id}`);
            }
        },
    });
};

const getOrder = async (req, res) => {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
};

module.exports = { runConsumer, getOrder };