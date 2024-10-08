const Post = require("../models/postModel");
const Favorites = require("../models/favoritesModel");

// ADD FAVORITE =================================================================
exports.addFavorite = async (req, res) => {
  const { postId } = req.params;

  console.log("Post ID:", postId);

  try {
    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    } else if (req.user.favorites.includes(postId)) {
      return res.status(400).json({ message: "Post already in favorites" });
    }

    // Add favorites to user array
    req.user.favorites.push(postId);

    // Save the updated to document
    await req.user.save();

    // Get Favorites count from user document
    const favoritesCount = req.user.favorites.length;

    const favorite = await Favorites.create({
      user: req.user._id,
      post: postId,
    });

    res.status(201).json({
      status: "success",
      message: "Post added to favorites",
      data: {
        favoritesCount,
        favorite,
      },
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(400).json({
      status: "fail",
      message: "Fail to add post to favorites",
      error: error.message,
    });
  }
};

// REMOVE FAVORITE =================================================================
exports.removeFavorite = async (req, res) => {
  const { postId } = req.params;

  try {
    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    } else if (!req.user.favorites.includes(postId)) {
      return res.status(400).json({ message: "Post not in favorites" });
    }

    // Remove favorites from user array
    await req.user.favorites.splice(req.user.favorites.indexOf(postId), 1);

    // Save the updated to document
    await req.user.save();

    await Favorites.findOneAndDelete({ user: req.user._id, post: postId });

    res.status(200).json({
      status: "success",
      message: "Post removed from favorites",
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(400).json({
      status: "fail",
      message: "Fail to remove post from favorites",
      error: error.message,
    });
  }
};

// GET FAVORITES =================================================================
exports.getAllFavoritesByUserAdd = async (req, res) => {
  try {
    const favorites = await Favorites.find({ user: req.user._id })
      .populate({
        path: "post",
        populate: {
          path: "user", // Populate the user field within the post
          model: "User", // Specify the model if necessary
        },
      })
      .populate("user"); // Populate the user field in the favorites

    if (!favorites.length) {
      return res.status(404).json({
        status: "fail",
        message: "No favorites found.",
      });
    }

    const favoritesCount = favorites.length;

    res.status(200).json({
      status: "success",
      message: "Favorites retrieved successfully.",
      data: {
        favoritesCount,
        favorites,
      },
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(400).json({
      status: "fail",
      message: "Fail to get all favorites",
      error: error.message,
    });
  }
};
