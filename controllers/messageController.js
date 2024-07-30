// controllers/messageController.js

const Message = require("../models/messageModel");
const User = require("../models/userModel");

// GET ALL MESSAGES ================================
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find();

    res.status(200).json({
      status: "success",
      results: messages.length,
      data: {
        messages,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// CREATE MESSAGE ================================
exports.createMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    // Check if the sender and receiver exist
    const newMessage = await Message.create({
      senderId,
      receiverId,
      content,
    });

    // Set User id that sent the message in the sender's messages array
    await User.findByIdAndUpdate(senderId, {
      $push: { messages: newMessage._id },
      $addToSet: { messagedUsers: receiverId },
    });

    // Set User id that received the message in the receiver's messages array
    await User.findByIdAndUpdate(receiverId, {
      $push: { messages: newMessage._id },
      $addToSet: { messagedUsers: senderId },
    });

    res.status(201).json({
      status: "success",
      data: {
        status: "success",
        message: newMessage,
      },
    });
  } catch (error) {
    console.log("Error:", error); 
    res.status(400).json({
      status: "fail",
      message: error.message, 
    });
  }
};

// UPDATE MESSAGE ================================
exports.updateMessage = async (req, res) => {
  try {
    const { id } = req.params; // Extract message ID from request parameters
    const { content, status } = req.body; // Extract content and status from request body

    // Find and update the message by ID
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { content, status },
      { new: true, runValidators: true }
    );

    // If no message is found, return a 404 error
    if (!updatedMessage) {
      return res.status(404).json({
        status: "fail",
        message: "No message found with that ID",
      });
    }

    // Return the updated message with a success status
    res.status(200).json({
      status: "success",
      data: {
        status: "success",
        message: updatedMessage,
      },
    });
  } catch (error) {
    console.error("Error updating message:", error); // Log the error with more context
    res.status(400).json({
      status: "fail",
      message: error.message, // Send only the error message
    });
  }
};

// DELETE MESSAGE ================================
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params; // Extract message ID from request parameters

    // Find the message by ID
    const message = await Message.findById(id);

    // If no message is found, return a 404 error
    if (!message) {
      return res.status(404).json({
        status: "fail",
        message: "No message found with that ID",
      });
    }

    // Remove the message reference from the sender's messages array
    await User.findByIdAndUpdate(message.senderId, {
      $pull: { messages: message._id },
    });

    // Return a success status
    res.status(200).json({
      status: "success",
      message: "Message reference removed from sender's messages array",
    });
  } catch (error) {
    console.error("Error deleting message reference:", error); // Log the error with more context
    res.status(400).json({
      status: "fail",
      message: error.message, 
    });
  }
};

// MARK MESSAGE AS READ ================================
exports.markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params; // Extract message ID from request parameters

    // Find and update the message by ID
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { status: "read" },
      { new: true, runValidators: true }
    );

    // If no message is found, return a 404 error
    if (!updatedMessage) {
      return res.status(404).json({
        status: "fail",
        message: "No message found with that ID",
      });
    }

    // Return the updated message with a success status
    res.status(200).json({
      status: "success",
      data: {
        status: "success",
        message: updatedMessage,
      },
    });
  } catch (error) {
    console.error("Error marking message as read:", error); 
    res.status(400).json({
      status: "fail",
      message: error.message, 
    });
  }
};
