require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const quizRoutes = require('./routes/quizRoutes');
const historyRoutes = require('./routes/historyRoutes');
const authRoutes = require('./routes/authRoutes');

// Import middleware
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/auth', authRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// Error handling middleware
app.use(errorHandler);

// Only listen when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
  });
}

// Export for Vercel serverless
module.exports = app;
