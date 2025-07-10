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
    database: process.env.DB_DATABASE || 'matrix_sql',
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