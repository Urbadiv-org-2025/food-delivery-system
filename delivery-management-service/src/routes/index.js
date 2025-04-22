const express = require('express');
const { getDelivery } = require('../controllers/deliveryController');

const router = express.Router();

router.get('/deliveries/:id', getDelivery);

module.exports = router;