// models/postModel.js

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Please provide a title"],
  },
  content: {
    type: String,
    required: [true, "Please provide content"],
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  contact: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  bedrooms: {
    type: Number,
    required: true,
  },
  bathrooms: {
    type: Number,
    required: true,
  },
  // The type of property (e.g., apartment, house, condo).
  propertytype: {
    type: String,
    required: true,
    enum: ["house", "vila", "apartment", "hotel", "condo", "townhouse", "room"],
  },
  createdAt: {
    type: Date,
    default: () => {
      const date = new Date();
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    },
  },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
