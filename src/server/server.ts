import express, { Application } from 'express';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import apiRoutes from './routes/api.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { corsMiddleware } from './middleware/cors.middleware';
import { getDbPool } from '../services/database.service';
import { createServer } from 'http';
import { Server } from 'http';

// Get directory name for serving static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Initialize Express application with middleware and routes
 */
function createApp(): Application {
  // Create Express application
  const app = express();
  
  // Core middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Serve static files
  app.use(express.static(join(__dirname, '../../public')));
  
  // CORS headers
  app.use(corsMiddleware);
  
  // API routes
  app.use('/api', apiRoutes);
  
  // Error handling middleware - should be last
  app.use(errorMiddleware);
  
  return app;
}

/**
 * Start the Express server
 */
export async function startServer(port: number): Promise<Server> {
  try {
    // Initialize database pool early to catch issues
    const pool = getDbPool();
    await pool.query('SELECT 1');
    console.log('Database connection established');
    
    // Initialize application
    const app = createApp();
    
    // Start HTTP server
    const server = createServer(app);
    
    return new Promise((resolve, reject) => {
      server.listen(port);
      
      server.on('listening', () => {
        console.log(`Server running on http://localhost:${port}`);
        resolve(server);
      });
      
      server.on('error', (error) => {
        console.error('Server failed to start:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    throw error;
  }
}

/**
 * Gracefully shutdown server
 */
export async function stopServer(server: Server): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('Server stopped');
      resolve();
    });
  });
}