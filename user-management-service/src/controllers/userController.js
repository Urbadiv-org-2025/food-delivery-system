const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const kafka = require('../config/kafka');
const User = require('../models/User');
const connectDB = require('../config/db');

const oauthLogin = async (req, res) => {
  try {
    const { provider, providerId, email, name, avatar, emailVerified } = req.body;
    if (!provider || !providerId || !email) {
      return res.status(400).json({ error: 'Missing provider/providerId/email' });
    }

    // Upsert by email; link provider
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        role: 'customer',
        oauth: { provider, providerId, emailVerified: !!emailVerified, avatar },
      });
      await user.save();
    } else {
      user.oauth = user.oauth || {};
      user.oauth.provider = provider;
      user.oauth.providerId = providerId;
      user.oauth.emailVerified = !!emailVerified;
      user.oauth.avatar = avatar || user.oauth.avatar;
      await user.save();
    }

    // Issue the SAME app JWT shape your login uses
    if (!process.env.JWT_SECRET) throw new Error('JWT secret not configured');
    const token = jwt.sign(
      { id: user.id || user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h', issuer: process.env.JWT_ISSUER || 'foodie-pal', audience: process.env.JWT_AUDIENCE || 'foodie-pal-web' }
    );

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.json({ user: safeUser, token });
  } catch (e) {
    console.error('oauthLogin error', e);
    return res.status(500).json({ error: 'OAuth login failed' });
  }
};


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

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
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
  const { id } = req.params;
  console.log('id', id);

  const user = await User.findOneAndDelete({ _id:id });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User deleted successfully' });
};

const editUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }

  const user = await User.findOneAndUpdate({ _id: id }, updates, { new: true }).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

const adminApprove = async (req, res) => {
  const { id, available } = req.body;

  try {
    const producer = kafka.producer();
    await producer.connect();

    const event = {
      action: 'admin_approve',
      data: { id, available },
    };

    await producer.send({
      topic: 'restaurant-events',
      messages: [{ value: JSON.stringify(event) }],
    });

    await producer.disconnect();

    res.json({ message: 'Approval event sent successfully', event });
  } catch (error) {
    console.error('Error sending approval event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { runConsumer, login, getUser, getAllUsers, deleteUser, editUser , adminApprove, oauthLogin};