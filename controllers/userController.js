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
      token 
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
      return res.status(400).json({ message: 'User not found, please register' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Email not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate access token
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30m', // shorter lifespan
    });

    // Generate refresh token
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d', // longer lifespan
    });

    // Save the refresh token to the database
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ 
      message: "Login successfully",
      accessToken, 
      refreshToken 
    });
  } catch (err) {
    console.error('Error in login:', err);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET);
    res.status(500).json({ message: 'Server error' });
  }
};

// REFRESH TOKEN =============================================================
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Generate a new access token
    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30m',
    });

    res.json({ newAccessToken });
  } catch (err) {
    console.error('Error in refresh token:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// REQUEST RESET PASSWORD =============================================================
exports.requestResetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();
    await sendOTP(email, otp);

    res.status(200).json({ message: 'OTP sent to your email for resets password.' });
  } catch (err) {
    console.error('Error in requesting reset password:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// VERIFY RESET PASSWORD OTP =============================================================
exports.verifyResetPasswordOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully, Please set new password.' });
  } catch (err) {
    console.error('Error in verifying reset password OTP:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// SET NEW PASSWORD =============================================================
exports.setNewPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully, Please Login to your account.' });
  } catch (err) {
    console.error('Error in setting new password:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


