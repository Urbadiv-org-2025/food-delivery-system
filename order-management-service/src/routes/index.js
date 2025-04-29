const express = require('express');
const { getOrder, getOrdersByCustomer} = require('../controllers/orderController');

const router = express.Router();

router.get('/orders/:id', getOrder);
router.get('/orders', getOrdersByCustomer);

module.exports = router;