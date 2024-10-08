const mongoose = require("mongoose");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const { upload, deleteFileFromS3 } = require("../config/S3Helper");
const { CompleteMultipartUploadRequestFilterSensitiveLog } = require("@aws-sdk/client-s3");

// CREATE POST =================================================================

exports.createPost = [
  upload.array("images", 6), // Limit to 3 images

  async (req, res) => {
    const {
      title,
      content,
      contact,
      location,
      price,
      bedrooms,
      bathrooms,
      propertytype,
    } = req.body;
    const images = req.files.map((file) => file.location); // Get S3 URLs

     // Check if req.files is defined and is an array
    //  const images = req.files && Array.isArray(req.files) ? req.files.map((file) => file.location) : [];

    // Validate post
    if (
      !title ||
      !content ||
      !contact ||
      !location ||
      !price ||
      !bedrooms ||
      !bathrooms ||
      !propertytype 
      // images.length === 0
    ) {
      return res.status(400).json({
        status: "Fail to create post",
        message: "All field are required",
      });
    }
    
    // Validate propertytype
    const validPropertyTypes = ["house", "villa", "apartment", "hotel", "condo", "townhouse", "room"];
    if (!validPropertyTypes.includes(propertytype)) {
      return res.status(400).json({
        status: "Fail to create post",
        message: "Invalid property type. Valid types are: house, villa, apartment, hotel, condo, townhouse, room",
      });
    }
  
    try {
      // Create post
      const newPost = await Post.create({
        title,
        content,
        images,
        contact,
        location,
        price,
        bedrooms,
        bathrooms,
        propertytype,
        user: req.user._id,
      });

      // Ensure the posts array exists in the user object
      if (!req.user.posts) {
        req.user.posts = [];
      }

      // Add post to user's posts array
      req.user.posts.push(newPost._id);
      const populatedPost = await newPost.populate('user');
      await req.user.save();

      // Save user
      await req.user.save();

      res.status(201).json({
        message: "Post created successfully",
        data: {
          newPost,
        },
      });
    } catch (error) {
      console.log("Error:", error);
      res.status(400).json({
        status: "Fail to create",
        message: error.message,
      });
    }
  },
];

// UPDATE POST =================================================================
exports.updatePost = [
  upload.array("images", 3), // Limit to 3 images
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({
          status: "Fail to update",
          message: "Post not found",
        });
      }

      const title = req.body.title;
      const content = req.body.content;
      const images = req.files.map((file) => file.location); // Get S3 URLs
      const contact = req.body.contact;
      const location = req.body.location;
      const price = req.body.price;
      const bedrooms = req.body.bedrooms;
      const bathrooms = req.body.bathrooms;
      const propertytype = req.body.propertytype;

      // Validate post
      if (
        !title ||
        !content ||
        !contact ||
        !location ||
        !price ||
        !bedrooms ||
        !bathrooms ||
        !propertytype ||
        images.length === 0
      ) {
        return res.status(400).json({
          status: "Fail to create post",
          message: "All field are required",
        });
      }
      
      // Validate propertytype
      const validPropertyTypes = ["house", "villa", "apartment", "hotel", "condo", "townhouse", "room"];
      if (!validPropertyTypes.includes(propertytype)) {
        return res.status(400).json({
          status: "Fail to create post",
          message: "Invalid property type. Valid types are: house, villa, apartment, hotel, condo, townhouse, room",
        });
      }

      // Delete old images from S3
      if (post.images && post.images.length > 0) {
        const deletePromises = post.images.map((imageUrl) => {
          const key = imageUrl.split("/").pop(); // Extract key from URL
          return deleteFileFromS3(key);
        });
        await Promise.all(deletePromises);
      }

      // Update post
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        {
          title,
          content,
          images,
          contact,
          location,
          price,
          bedrooms,
          bathrooms,
          propertytype,
        },
        { new: true }
      );

      res.status(200).json({
        status: "success",
        message: "Update Successfully.",
        data: {
          post: updatedPost,
        },
      });
    } catch (error) {
      console.log("Error:", error);
      res.status(400).json({
        status: "Fail to update",
        message: error.message,
      });
    }
  },
];

// DELETE POST =================================================================
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: "Fail to delete",
        message: "Post not found",
      });
    }

    // Delete images from S3
    if (post.images && post.images.length > 0) {
      const deletePromises = post.images.map((imageUrl) => {
        const key = imageUrl.split("/").pop(); // Extract key from URL
        return deleteFileFromS3(key);
      });
      await Promise.all(deletePromises);
    }

    // Use deleteOne instead of remove
    await Post.deleteOne({ _id: post._id });

    // Delete post from user's posts array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { posts: post._id },
    });

    res.status(200).json({
      status: "success",
      message: "Delete Successfully.",
      data: null,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(400).json({
      status: "Fail to delete",
      message: error.message,
    });
  }
};

// GET ALL POSTS ==============================================================
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('user');

    if (!posts) {
      return res.status(404).json({
        status: "fail",
        message: "No posts found.",
      });
    }

    // all post count
    const postsCount = posts.length;

    res.status(200).json({
      status: "success",
      message: "Posts retrieved successfully.",
      data: {
        postsCount: postsCount,
        posts,
      },
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(400).json({
      status: "fail",
      message: "Fail to get all posts",
      error: error.message,
    });
  }
};

// GET POST BY ID ==============================================================
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user');

    if (!post) {
      return res.status(404).json({
        status: "fail",
        message: "Post not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Post retrieved successfully.",
      data: {
        post,
      },
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(400).json({
      status: "fail",
      message: "Fail to get post",
      error: error.message,
    });
  }
};

// GET POSTS BY USER ===========================================================
exports.getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id });

    // Get user posts count
    const postsCount = posts.length;

    if (!posts) {
      return res.status(404).json({
        status: "fail",
        message: "No posts found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Posts retrieved successfully.",

      data: {
        postsCount,
        posts,
      },
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(400).json({
      status: "fail",
      message: "Fail to get posts",
      error: error.message,
    });
  }
};

// GET ALL POST BY PROPERTY TYPE ==============================================
exports.getPostsByPropertyType = async (req, res) => {
  try {
    const posts = await Post.find({ propertytype: req.query.propertytype }).populate('user');

    if (!posts.length) {
      return res.status(404).json({
        status: "fail",
        message: "No posts found",
      });
    }

    // get count of property type
    const postsCount = posts.length;

    res.status(200).json({
      status: "success",
      message: "Posts retrieved successfully.",
      data: {
        postsCount: postsCount,
        posts,
      },
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(400).json({
      status: "fail",
      message: "Fail to get posts",
      error: error.message,
    });
  }
};