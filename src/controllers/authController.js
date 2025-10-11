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

// Get all admins
const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}, { password: 0 }); // Exclude passwords
    res.json(admins);
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new admin
const createAdmin = async (req, res) => {
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

    res.status(201).json({
      message: 'Admin created successfully',
      admin: { email: admin.email, role: admin.role }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Error creating admin' });
  }
};

// Update admin email and/or password
const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { email, password } = req.body || {};

  if (!email && !password) {
    return res.status(400).json({ message: 'Email or password is required' });
  }

  try {
    const updateData = {};
    if (email) updateData.email = email;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const admin = await Admin.findByIdAndUpdate(id, updateData, { new: true, select: '-password' });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      message: 'Admin updated successfully',
      admin: { email: admin.email, role: admin.role }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    console.error('Update admin error:', error);
    res.status(500).json({ message: 'Error updating admin' });
  }
};

// Delete admin
const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findByIdAndDelete(id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ message: 'Admin deleted successfully' });

  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: 'Error deleting admin' });
  }
};

module.exports = { login, validateToken, getAdmins, createAdmin, updateAdmin, deleteAdmin };
