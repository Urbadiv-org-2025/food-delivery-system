const Twilio = require('twilio');
const SendGrid = require('@sendgrid/mail');
const kafka = require('../config/kafka');

const twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
SendGrid.setApiKey(process.env.SENDGRID_API_KEY || 'your_sendgrid_api_key');

const consumer = kafka.consumer({ groupId: 'notification-group' });

const runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'notification-events', fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ message }) => {
            const { action, data } = JSON.parse(message.value);
            if (action === 'notify_customer') {
                await SendGrid.send({
                    to: data.email,
                    from: 'noreply@fooddelivery.com',
                    subject: 'Order Confirmation',
                    text: data.message,
                });
                console.log(`Email sent to ${data.email}`);
            } else if (action === 'notify_driver') {
                const driver = await User.findOne({ id: data.driverId });
                await twilioClient.messages.create({
                    body: data.message,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: driver.phoneNumber, // Assume phoneNumber is stored in User model
                });
                console.log(`SMS sent to driver ${data.driverId}`);
            }
        },
    });
};

module.exports = { runConsumer };