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
        origin: '*', // Allow all origins for testing; restrict in production
        methods: ['GET', 'POST']
    }
});

app.use(express.json());
app.use('/api', routes);

// Start Kafka consumer with io instance
runConsumer(io).catch(console.error);

server.listen(3003, () => {
    console.log('Order Management Service running on port 3003');
});