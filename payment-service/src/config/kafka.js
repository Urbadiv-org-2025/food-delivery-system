const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'payment-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    retry: {
        maxRetryTime: 30000, // Retry for 30 seconds
        initialRetryTime: 300, // Start with 300ms delay
        factor: 0.2, // Exponential backoff factor
        multiplier: 2, // Double the delay each retry
        retries: 5 // Maximum 5 retries
    }
});

module.exports = kafka;