const kafka = require('../config/kafka');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const connectDB = require('../config/db');

connectDB();

const consumer = kafka.consumer({ groupId: 'restaurant-group' });

const runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topics: ['menu-events', 'restaurant-events'], fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            const { action, data } = JSON.parse(message.value);
            if (topic === 'menu-events') {
                if (action === 'create') {
                    const menuItem = new MenuItem({
                        id: data.id,
                        restaurantId: data.restaurantId,
                        name: data.name,
                        price: data.price,
                        description: data.description,
                    });
                    await menuItem.save();
                    console.log(`Menu item created: ${data.name}`);
                } else if (action === 'update') {
                    await MenuItem.updateOne({ id: data.id }, {
                        name: data.name,
                        price: data.price,
                        description: data.description,
                    });
                    console.log(`Menu item updated: ${data.id}`);
                } else if (action === 'delete') {
                    await MenuItem.deleteOne({ id: data.id });
                    console.log(`Menu item deleted: ${data.id}`);
                }
            } else if (topic === 'restaurant-events') {
                if (action === 'update_availability') {
                    await Restaurant.updateOne({ id: data.id }, { available: data.available });
                    console.log(`Restaurant availability updated: ${data.id}`);
                }
            }
        },
    });
};

module.exports = { runConsumer };