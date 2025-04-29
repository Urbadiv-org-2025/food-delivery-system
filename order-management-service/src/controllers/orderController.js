const kafka = require('../config/kafka');
const Order = require('../models/Order');
const connectDB = require('../config/db');

connectDB();

const consumer = kafka.consumer({ groupId: 'order-group' });
const producer = kafka.producer();

/**
 * Consumes order-related events from Kafka and processes them
 */
const runConsumer = async (io) => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'order-events', fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                const { action, data } = JSON.parse(message.value);
                if (!data || !data.id) {
                    console.error('Invalid message data:', message.value);
                    await sendToDLQ(message.value, 'Invalid message data');
                    return;
                }

                if (action === 'create') {
                    console.log('Processing create action:', data);
                    const order = new Order({
                        id: data.id,
                        customerId: data.customerId,
                        restaurantId: data.restaurantId,
                        items: data.items,
                        status: 'pending',
                        total: data.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
                        location: {
                            type: 'Point',
                            coordinates: [data.longitude || 0, data.latitude || 0]
                        }
                    });
                    await order.save();
                    console.log(`Order created: ${data.email}`);
                    await sendNotification('notify_customer', {  email: data.email, phoneNumber: '+94778889560', status: `Order ID ${data.id}, Order placed successfully. Please complete payment.` });
                    io.to(`order:${data.id}`).emit('orderUpdate', {
                        orderId: data.id,
                        status: 'pending',
                        message: 'Order placed successfully. Please complete payment.'
                    });
                    console.log(`Emitted orderUpdate to order:${data.id}`);
                    io.to(`restaurant:${data.restaurantId}`).emit('newOrder', {
                        orderId: data.id,
                        customerId: data.customerId,
                        items: data.items,
                        total: order.total,
                        message: 'New order received'
                    });
                    console.log(`Emitted newOrder to restaurant:${data.restaurantId}`);
                } else if (action === 'confirm') {
                    if (!data.paymentId) {
                        console.log(`Order ${data.id} cannot be confirmed; no payment ID provided`);
                        await sendToDLQ(message.value, 'Missing paymentId');
                        return;
                    }
                    const order = await Order.findOne({ id: data.id });
                    if (!order) {
                        console.log(`Order ${data.id} not found`);
                        await sendToDLQ(message.value, 'Order not found');
                        return;
                    }
                    if (order.status !== 'pending') {
                        console.log(`Order ${data.id} cannot be confirmed; status is ${order.status}`);
                        return;
                    }
                    await Order.updateOne({ id: data.id }, { status: 'confirmed', paymentId: data.paymentId });
                    console.log(`Order confirmed: ${data.email}`);
                    await sendNotification('notify_restaurant', { restaurantId: data.restaurantId, orderId: data.id, message: 'New order received' });
                    await sendNotification('notify_customer', {  email: data.email, phoneNumber: '+94778889560', message: `Order ID ${data.id}, Order confirmed successfully. Please complete payment.` });
                    io.to(`order:${data.id}`).emit('orderUpdate', {
                        orderId: data.id,
                        status: 'confirmed',
                        message: 'Order confirmed successfully'
                    });
                    console.log(`Emitted orderUpdate to order:${data.id}`);
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
                    io.to(`order:${data.id}`).emit('orderUpdate', {
                        orderId: data.id,
                        status: 'pending',
                        message: 'Order updated successfully'
                    });
                    console.log(`Emitted orderUpdate to order:${data.id}`);
                } else if (action === 'cancel') {
                    const order = await Order.findOne({ id: data.id });
                    if (!order) {
                        console.log(`Order ${data.id} not found`);
                        await sendToDLQ(message.value, 'Order not found');
                        return;
                    }
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
                        io.to(`order:${data.id}`).emit('orderUpdate', {
                            orderId: data.id,
                            status: 'canceled',
                            message: 'Order canceled and refund initiated'
                        });
                        console.log(`Emitted orderUpdate to order:${data.id}`);
                    } else {
                        io.to(`order:${data.id}`).emit('orderUpdate', {
                            orderId: data.id,
                            status: 'canceled',
                            message: 'Order canceled'
                        });
                        console.log(`Emitted orderUpdate to order:${data.id}`);
                    }
                    await sendNotification('notify_customer', { orderId: data.id, email: data.email, message: order.status === 'confirmed' ? 'Order canceled and refund initiated' : 'Order canceled' });
                } else if (action === 'prepare') {
                    await Order.updateOne({ id: data.id }, { status: 'preparing' });
                    console.log(`Order preparing: ${data.id}`);
                    await sendNotification('notify_customer', {  email: data.email, phoneNumber: '+94778889560', status: `Order ID ${data.id}, Order accepted by the restaurant successfully. Please complete payment.` });
                    io.to(`order:${data.id}`).emit('orderUpdate', {
                        orderId: data.id,
                        status: 'preparing',
                        message: 'Order is being prepared'
                    });
                    console.log(`Emitted orderUpdate to order:${data.id}`);
                } else if (action === 'ready') {
                    await Order.updateOne({ id: data.id }, { status: 'ready' });
                    console.log(`Order ready: ${data.id}`);
                    await producer.connect();
                    await producer.send({
                        topic: 'delivery-events',
                        messages: [{ value: JSON.stringify({ action: 'assign', data: { orderId: data.id, restaurantId: data.restaurantId } }) }],
                    });
                    await producer.disconnect();
                    io.to(`order:${data.id}`).emit('orderUpdate', {
                        orderId: data.id,
                        status: 'ready',
                        message: 'Order is ready for delivery'
                    });
                    console.log(`Emitted orderUpdate to order:${data.id}`);
                } else if (action === 'deliver') {
                    await Order.updateOne({ id: data.id }, { status: 'delivered' });
                    console.log(`Order delivered: ${data.id}`);
                    await sendNotification('notify_customer', {  email: data.email, phoneNumber: '+94778889560', status: `Order ID ${data.id}, Order delivered successfully. Please complete payment.` });
                    io.to(`order:${data.id}`).emit('orderUpdate', {
                        orderId: data.id,
                        status: 'delivered',
                        message: 'Order delivered'
                    });
                    console.log(`Emitted orderUpdate to order:${data.id}`);
                }
            } catch (error) {
                console.error(`Error processing message on topic ${topic}, partition ${partition}, offset ${message.offset}:`, error);
                await sendToDLQ(message.value, error.message);
            }
        },
    });
};

