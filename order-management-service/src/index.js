const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
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

// Log Socket.IO connections and room joins
io.on('connection', (socket) => {
    console.log(`Socket.IO client connected: ${socket.id}`);
    socket.on('joinOrderRoom', (room) => {
        socket.join(room);
        console.log(`Client ${socket.id} joined room ${room}`);
    });
    socket.on('joinRestaurantRoom', (room) => {
        socket.join(room);
        console.log(`Client ${socket.id} joined room ${room}`);
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