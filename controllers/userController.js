const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sendOTP } = require('../utils/email');

// REGISTER USER ====================================================================
exports.register = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  try {
    // Check if all required fields are provided
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate username length
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: "Username must be between 3 and 20 characters long" });
    }

    // Validate email
    const user = await User.findOne({ email });
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: 'User already exists' });
      } else {
        // If user exists but not verified, resend OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();
        await sendOTP(email, otp);
        
        return res.status(200).json({ message: 'User exists but not verified. New OTP sent to email' });
      }
    }

    // Validate password length
    if (password.length < 6 || password.length > 20) {
      return res.status(400).json({ error: "Password must be between 6 and 20 characters long" });
    }

    // Check if password contains both text and numbers
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: "Password must contain both text and numbers" });
    }

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username, 
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });
    await newUser.save();

    await sendOTP(email, otp);
    
    res.status(201).json({ message: 'Register successfully, Please verify OTP.' });
  } catch (err) {
    console.error('Error in registration:', err); 
    res.status(500).json({ message: 'Server error' });
  }
};

// VERIFY OTP ====================================================================
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      message: 'Email verified successfully',
      authToken: token 
    });
  } catch (err) {
    console.error('Error in OTP verification:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// LOGIN USER ====================================================================
exports.userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'User not found, please register' });
    }

    if (!user.isVerified) {
      console.log('Email not verified');
      return res.status(400).json({ message: 'Email not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({ token });
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
