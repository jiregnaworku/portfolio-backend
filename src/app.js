const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const projectRoutes = require('./routes/projectRoutes');
const authRoutes = require('./routes/authRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

app.use(helmet());

// Main CORS middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded images (local)
app.use('/uploads', express.static(path.join(process.cwd(), 'backend', 'uploads')));

// API limiter
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Errors
app.use(notFound);
app.use(errorHandler);

module.exports = app;
