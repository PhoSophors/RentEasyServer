// controllers/adminController.js

const User = require('../models/userModel');
const Post = require('../models/postModel');

// GET ALL USERS =========================================================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    const userCount = await User.countDocuments();
    
    res.json({
      status: 'success',
      message: 'All users fetched',
      userCount: userCount, 
      users: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL POSTS =========================================================
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    const postCount = await Post.countDocuments();

    res.json({
        status: 'success',
        message: 'All posts fetched successfully',
        postCount: postCount,
        posts: posts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE USER =========================================================
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE POST =========================================================
exports.deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({
      status: 'success',
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD USER TO ADMIN =========================================================
exports.addUserToSubAdmin = async (req, res) => {
  try {
    const userId = req.body.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = 'subAdmin';
    await user.save();

    res.json({ message: 'User added to subAdmin' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};