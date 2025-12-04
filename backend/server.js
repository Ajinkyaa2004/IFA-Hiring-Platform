import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './server/config/db.js';
import userRoutes from './server/routes/users.js';
import profileRoutes from './server/routes/profiles.js';
import assessmentRoutes from './server/routes/assessments.js';
import leaderboardRoutes from './server/routes/leaderboard.js';
import settingsRoutes from './server/routes/settings.js';
import questionGameRoutes from './server/routes/questionGame.js';
import questionBankRoutes from './server/routes/questionBank.js';
import errorHandler from './server/middleware/errorHandler.js';

dotenv.config();

const app = express();

// Connect to MongoDB (non-blocking for serverless)
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});

// Middleware - CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,              // Frontend URL from environment
  'http://localhost:5173',               // Local development
  'http://localhost:3000',               // Alternative local port
  'http://127.0.0.1:5173',               // Local IP development
  'http://127.0.0.1:3000'                // Local IP alternative
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware - JSON parsing
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/question-game', questionGameRoutes);
app.use('/api/question-bank', questionBankRoutes);
console.log('✅ Settings route registered at /api/settings');
console.log('✅ Question Game routes registered at /api/question-game');
console.log('✅ Question Bank routes registered at /api/question-bank');

// Error handler middleware
app.use(errorHandler);

// Root route - API status
app.get('/', (req, res) => {
  res.json({
    message: 'IFA SkillQuest API is running!',
    status: 'OK',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: '/api/users',
      profiles: '/api/profiles',
      assessments: '/api/assessments',
      leaderboard: '/api/leaderboard',
      settings: '/api/settings',
      questionGame: '/api/question-game'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.url} not found`,
    availableRoutes: ['/api/users', '/api/profiles', '/api/assessments', '/api/leaderboard', '/api/settings']
  });
});

const PORT = process.env.PORT || 5000;

// Listen only in development mode
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export for Vercel serverless
export default app;
