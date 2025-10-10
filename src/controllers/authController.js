const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const { signToken } = require('../middleware/auth');

// Simple email/password login
const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken({ email, role: 'admin' });

    res.json({
      message: 'Login successful',
      token,
      admin: {
        email: admin.email,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new admin account
const signup = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ email, password: hashedPassword });

    const token = signToken({ email, role: 'admin' });

    res.status(201).json({
      message: 'Admin account created successfully',
      token,
      admin: {
        email: admin.email,
        role: 'admin'
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating admin account' });
  }
};

// Validate token endpoint
const validateToken = async (req, res) => {
  try {
    // If we reach here, the token is valid (JWT middleware passed)
    res.json({ valid: true, message: 'Token is valid' });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ valid: false, message: 'Token is invalid' });
  }
};

module.exports = { login, signup, validateToken };
