const { Router } = require('express');
const { login, validateToken, getAdmins, createAdmin, updateAdmin, deleteAdmin } = require('../controllers/authController');
const { authRequired } = require('../middleware/auth');

const router = Router();

// Simple email/password authentication routes
router.post('/login', login);

// Admin management routes (protected)
router.get('/admins', authRequired, getAdmins);
router.post('/admins', authRequired, createAdmin);
router.put('/admins/:id', authRequired, updateAdmin);
router.delete('/admins/:id', authRequired, deleteAdmin);

module.exports = router;
