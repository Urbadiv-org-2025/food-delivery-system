const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dineth550:20021213@studentms.q45in7h.mongodb.net/order_db', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

module.exports = connectDB;