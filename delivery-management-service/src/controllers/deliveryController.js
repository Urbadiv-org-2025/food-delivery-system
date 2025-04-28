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
                
                // Step 1: Find busy drivers
                const busyDrivers = await Delivery.find({ 
                    status: { $in: ['assigned', 'in_transit'] }
                }).distinct('driverId');
            
                // Step 2: Find available drivers
                const availableDrivers = await User.find({ 
                    role: 'delivery_personnel', 
                    id: { $nin: busyDrivers }
                });
            
                if (availableDrivers.length === 0) {
                    console.error('No available drivers');
                    return;
                }
            
                // Step 3: Pick a random available driver
                const driver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
            
                // Step 4: Create and save new Delivery
                const delivery = new Delivery({
                    id: data.id,
                    orderId: data.orderId,
                    driverId: driver.id,
                    status: 'assigned',
                    startLocation: {
                        longitude: data.startLocation.longitude,
                        latitude: data.startLocation.latitude,
                    },
                    endLocation: {
                        longitude: data.endLocation.longitude,
                        latitude: data.endLocation.latitude,
                    }
                });
                await delivery.save();
                console.log(`Delivery assigned: ${data.id}`);
            
                // Step 5: Notify driver
                await producer.connect();
                await producer.send({
                    topic: 'notification-events',
                    messages: [{ 
                        value: JSON.stringify({ 
                            action: 'notify_driver', 
                            data: { 
                                driverId: driver.id, 
                                orderId: data.orderId, 
                                message: 'New delivery assigned' 
                            } 
                        }) 
                    }],
                });
                await producer.disconnect();
            }
             else if (action === 'update_status') {
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
    try {
      const delivery = await Delivery.findOne({ 
        driverId: req.params.driverId, 
        status: { $in: ['assigned', 'in_transit'] } 
      });
  
      if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found' });
      }
  
      res.json(delivery);
    } catch (error) {
      console.error("Error fetching current delivery:", error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  

module.exports = { runConsumer, getDelivery, getDriverDelivery, getDriverCurrentDelivery };