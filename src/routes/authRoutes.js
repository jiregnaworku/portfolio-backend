const { Router } = require('express');
const { login, signup, validateToken } = require('../controllers/authController');
const { authRequired } = require('../middleware/auth');

const router = Router();

// Simple email/password authentication routes
router.post('/login', login);
router.post('/signup', signup);

// Token validation endpoint (protected)
router.post('/validate', authRequired, validateToken);

module.exports = router;
