const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const routes = require('./routes');
const { runConsumer } = require('./controllers/orderController');

const app = express();

app.use(express.json());
app.use('/api', routes);

runConsumer().catch(console.error);

app.listen(3003, () => {
    console.log('Order Management Service running on port 3003');
});