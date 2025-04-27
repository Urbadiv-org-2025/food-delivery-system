const Stripe = require('stripe');
const kafka = require('../config/kafka');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key');
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'payment-group' });

/**
 * Create a payment intent for an order
 */
const createPayment = async (req, res) => {
    try {
        const { amount, currency, orderId } = req.body;
        console.log(req.body);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Stripe expects amount in cents
            currency: currency || 'usd',
            metadata: { orderId },
            // Do not auto-confirm; confirmation happens during order confirmation
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never',
            },
        });
        res.json({ paymentId: paymentIntent.id, clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Confirm a payment intent during order confirmation
 */
const confirmPayment = async (paymentId, orderId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.confirm(paymentId);
        if (paymentIntent.status === 'succeeded') {
            console.log(`Payment confirmed for order: ${orderId}`);
            await producer.connect();
            await producer.send({
                topic: 'notification-events',
                messages: [{ value: JSON.stringify({ action: 'notify_customer', data: { orderId, message: 'Payment confirmed successfully' } }) }],
            });
            await producer.disconnect();
        } else {
            throw new Error(`Payment confirmation failed: ${paymentIntent.status}`);
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
        const refund = await stripe.refunds.create({
            payment_intent: paymentId,
        });
        await producer.connect();
        await producer.send({
            topic: 'notification-events',
            messages: [{ value: JSON.stringify({ action: 'notify_customer', data: { orderId, message: 'Refund processed successfully' } }) }],
        });
        await producer.disconnect();
        res.json({ refundId: refund.id });
    } catch (err) {
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
        eachMessage: async ({ message }) => {
            const { action, data } = JSON.parse(message.value);
            if (action === 'confirm') {
                await confirmPayment(data.paymentId, data.orderId);
            } else if (action === 'refund') {
                try {
                    const refund = await stripe.refunds.create({
                        payment_intent: data.paymentId,
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
                }
            }
        },
    });
};

// Start the Kafka consumer
runConsumer().catch(console.error);

module.exports = { createPayment, refundPayment, runConsumer };