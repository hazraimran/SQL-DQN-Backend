import express, { Request, Response, NextFunction } from 'express';
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
 * Create Express application
 */
export function createServer(): express.Application {
  // Initialize database pool
  initDbPool();
  
  // Create Express application
  const app = express();
  
  // Middleware
  app.use(express.json());
  
  // Serve static files
  app.use(express.static(join(__dirname, '../../public')));
  
  // CORS headers - 更新允许的源
  app.use((req, res, next) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://your-frontend-domain.vercel.app' // 替换为你的前端域名
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin as string)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    next();
  });
  
  // API routes
  app.use('/api', apiRoutes); // 添加 /api 前缀
  
  // 健康检查端点
  app.get('/', (req, res) => {
    res.json({ message: 'SQL DQN Backend is running!' });
  });
  
  // Error handling middleware
  app.use(errorMiddleware);
  
  return app;
}

/**
 * Start the Express server (for local development)
 */
export async function startServer(port: number): Promise<void> {
  const app = createServer();
  
  return new Promise((resolve) => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      resolve();
    });
  });
}