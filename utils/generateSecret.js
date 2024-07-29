const crypto = require('crypto');

const generateSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

const jwtRefreshSecret = generateSecret();
console.log('JWT_REFRESH_SECRET:', jwtRefreshSecret);