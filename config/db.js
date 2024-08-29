// // config/db.js

// const mongoose = require('mongoose');
// require('dotenv').config();

// const mongoURI = process.env.MONGO_URI;

// const connectDB = async () => {
//   try {
//     await mongoose.connect(mongoURI, {
//       connectTimeoutMS: 30000, 
//       serverSelectionTimeoutMS: 50000,
//       socketTimeoutMS: 45000,
//     });
//     console.log('MongoDB connected successfully');
//   } catch (err) {
//     console.error('MongoDB connection error:', err);
//     process.exit(1); // Exit process with failure
//   }
// };

// module.exports = connectDB;

const mongoose = require('mongoose');
require('dotenv').config();

module.exports = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {});
        console.log("CONNECTED TO DATABASE SUCCESSFULLY");
    } catch (error) {
        console.error('COULD NOT CONNECT TO DATABASE:', error.message);
    }
};