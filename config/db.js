// db.js

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = "mongodb+srv://phosophors097:50gmUFaBlpvsXdt2@cluster0.92lcz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  console.log('Attempting to connect to MongoDB...');

  try {
    // Removed deprecated options
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
