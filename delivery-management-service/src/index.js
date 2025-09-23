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
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(express.json());
app.use('/api', routes);

runConsumer().catch(console.error);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

/**
 * Authenticate sockets with JWT
 */
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token || !process.env.JWT_SECRET) {
    return next(new Error("Unauthorized"));
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: "foodie-pal" });
    socket.user = payload; // attach user to socket
    return next();
  } catch (err) {
    return next(new Error("Unauthorized"));
  }
});

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}, user=${socket.user?.id}`);

  /**
   * Driver updates their location
   * deliveryId = the active delivery being updated
   */
  socket.on('driverLocationUpdate', async ({ deliveryId, location }) => {
    // 🔒 TODO: check in DB if socket.user.id is assigned driver for this deliveryId
    const isAssignedDriver = true; // stub, replace with DB check

    if (!isAssignedDriver) {
      console.warn(`Unauthorized location update attempt by ${socket.user?.id} for delivery ${deliveryId}`);
      return;
    }

    console.log(`Driver ${socket.user?.id} updating location for delivery ${deliveryId}:`, location);

    // Only emit to clients subscribed to this delivery
    io.to(`order:${deliveryId}`).emit(`locationUpdate:${deliveryId}`, location);
  });

  /**
   * Allow clients (e.g., customer app, admin dashboard) to join the delivery room
   */
  socket.on('subscribeToDelivery', (deliveryId) => {
    socket.join(`order:${deliveryId}`);
    console.log(`Socket ${socket.id} subscribed to order:${deliveryId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(3004, () => {
  console.log('Delivery Management Service running on port 3004');
});
