import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes';
import { developerRoutes } from './routes/developer.routes';
import { compareRoutes } from './routes/compare.routes';
import { pinRoutes } from './routes/pin.routes';
import { comparisonRoutes } from './routes/comparison.routes';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import { config } from './config/env';

const app = express();

// CORS configuration for local and deployed frontend
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(apiRateLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'StackPulse API',
    timestamp: new Date().toISOString()
  });
});

// Main API Routes
app.use('/api/auth', authRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/pins', pinRoutes);
app.use('/api/comparisons', comparisonRoutes);

// Global Error Handler
app.use(errorHandler);

export { app };
