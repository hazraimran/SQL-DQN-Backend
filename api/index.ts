import express from 'express';
import apiRoutes from '../src/server/routes/api.routes';
import { errorMiddleware } from '../src/server/middleware/error.middleware';
import { corsMiddleware } from '../src/server/middleware/cors.middleware';
import { getDbPool } from '../src/services/database.service';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Apply middleware
app.use(express.json());
app.use(corsMiddleware);

// Initialize database connection
try {
  const pool = getDbPool();
  
  // Add pool to request object
  app.use((req: any, res: any, next: any) => {
    req.dbPool = pool;
    next();
  });
} catch (error) {
  console.error('Database connection error:', error);
  // Continue with app setup but log the error
}

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use(errorMiddleware);

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
export default app;