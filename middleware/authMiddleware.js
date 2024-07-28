const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user from payload
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = authMiddleware;
