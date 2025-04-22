import express from 'express';
import { json } from 'body-parser';
import apiRoutes from '../src/server/routes/api.routes';
import { errorMiddleware } from '../src/server/middleware/error.middleware';
import { initDbPool } from '../src/services/database.service';

// Initialize database connection
initDbPool();

// Create Express app
const app = express();

// Apply middleware
app.use(json());
app.use(express.static('public'));

// CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// API routes
app.use(apiRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Export for Vercel
export default app;