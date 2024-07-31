const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing' });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('roles');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // Attach the user object to the request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.checkRoleMiddleware = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Ensure req.user.roles is an array or convert it to an array if it's an object
  const userRoles = Array.isArray(req.user.roles) 
    ? req.user.roles.map(role => role.name) 
    : [req.user.roles.name]; // Convert to array if it's a single object

  // Ensure roles is an array
  if (!Array.isArray(roles)) {
    return res.status(400).json({ error: 'Roles must be an array' });
  }

  const hasRole = roles.some(role => userRoles.includes(role));
  if (!hasRole) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
};