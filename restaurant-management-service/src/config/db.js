const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant_db', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

module.exports = connectDB;