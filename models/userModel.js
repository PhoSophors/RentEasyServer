const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  profilePhoto: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: [true, 'Please provide a username'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  refreshToken: {
    type: String,
  },
  roles: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
  },
  posts: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
  }],
  favorites: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Favorites',
  }],
  messages: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Message',
  }],
  messagedUsers: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: () => {
      const date = new Date();
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    },
  },
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
