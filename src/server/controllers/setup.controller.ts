import { Request, Response, NextFunction } from 'express';
import { initAgentEnv } from '../../services/agent.service';
import { getDbPool } from '../../utils/database.utils';

/**
 * Handle setup form submissions
 */
export async function setupController(
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    const { conceptsLength } = req.body;
    
    // Validate input
    if (!conceptsLength || typeof conceptsLength !== 'number' || conceptsLength <= 0) {
      throw new Error('Invalid conceptsLength: must be a positive number');
    }
    
    console.log('Received setup request:', { conceptsLength });
    
    // Get database pool and initialize agent
    const pool = getDbPool();
    const action = await initAgentEnv(conceptsLength, pool);
    
    // Return success response
    res.json({ action });
  } catch (error) {
    // Pass to error handler middleware
    next(error);
  }
}