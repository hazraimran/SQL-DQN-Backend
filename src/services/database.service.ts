import pg from 'pg';
import dotenv from 'dotenv';
import { DbConfig } from '../types/types';

dotenv.config();

// Database singleton instance
let pool: pg.Pool | null = null;

/**
 * Get database configuration from environment variables
 */
export function getDbConfig(): DbConfig {
  return {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_DATABASE || 'postgres',
    ssl: {
      rejectUnauthorized: false // 开发环境设置为 false，生产环境建议设置为 true
    }
  };
}

/**
 * Initialize database connection pool
 */
export function initDbPool(config?: DbConfig): pg.Pool {
  if (pool) return pool;
  
  const dbConfig = config || getDbConfig();
  pool = new pg.Pool(dbConfig);
  
  // Add error handler to prevent app crashes on connection issues
  pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
  });
  
  return pool;
}

/**
 * Get the database pool instance
 */
export function getDbPool(): pg.Pool {
  if (!pool) {
    return initDbPool();
  }
  return pool;
}

/**
 * Close the database pool connection
 */
export async function closeDbPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Record a user's answer in the database
 */
export async function recordUserAnswer(
  pool: pg.Pool,
  {
    questionId,
    userQuery,
    isCorrect,
    attempts,
    hintsUsed
  }: {
    questionId: number;
    userQuery: string;
    isCorrect: boolean;
    attempts: number;
    hintsUsed: boolean;
  }
): Promise<void> {
  const query = `
    INSERT INTO user_answers (question_id, user_query, is_correct, attempts, hints_used)
    VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [questionId, userQuery, isCorrect, attempts, hintsUsed];

  try {
    await pool.query(query, values);
    console.log('User answer recorded successfully.');
  } catch (error) {
    console.error('Error recording user answer:', error);
    // Depending on requirements, you might want to re-throw the error
    // or handle it gracefully without crashing the app.
  }
}