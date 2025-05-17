const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
dotenv.config();
const routes = require('./routes');
const { runConsumer } = require('./controllers/orderController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow frontend origin
        methods: ['GET', 'POST']
    }
});

app.use(express.json());
app.use('/api', routes);

// Status to message mapping
const statusMessages = {
    pending: 'Order is pending confirmation',
    confirmed: 'Order confirmed successfully',
    preparing: 'Order is being prepared',
    ready: 'Order is ready for pickup',
    delivered: 'Order has been delivered',
    canceled: 'Order has been canceled'
};

// Define Order schema (assumed to match MongoDB)
const Order = require('./models/Order');
const connectDB = require('./config/db');

connectDB();

// Log Socket.IO connections and handle room joins
io.on('connection', (socket) => {
    console.log(`Socket.IO client connected: ${socket.id}`);

    socket.on('joinOrderRoom', async (room) => {
        try {
            socket.join(`order:${room}`);
            console.log(`Client ${socket.id} joined room order:${room}`);

            // Fetch order from MongoDB
            const order = await Order.findOne({ id: room });
            if (!order) {
                console.error(`Order not found: ${room}`);
                socket.emit('error', { message: `Order ${room} not found` });
                return;
            }

            // Emit orderUpdate with current status
            io.to(`order:${room}`).emit('orderUpdate', {
                orderId: room,
                status: order.status,
                message: statusMessages[order.status] || `Order status: ${order.status}`
            });
        } catch (error) {
            console.error(`Error fetching order ${room}:`, error);
            socket.emit('error', { message: 'Failed to fetch order status' });
        }
    });

    socket.on('joinRestaurantRoom', async (room) => {
        try {
            socket.join(`restaurant:${room}`);
            console.log(`Client ${socket.id} joined room restaurant:${room}`);

            // Fetch all orders for the restaurant, sorted by id (newest first)
            const orders = await Order.find({ restaurantId: room }).sort({ id: -1 });
            io.to(`restaurant:${room}`).emit('orderUpdate', {
                restaurantId: room,
                orders: orders.map(order => ({
                    orderId: order.id,
                    status: order.status,
                    message: statusMessages[order.status] || `Order status: ${order.status}`,
                    customerId: order.customerId,
                    items: order.items,
                    total: order.total
                })),
                message: orders.length > 0 ? 'Updated restaurant orders' : 'No active orders for this restaurant'
            });
        } catch (error) {
            console.error(`Error fetching orders for restaurant ${room}:`, error);
            socket.emit('error', { message: 'Failed to fetch restaurant orders' });
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket.IO client disconnected: ${socket.id}`);
    });
});

// Start Kafka consumer with io instance
runConsumer(io).catch(console.error);

server.listen(3003, () => {
    console.log('Order Management Service running on port 3003');
});