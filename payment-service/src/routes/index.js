const express = require('express');
const { createPayment, refundPayment } = require('../controllers/paymentController');

const router = express.Router();

router.post('/payments', createPayment);
router.post('/refunds', refundPayment);

module.exports = router;