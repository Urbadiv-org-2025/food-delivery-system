const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'order-management',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    retry: {
        maxRetryTime: 30000,
        initialRetryTime: 300,
        factor: 0.2,
        multiplier: 2,
        retries: 5
    }
});

module.exports = kafka;