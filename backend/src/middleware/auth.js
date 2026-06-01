const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tajni_kljuc_123';

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin required' });
  }
  next();
}

module.exports = { authenticate, requireAdmin, JWT_SECRET };