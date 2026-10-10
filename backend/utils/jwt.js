const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'queueless_super_secret_jwt_key_2026_gov_office', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'queueless_super_secret_jwt_key_2026_gov_office');
};

module.exports = {
  generateToken,
  verifyToken,
};
