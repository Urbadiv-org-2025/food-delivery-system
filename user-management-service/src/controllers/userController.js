const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const kafka = require('../config/kafka');
const User = require('../models/User');
const connectDB = require('../config/db');


connectDB();

const consumer = kafka.consumer({ groupId: 'user-group' });

const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'user-events', fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message }) => {
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
        console.log(`User registered: ${data.email}`);
      }
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
  res.json({ token: token, user: {id: user.id,email: user.email,role: user.role} });
};

const getUser = async (req, res) => {
  const user = await User.findOne({ id: req.params.id }).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};


const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

const deleteUser = async (req, res) => {
  const { id } = req.body;

  if (id === req.user.id) {
    return res.status(400).json({ error: "You cannot delete your own account" });
  }

  const user = await User.findOneAndDelete({ id });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User deleted successfully' });
};

const editUser = async (req, res) => {
  const { id, ...updates } = req.body;

  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }

  const user = await User.findOneAndUpdate({ id }, updates, { new: true }).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

module.exports = { runConsumer, login, getUser, getAllUsers, deleteUser, editUser };