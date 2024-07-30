// middleware/createDefaultAdminMiddleware.js

const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

async function createDefaultAdmin() {
  const adminExists = await User.findOne({ role: 'admin' });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const admin = new User({
      username: 'admin',
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
    });

    await admin.save();
    console.log('Default admin user created');
  } else {
    console.log('Admin user already exists');
  }
}

module.exports = createDefaultAdmin;