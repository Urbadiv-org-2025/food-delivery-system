const express = require('express');
const routes = require('./routes');
const { runConsumer } = require('./controllers/deliveryController');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

//socket.io
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
app.use(cors());


app.use(express.json());
app.use('/api', routes);

runConsumer().catch(console.error);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // you can limit it to your frontend domain in production
    methods: ["GET", "POST"],
  },
});

// Track connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Driver sends updated location
  socket.on('driverLocationUpdate', async ({ deliveryId, location }) => {
    console.log(`Updating location for delivery ${deliveryId}:`, location);

    // Broadcast to all clients who are listening for this delivery
    io.emit(`locationUpdate:${deliveryId}`, location);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(3004, () => {
    console.log('Delivery Management Service running on port 3004');
});