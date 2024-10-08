const User = require('../models/userModel');
const Role = require('../models/roleModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sendOTP } = require('../utils/email');
const { body, validationResult } = require('express-validator');
// aws
const { upload, deleteFileFromS3 } = require('../config/S3Helper');

// REGISTER USER ====================================================================
exports.register = async (req, res) => {
  const { username, email, password, confirmPassword, profilePhoto, coverPhoto, bio, location  } = req.body;

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

    // Ensure 'user' role exists
    let userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      userRole = new Role({ name: 'user' });
      await userRole.save();
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username, 
      email,
      coverPhoto,
      profilePhoto,
      bio,
      location,
      password: hashedPassword,
      otp,
      otpExpires,
      roles: [userRole],
    });
    
    try {
      await newUser.save();
      console.log('User saved successfully');
    } catch (error) {
      console.error('Error saving user:', error);
    }

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
      expiresIn: '30d', // shorter lifespan
    });

    // Generate refresh token
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '70d', // longer lifespan
    });

    // Save the refresh token to the database
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ 
      message: "Login successfully",
      accessToken, 
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
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

  // Input validation
  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'Email, new password, and confirmation password are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Hash and set the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully, Please Login to your account.' });
  } catch (err) {
    console.error('Error in setting new password:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// USER PROFILE ====================================================================
exports.userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Error in getting user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// UPDATE PROFILE ====================================================================
exports.updateProfile = [
  // Validate and sanitize inputs
  // body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  // body('email').optional().isEmail().withMessage('Invalid email address'),

  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 }
  ]),

  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { username, email, bio, location  } = req.body;

      // Check if email is already in use
      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        user.email = email;
      }

      if (req.files && req.files.profilePhoto) {
        if (user.profilePhoto) {
          const oldImageKey = user.profilePhoto.replace(
            `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`,
            ""
          );
          await deleteFileFromS3(oldImageKey);
        }
        user.profilePhoto = req.files.profilePhoto[0].location;
      }
      
      if (req.files && req.files.coverPhoto) {
        if (user.coverPhoto) {
          const oldImageKey = user.coverPhoto.replace(
            `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`,
            ""
          );
          await deleteFileFromS3(oldImageKey);
        }
        user.coverPhoto = req.files.coverPhoto[0].location;
      }

      if (username) {
        user.username = username;
      }

      if (bio) {
        user.bio = bio;
      }

      if (location) {
        user.location = location;
      }

      await user.save();
      res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
      console.error('Error in profile update:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
];