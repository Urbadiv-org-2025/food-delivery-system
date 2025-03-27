const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getProfile,
    updateProfile,
    browseFood,
    manageMenu,
    acceptDelivery,
} = require('../controllers/userController');
const { authenticate, restrictTo } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/user/:id', authenticate, getProfile);
router.put('/user/:id', authenticate, updateProfile);

// Role-specific routes
router.get('/browse', authenticate, restrictTo('customer'), browseFood);
router.post('/menu', authenticate, restrictTo('restaurant_admin'), manageMenu);
router.post('/delivery', authenticate, restrictTo('delivery_personnel'), acceptDelivery);

module.exports = router;