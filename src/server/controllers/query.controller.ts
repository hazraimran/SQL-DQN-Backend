import { Request, Response, NextFunction } from 'express';
import { processUserQuery } from '../../services/agent.service';
import { getDbPool } from '../../services/database.service';

/**
 * Handle SQL query submissions
 */
export async function queryController(
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    const { userQuery, expected = [], attempts, hintsUsed } = req.body;
    // Validate input
    if (!userQuery || typeof userQuery !== 'string') {
      throw new Error('Invalid userQuery: must provide a SQL query string');
    }
    
    console.log('Received query:', userQuery);
    
    // Get database pool
    const pool = getDbPool();
    
    // Process the query
    const { nextState, action, reward, resultFromDB, correct } = 
      await processUserQuery(userQuery, pool, expected, attempts, hintsUsed);
    
    // Return success response
    res.json({
      newMastery: nextState.mastery,
      action,
      reward,
      resultFromDB,
      correct
    });
  } catch (error) {
    // Pass to error handler middleware
    next(error);
  }
}