/**
 * Send failed message to Dead Letter Queue
 */
const sendToDLQ = async (messageValue, errorMessage) => {
    try {
        await producer.connect();
        await producer.send({
            topic: 'order-events-dlq',
            messages: [{
                value: JSON.stringify({
                    originalMessage: messageValue.toString(),
                    error: errorMessage,
                    timestamp: new Date().toISOString()
                })
            }]
        });
        console.log('Message sent to DLQ:', messageValue.toString());
        await producer.disconnect();
    } catch (dlqError) {
        console.error('Failed to send message to DLQ:', dlqError);
    }
};

/**
 * Helper function to send notifications via Kafka
 */
const sendNotification = async (action, data) => {
    try {
        await producer.connect();
        await producer.send({
            topic: 'notification-events',
            messages: [{ value: JSON.stringify({ action, data }) }],
        });
        await producer.disconnect();
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

/**
 * Get order details by ID
 */
const getOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ id: req.params.id });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get all orders for a customer, with optional status filter
 */
const getOrdersByCustomer = async (req, res) => {
    try {
        const { customerId, status } = req.query;
        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID required' });
        }
        const query = { customerId };
        if (status) {
            if (!['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'canceled'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status value' });
            }
            query.status = status;
        }
        const orders = await Order.find(query);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { runConsumer, getOrder, getOrdersByCustomer };