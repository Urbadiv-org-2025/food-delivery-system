const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// Role-based authorization middleware
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticate, restrictTo };