import express from 'express';
import apiRoutes from '../src/server/routes/api.routes';
import { errorMiddleware } from '../src/server/middleware/error.middleware';
import { corsMiddleware } from '../src/server/middleware/cors.middleware';
import { getDbPool } from '../src/services/database.service';

// Initialize Express application
const app = express();

// Apply middleware
app.use(express.json());
app.use(corsMiddleware);

// Initialize database connection
const pool = getDbPool();

// Add pool to request object
app.use((req, res, next) => {
  req.dbPool = pool;
  next();
});

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Export for Vercel
export default app;