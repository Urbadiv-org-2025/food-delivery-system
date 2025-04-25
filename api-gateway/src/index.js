const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const routes = require('./routes');

const app = express();
app.use(cors());

app.use(express.json());
app.use('/api', routes);

app.listen(3000, () => {
  console.log('API Gateway running on port 3000');
});