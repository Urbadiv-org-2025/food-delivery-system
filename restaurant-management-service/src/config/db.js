const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    process.env.MONGO_URI ||
      "mongodb+srv://vishwakaushalya2003:vishwa2003@cluster0.xfi4t.mongodb.net/restaurent_db?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
};

module.exports = connectDB;
