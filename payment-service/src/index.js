const express = require('express');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use('/api', routes);

app.listen(3005, () => {
    console.log('Payment Service running on port 3005');
});