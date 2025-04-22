import { Request, Response, NextFunction } from 'express';

/**
 * CORS middleware to handle cross-origin requests
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Get allowed origins from environment or use wildcard
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['*'];
  
  // Get the origin header
  const origin = req.headers.origin;
  
  // If origin matches allowed origins or wildcard is enabled, set the CORS header
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  // Set allowed methods
  res.header(
    'Access-Control-Allow-Methods', 
    process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS'
  );
  
  // Set allowed headers
  res.header(
    'Access-Control-Allow-Headers', 
    process.env.CORS_HEADERS || 'Origin,X-Requested-With,Content-Type,Accept,Authorization'
  );
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
}