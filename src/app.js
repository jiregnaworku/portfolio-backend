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

// ==========================
// CORS Configuration
// ==========================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'https://jiregnaworku.github.io', // GitHub Pages root
 // replace with deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman or mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// ==========================
// Security & Logging
// ==========================
app.use(helmet());
app.use(morgan('dev'));

// ==========================
// Body Parser
// ==========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ==========================
// Static Files (uploads)
// ==========================
app.use('/uploads', express.static(path.join(process.cwd(), 'backend', 'uploads')));

// ==========================
// Rate Limiting
// ==========================
app.use('/api/', apiLimiter);

// ==========================
// API Routes
// ==========================
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// ==========================
// Root & Health Check
// ==========================
app.get('/', (req, res) => {
  res.json({
    message: 'Backend API is running',
    version: '1.0.0',
    health: '/api/health',
    docs: 'API endpoints available at /api/*'
  });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ==========================
// 404 & Error Handling
// ==========================
app.use(notFound);
app.use(errorHandler);

module.exports = app;
