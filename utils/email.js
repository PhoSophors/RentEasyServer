const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const User = require('../models/userModel');

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (email, otp) => {
  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  // Extract the username from the user object
  const username = user.username;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'OTP for password reset',
    html: `
      <div style="text-align: center; padding: 20px; color: #444;">
        <img src="https://png.pngtree.com/png-clipart/20230922/original/pngtree-house-logo-template-vector-illustration-home-rent-template-vector-png-image_12520954.png" 
          alt="Your Logo" style="max-width: 100px;">
          <h1 style="font-size: 24px; color: #444;">Hello <span style="text-transform: capitalize;">${username}! 👏</span></h1>
        <p style="font-size: 14px; color: #666;">
          Please use the following OTP to complete your authentication process to comtinue RentEasy.:
        </p>
        <div style="font-size: 32px; background-color: #f9f9f9; padding: 10px; border-radius: 5px; color: #333;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #666;">
          This OTP is valid for 10 minute. Do not share it with anyone.
        </p>
        <p style="font-size: 16px; color: #888; margin-top: 20px;">
        &#169;https://sophors.vercel.app
      </p>
      </div>
      `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.log('Error sending email: ', error);
  }
};

module.exports = { sendOTP };
