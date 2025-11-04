const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });
  const parts = String(authHeader).split(' ');
  const token = parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : parts[0];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'please-change-this-secret');
    req.authUser = decoded;
    return next();
  } catch (err) {
    console.error('JWT verify failed', err && err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };
