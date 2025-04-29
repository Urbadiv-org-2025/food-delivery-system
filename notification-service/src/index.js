const express = require('express');
const { runConsumer } = require('./controllers/paymentController');

const app = express();

app.use(express.json());

runConsumer().catch(console.error);

app.listen(3006, () => {
    console.log('Notification Service running on port 3006');
});