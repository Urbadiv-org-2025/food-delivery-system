const express = require('express');
const connectDB = require('./db/connection');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(express.json());

// Database connection
connectDB();

// Routes
app.use('/api', userRoutes);

app.get('/', (req, res) => {
    res.send('User Service is running');
}   );

// Start the server
app.listen(PORT, () => {
    console.log(`User Service is listening on port ${PORT}`);
});