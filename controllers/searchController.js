// controllers/searchController.js

const User = require('../models/userModel');
const Post = require('../models/postModel');

// SEARCH CONTENT AND USERS BY QUERY ================================
exports.search = async (req, res) => {
  try {
    let { query } = req.query;

    if (!query) {
      return res.status(400).json({
        status: 'fail',
        message: 'Query parameter is required',
      });
    }

    query = String(query);

    console.log("Search Query:", query); // Log the search query

    const users = await User.find({ username: { $regex: query, $options: 'i' } });
    const posts = await Post.find({ 
      $or: [
        { content: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } }
      ]
    });

    console.log("Found Users:", users); // Log the found users
    console.log("Found Posts:", posts); // Log the found posts

    res.status(200).json({
      status: 'success',
      data: {
        users,
        posts,
      },
    });
  } catch (error) {
    console.log("Error:", error); // Log the error
    res.status(400).json({
      status: 'fail',
      message: error.message, // Send only the error message
    });
  }
};