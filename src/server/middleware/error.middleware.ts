import { Request, Response, NextFunction } from 'express';

/**
 * Centralized error handling middleware
 */
export function errorMiddleware(
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void {
  // Log the error for server-side debugging
  console.error('Error:', err);

  // Database query errors
  if (err.message.includes('syntax') || 
      err.message.includes('relation') ||
      err.message.includes('column')) {
    res.status(400).json({
      error: true,
      message: err.message,
      type: 'database_error'
    });
    return;
  }

  // Handle initialization errors
  if (err.message.includes('not initialized')) {
    res.status(400).json({
      error: true,
      message: err.message,
      type: 'initialization_error'
    });
    return;
  }

  // Default error response
  res.status(500).json({
    error: true,
    message: err.message || 'An unexpected error occurred',
    type: 'server_error'
  });
}