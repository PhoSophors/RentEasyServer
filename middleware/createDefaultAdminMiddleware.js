const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Role = require('../models/roleModel');
const mongoose = require('mongoose');

async function createDefaultAdmin() {
  const adminExists = await User.findOne({ roles: { $elemMatch: { name: 'admin' } } });

  if (!adminExists) {
    const existingUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (existingUser) {
      console.log('A user with this email already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    // Ensure 'admin' role exists
    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      adminRole = new Role({ name: 'admin' });
      await adminRole.save();
      console.log('Admin role created.');
    }

    const admin = new User({
      username: 'admin',
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      roles: [new mongoose.Types.ObjectId(adminRole._id)],
      isVerified: true,
    });

    await admin.save();
    console.log('Default admin user created');
  } else {
    console.log('Admin user already exists');
  }
}

module.exports = createDefaultAdmin;
