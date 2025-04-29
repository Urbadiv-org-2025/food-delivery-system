const nodemailer = require('nodemailer'); // For sending emails
const Twilio = require('twilio'); // For sending SMS
const kafka = require('../config/kafka'); // Kafka for message queue

require('dotenv').config();

// Twilio client setup
const twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Nodemailer transporter setup using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_PASSWORD, // Your Gmail app password
    },
});

// Kafka consumer setup
const consumer = kafka.consumer({ groupId: 'notification-group' });

const runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'notification-events', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const { action, data } = JSON.parse(message.value);
            const { email, phoneNumber, status } = data.data;
            console.log(action, data);
            

            if (action === 'notify_customer') {
                // Notify the client about the status of their package
                const emailOptions = {
                    from: process.env.GMAIL_USER,
                    to: email, // Client's email
                    subject: 'Package Status Update',
                    text: `Dear Customer, your package status is: ${status}`,
                };

                try {
                    await transporter.sendMail(emailOptions);
                    console.log(`Email sent to client: ${email}`);
                } catch (error) {
                    console.error(`Failed to send email to client: ${error.message}`);
                }

                try {
                    await twilioClient.messages.create({
                        body: `Dear Customer, your package status is: ${status}`,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: phoneNumber, // Client's phone number
                    });
                    console.log(`SMS sent to client: ${phoneNumber}`);
                } catch (error) {
                    console.error(`Failed to send SMS to client: ${error.message}`);
                }
            } else if (action === 'notify_driver') {
                // Notify the driver about the status of their package
                const emailOptions = {
                    from: process.env.GMAIL_USER,
                    to: email, // Driver's email
                    subject: 'Delivery Status Update',
                    text: `Dear Driver, the package status is: ${status}`,
                };

                try {
                    await transporter.sendMail(emailOptions);
                    console.log(`Email sent to driver: ${email}`);
                } catch (error) {
                    console.error(`Failed to send email to driver: ${error.message}`);
                }

                try {
                    await twilioClient.messages.create({
                        body: `Dear Driver, the package status is: ${status}`,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: phoneNumber, // Driver's phone number
                    });
                    console.log(`SMS sent to driver: ${phoneNumber}`);
                } catch (error) {
                    console.error(`Failed to send SMS to driver: ${error.message}`);
                }
            }
        },
    });
};

module.exports = { runConsumer };
