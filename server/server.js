import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import authRouter from './routes/auth.js';
import expensesRouter from './routes/expenses_new.js';
import incomeRouter from './routes/income.js';
import './database/mysql.js'; // Initialize MySQL database
import './database/seed.js'; // Seed default user

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Expense Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
const API_PREFIX = process.env.API_PREFIX || '/api';
app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/expenses`, expensesRouter);
app.use(`${API_PREFIX}/income`, incomeRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}${API_PREFIX}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
