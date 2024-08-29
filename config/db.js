const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const mongoURI = process.env.MONGO_URI;

module.exports = async () => {
    try {
        console.log('DB_URL:', mongoURI);
        await mongoose.connect(mongoURI, {
            connectTimeoutMS: 30000,
            serverSelectionTimeoutMS: 50000,
            socketTimeoutMS: 45000,
        });
        console.log("CONNECTED TO DATABASE SUCCESSFULLY");
    } catch (error) {
        console.error('COULD NOT CONNECT TO DATABASE:', error.message);
        process.exit(1);
    }
};

if (require.main === module) {
    (async () => {
        await module.exports();
    })();
}