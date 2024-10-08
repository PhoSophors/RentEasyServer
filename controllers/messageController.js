// controllers/messageController.js

const Message = require("../models/messageModel");
const User = require("../models/userModel");

// GET ALL MESSAGES ================================
// exports.getAllMessages = async (req, res) => {
//   try {
//     const messages = await Message.find();

//     res.status(200).json({
//       status: "success",
//       results: messages.length,
//       data: {
//         messages,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "fail",
//       message: error.message,
//     });
//   }
// };

exports.getAllMessages = async (req, res) => {
  try {
    const userId = req.user._id; // Use the authenticated user's ID

    // Find messages where the authenticated user is either the sender or the receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    });

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
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(400).json({
        status: "fail",
        message: "Sender or receiver does not exist",
      });
    }

 // Prevent sender from sending a message to themselves
 if (senderId === receiverId) {
    return res.status(400).json({
      status: "fail",
      message: "Sender cannot send a message to themselves",
    });
  }

    // Create a new message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      content,
    });

    // Update the sender's messages array
    await User.findByIdAndUpdate(senderId, {
      $push: { messages: newMessage._id },
      $addToSet: { messagedUsers: receiverId },
    });

    // If senderId and receiverId are different, update the receiver's messages array
    if (senderId !== receiverId) {
      await User.findByIdAndUpdate(receiverId, {
        $push: { messages: newMessage._id },
        $addToSet: { messagedUsers: senderId },
      });
    }

    res.status(201).json({
      status: "success",
      data: {
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
exports.getAllUserMessages = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the authenticated user and populate their messages with sender and receiver details
    const user = await User.findById(userId).populate({
      path: 'messages',
      match: {
        $or: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      populate: [
        { path: 'senderId' }, // Populate all fields for sender
        { path: 'receiverId' }  // Populate all fields for receiver
      ]
    });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Extract the IDs of users who have exchanged messages with the authenticated user
    const messagedUserIds = user.messages.map(message => {
      return message.senderId._id.toString() === userId.toString()
        ? message.receiverId._id.toString()
        : message.senderId._id.toString();
    });

    // Remove duplicate user IDs
    const uniqueMessagedUserIds = [...new Set(messagedUserIds)];

    // Find all users who have exchanged messages with the authenticated user
    const messagedUsers = await User.find({ _id: { $in: uniqueMessagedUserIds } });

    // Return all fields of the user
    res.status(200).json({
      status: "success",
      results: messagedUsers.length,
      data: {
        users: messagedUsers
      },
    });
  } catch (error) {
    console.error('Error fetching users with messages:', error);
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
