const winston = require('winston');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const kafka = require('../config/kafka');
const User = require('../models/User');
const connectDB = require('../config/db');

// Added Winston logger to replace console.log and prevent PII exposure in logs
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'app.log' }),
    new winston.transports.Console() // Optional for development
  ],
});

connectDB();

const consumer = kafka.consumer({ groupId: 'user-group' });

const runConsumer = async () => {
  // Added try-catch to handle Kafka connection/subscription errors and prevent crashes
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'user-events', fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ message }) => {
        // Added try-catch to handle message processing errors (e.g., JSON parsing) and prevent consumer crashes
        try {
          const { action, data } = JSON.parse(message.value);
          if (action === 'register') {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            const user = new User({
              id: data.id,
              email: data.email,
              password: hashedPassword,
              role: data.role || 'customer',
            });
            await user.save();
            // Replaced console.log(`User registered: ${data.email}`) with Winston to avoid logging PII
            logger.info('User registration processed', { context: 'runConsumer' });
          }
        } catch (err) {
          // Log errors server-side to aid debugging without exposing to clients
          logger.error('Kafka message processing error:', {
            message: err.message,
            stack: err.stack,
            context: 'runConsumer'
          });
        }
      },
    });
  } catch (err) {
    // Log initialization errors to ensure consumer failures are tracked
    logger.error('Kafka consumer initialization error:', {
      message: err.message,
      stack: err.stack,
      context: 'runConsumer'
    });
  }
};

const login = async (req, res) => {
  // Added try-catch to handle async errors (e.g., MongoDB, bcrypt) and prevent crashes
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    // Log errors server-side and return generic message to prevent leakage
    logger.error('Login error:', {
      message: err.message,
      stack: err.stack,
      context: 'login'
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUser = async (req, res) => {
  // Added try-catch to handle async errors (e.g., MongoDB query) and prevent crashes
  try {
    const user = await User.findOne({ id: req.params.id }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    // Log errors server-side and return generic message to prevent leakage
    logger.error('Get user error:', {
      message: err.message,
      stack: err.stack,
      context: 'getUser'
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllUsers = async (req, res) => {
  // Added try-catch to handle async errors (e.g., MongoDB query) and prevent crashes
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    // Log errors server-side and return generic message to prevent leakage
    logger.error('Get all users error:', {
      message: err.message,
      stack: err.stack,
      context: 'getAllUsers'
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  // Added try-catch to handle async errors (e.g., MongoDB query) and prevent crashes
  try {
    const { id } = req.params;
    // Replaced console.log('id', id) with Winston to avoid logging PII
    logger.info('User deletion attempted', { context: 'deleteUser' });
    const user = await User.findOneAndDelete({ _id: id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    // Log errors server-side and return generic message to prevent leakage
    logger.error('Delete user error:', {
      message: err.message,
      stack: err.stack,
      context: 'deleteUser'
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const editUser = async (req, res) => {
  // Added try-catch to handle async errors (e.g., MongoDB, bcrypt) and prevent crashes
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findOneAndUpdate({ _id: id }, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    // Log errors server-side and return generic message to prevent leakage
    logger.error('Edit user error:', {
      message: err.message,
      stack: err.stack,
      context: 'editUser'
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { runConsumer, login, getUser, getAllUsers, deleteUser, editUser };