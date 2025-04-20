import express from 'express';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import apiRoutes from './routes/api.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { initDbPool } from '../services/database.service';

// Get directory name for serving static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Start the Express server
 */
export async function startServer(port: number): Promise<void> {
  // Initialize database pool
  initDbPool();
  
  // Create Express application
  const app = express();
  
  // Middleware
  app.use(express.json());
  
  // Serve static files
  app.use(express.static(join(__dirname, '../../public')));
  
  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  
  // API routes
  app.use(apiRoutes);
  
  // Error handling middleware
  app.use(errorMiddleware);
  
  // Start server
  return new Promise((resolve) => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      resolve();
    });
  });
}