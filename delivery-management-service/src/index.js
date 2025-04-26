const express = require('express');
const routes = require('./routes');
const { runConsumer } = require('./controllers/deliveryController');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(express.json());
app.use('/api', routes);

runConsumer().catch(console.error);

app.listen(3004, () => {
    console.log('Delivery Management Service running on port 3004');
});