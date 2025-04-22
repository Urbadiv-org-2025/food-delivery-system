const express = require('express');
const routes = require('./routes');
const { runConsumer } = require('./controllers/restaurantController');

const app = express();

app.use(express.json());
app.use('/api', routes);

runConsumer().catch(console.error);

app.listen(3002, () => {
    console.log('Restaurant Management Service running on port 3002');
});