const Stripe = require('stripe');
const kafka = require('../config/kafka');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51...'); // Replace with your Stripe secret key
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'payment-group' });

/**
 * Create a payment intent for an order
 */
const createPayment = async (req, res) => {
    try {
        const { amount, currency, orderId } = req.body;
        if (!amount || !currency || !orderId) {
            return res.status(400).json({ error: 'Amount, currency, and orderId required' });
        }
        if (!Number.isInteger(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Amount must be a positive integer (in cents)' });
        }
        const paymentIntent = await stripe.paymentIntents.create({
            amount, // Already in cents from frontend
            currency: currency || 'usd',
            metadata: { orderId },
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never',
            },
        });
        res.json({ paymentId: paymentIntent.id, clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error('Create payment error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Confirm a payment intent during order confirmation
 */
const confirmPayment = async (paymentId, orderId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        if (paymentIntent.status === 'succeeded') {
            console.log(`Payment already confirmed for order: ${orderId}`);
            return;
        }
        if (paymentIntent.status !== 'requires_confirmation') {
            throw new Error(`Payment cannot be confirmed: status is ${paymentIntent.status}`);
        }
        const confirmedIntent = await stripe.paymentIntents.confirm(paymentId);
        if (confirmedIntent.status === 'succeeded') {
            console.log(`Payment confirmed for order: ${orderId}`);
            await producer.connect();
            await producer.send({
                topic: 'notification-events',
                messages: [{ value: JSON.stringify({ action: 'notify_customer', data: { orderId, message: 'Payment confirmed successfully' } }) }],
            });
            await producer.disconnect();
        } else {
            throw new Error(`Payment confirmation failed: ${confirmedIntent.status}`);
        }
    } catch (err) {
        console.error(`Payment confirmation error for order ${orderId}: ${err.message}`);
        throw err;
    }
};

/**
 * Process a refund for a canceled order
 */
const refundPayment = async (req, res) => {
    try {
        const { paymentId, orderId } = req.body;
        if (!paymentId || !orderId) {
            return res.status(400).json({ error: 'Payment ID and orderId required' });
        }
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ error: `Payment cannot be refunded: status is ${paymentIntent.status}` });
        }
        const refund = await stripe.refunds.create({
            payment_intent: paymentId,
            metadata: { orderId },
        });
        await producer.connect();
        await producer.send({
            topic: 'notification-events',
            messages: [{ value: JSON.stringify({ action: 'notify_customer', data: { orderId, message: 'Refund processed successfully' } }) }],
        });
        await producer.disconnect();
        res.json({ refundId: refund.id });
    } catch (err) {
        console.error('Refund error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Consume payment-related events from Kafka
 */
const runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'payment-events', fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                const { action, data } = JSON.parse(message.value);
                if (!data || !data.paymentId || !data.orderId) {
                    console.error('Invalid payment message:', message.value);
                    await sendToDLQ(message.value, 'Invalid payment message');
                    return;
                }
                if (action === 'confirm') {
                    await confirmPayment(data.paymentId, data.orderId);
                } else if (action === 'refund') {
                    try {
                        const paymentIntent = await stripe.paymentIntents.retrieve(data.paymentId);
                        if (paymentIntent.status !== 'succeeded') {
                            console.log(`Payment cannot be refunded for order ${data.orderId}: status is ${paymentIntent.status}`);
                            return;
                        }
                        const refund = await stripe.refunds.create({
                            payment_intent: data.paymentId,
                            metadata: { orderId: data.orderId },
                        });
                        console.log(`Refund processed for order: ${data.orderId}`);
                        await producer.connect();
                        await producer.send({
                            topic: 'notification-events',
                            messages: [{ value: JSON.stringify({ action: 'notify_customer', data: { orderId: data.orderId, message: 'Refund processed successfully' } }) }],
                        });
                        await producer.disconnect();
                    } catch (err) {
                        console.error(`Refund error for order ${data.orderId}: ${err.message}`);
                        await sendToDLQ(message.value, err.message);
                    }
                }
            } catch (err) {
                console.error(`Error processing payment message on topic ${topic}, partition ${partition}, offset ${message.offset}:`, err);
                await sendToDLQ(message.value, err.message);
            }
        },
    });
};

/**
 * Send failed message to Dead Letter Queue
 */
const sendToDLQ = async (messageValue, errorMessage) => {
    try {
        await producer.connect();
        await producer.send({
            topic: 'payment-events-dlq',
            messages: [{
                value: JSON.stringify({
                    originalMessage: messageValue.toString(),
                    error: errorMessage,
                    timestamp: new Date().toISOString()
                })
            }]
        });
        console.log('Payment message sent to DLQ:', messageValue.toString());
        await producer.disconnect();
    } catch (dlqError) {
        console.error('Failed to send payment message to DLQ:', dlqError);
    }
};

// Start the Kafka consumer
runConsumer().catch(console.error);

module.exports = { createPayment, refundPayment, runConsumer };