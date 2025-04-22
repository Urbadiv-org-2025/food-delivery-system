const express = require('express');
const { login, getUser } = require('../controllers/userController');

const router = express.Router();

router.post('/login', login);
router.get('/users/:id', getUser);

module.exports = router;