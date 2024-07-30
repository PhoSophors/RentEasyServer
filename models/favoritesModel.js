// models/faovritesModel.js

const User = require("../models/userModel");
const Post = require("../models/postModel");
const moongoose = require("mongoose");

const favoritesSchema = new moongoose.Schema({
  user: {
    type: moongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: moongoose.Schema.ObjectId,
    ref: "Post",
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => {
      const date = new Date();
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    },
  },
});

const Favorites = moongoose.model("Favorites", favoritesSchema);
module.exports = Favorites;

