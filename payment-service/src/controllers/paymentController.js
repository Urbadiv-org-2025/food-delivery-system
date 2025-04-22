const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key');

const createPayment = async (req, res) => {
    try {
        const { amount, currency, orderId } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Stripe expects amount in cents
            currency: currency || 'usd',
            metadata: { orderId },
        });
        res.json({ paymentId: paymentIntent.id, clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createPayment };