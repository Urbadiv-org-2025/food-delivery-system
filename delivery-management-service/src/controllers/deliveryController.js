const kafka = require('../config/kafka');
const Delivery = require('../models/Delivery');
const User = require('../models/User');
const connectDB = require('../config/db');

connectDB();

const consumer = kafka.consumer({ groupId: 'delivery-group' });
const producer = kafka.producer();

const runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'delivery-events', fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ message }) => {
            const { action, data } = JSON.parse(message.value);
            if (action === 'assign') {
                console.log(`Assigning delivery: ${data.id}`);
                // Simple driver assignment logic (random available driver)
                const drivers = await User.find({ role: 'delivery_personnel' });
                const driver = drivers[Math.floor(Math.random() * drivers.length)];
                const delivery = new Delivery({
                    id: data.id,
                    orderId: data.orderId,
                    driverId: driver.id,
                    status: 'assigned',
                });
                await delivery.save();
                console.log(`Delivery assigned: ${data.id}`);
                await producer.connect();
                await producer.send({
                    topic: 'notification-events',
                    messages: [{ value: JSON.stringify({ action: 'notify_driver', data: { driverId: driver.id, orderId: data.orderId, message: 'New delivery assigned' } }) }],
                });
                await producer.disconnect();
            } else if (action === 'update_status') {
                console.log(`Updating delivery status: ${data.id}`);
                const delivery = await Delivery.findOne({ id: data.id });
                if (!delivery) {
                    console.error(`Delivery not found: ${data.id}`);
                    return;
                }
                delivery.status = data.status;
                await delivery.save();
                console.log(`Delivery status updated: ${data.id} to ${data.status}`);
            }
        },
    });
};

const getDelivery = async (req, res) => {
    const delivery = await Delivery.findOne({ id: req.params.id });
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
    res.json(delivery);
};

const getDriverDelivery = async (req, res) => {
    const delivery = await Delivery.find({ driverId: req.params.driverId });
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
    res.json(delivery);
};

const getDriverCurrentDelivery = async (req, res) => {
    const delivery = await Delivery.findOne({ driverId: req.params.driverId , status: 'assigned' });
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
    res.json(delivery);
};

module.exports = { runConsumer, getDelivery, getDriverDelivery, getDriverCurrentDelivery };