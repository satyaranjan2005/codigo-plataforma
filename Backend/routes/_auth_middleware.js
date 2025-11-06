const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader) {
    throw new UnauthorizedError('Missing Authorization header');
  }
  
  const parts = String(authHeader).split(' ');
  const token = parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : parts[0];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'please-change-this-secret');
    req.authUser = decoded;
    return next();
  } catch (err) {
    console.error('JWT verify failed', err && err.message);
    if (err.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expired. Please login again.');
    }
    throw new UnauthorizedError('Invalid token. Please login again.');
  }
}

module.exports = { authenticate };
