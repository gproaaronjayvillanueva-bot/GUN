const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const generateToken = (userId, username) => {
  return jwt.sign(
    { userId, username },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = { auth, generateToken };
