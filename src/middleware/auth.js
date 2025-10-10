const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const signToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  return jwt.verify(token, secret);
};

const authRequired = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const validateAdminCredentials = async (email, password) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const plain = process.env.ADMIN_PASSWORD;
  if (!adminEmail || (!hash && !plain)) return false;
  if (email !== adminEmail) return false;
  if (hash) return bcrypt.compare(password, hash);
  return password === plain;
};

module.exports = { signToken, verifyToken, authRequired, validateAdminCredentials };
