const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://user:user@cluster0.uonoawp.mongodb.net/user-service?retryWrites=true&w=majority&appName=Cluster0", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

module.exports = connectDB;