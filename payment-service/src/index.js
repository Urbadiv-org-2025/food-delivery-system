const express = require('express');
const routes = require('./routes');
const { runConsumer } = require('./controllers/paymentController');

const app = express();

app.use(express.json());
app.use('/api', routes);

runConsumer().catch(console.error);

app.listen(3005, () => {
    console.log('Payment Service running on port 3005');
});