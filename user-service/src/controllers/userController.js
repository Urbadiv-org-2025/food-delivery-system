const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const register = async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!['customer', 'restaurant_admin', 'delivery_personnel'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Error registering user', error });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  res.json({ token });
};

const getProfile = async (req, res) => {
  if (req.userId !== req.params.id) {
    return res.status(403).json({ message: 'Unauthorized access' });
  }
  const user = await User.findById(req.params.id, '-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

const updateProfile = async (req, res) => {
  if (req.userId !== req.params.id) {
    return res.status(403).json({ message: 'Unauthorized access' });
  }
  const { name, email } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Error updating profile', error });
  }
};

// Role-specific endpoints (example actions)
const browseFood = async (req, res) => {
  res.json({ message: 'Browsing food (Customer only)' });
};

const manageMenu = async (req, res) => {
  res.json({ message: 'Managing menu (Restaurant Admin only)' });
};

const acceptDelivery = async (req, res) => {
  res.json({ message: 'Accepting delivery (Delivery Personnel only)' });
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  browseFood,
  manageMenu,
  acceptDelivery,
};