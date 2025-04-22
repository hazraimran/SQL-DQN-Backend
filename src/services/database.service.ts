import pg from 'pg';
import dotenv from 'dotenv';
import { DbConfig } from '../types/types';

dotenv.config();

// Singleton pool instance
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
    database: process.env.DB_DATABASE || 'matrix_sql'
  };
}

/**
 * Initialize database connection pool with custom config
 */
export function initDbPool(customConfig?: Partial<DbConfig>): pg.Pool {
  if (pool) return pool;
  
  const defaultConfig = getDbConfig();
  const config = { ...defaultConfig, ...customConfig };
  
  // Determine environment
  const isProd = process.env.NODE_ENV === 'production';
  
  // Create pool with appropriate settings for environment
  pool = new pg.Pool({
    ...config,
    ssl: process.env.DB_SSL === 'true' || isProd 
      ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } 
      : false,
    // Connection pool settings
    max: Number(process.env.DB_POOL_MAX || (isProd ? 1 : 10)),
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT || 120000),
    connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT || 10000)
  });
  
  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err);
    
    // If in production and the connection was terminated/lost, attempt to recreate the pool
    if (isProd && (err.code === 'ECONNRESET' || err.code === '57P01')) {
      console.log('Connection terminated, will recreate pool on next request');
      pool = null;
    }
  });
  
  return pool;
}

/**
 * Get the database pool instance - creates a singleton pool if it doesn't exist
 */
export function getDbPool(): pg.Pool {
  if (!pool) {
    return initDbPool();
  }
  return pool;
}

/**
 * Close the pool when the application terminates
 */
export async function closeDbPool(): Promise<void> {
  if (!pool) return Promise.resolve();
  
  try {
    await pool.end();
    pool = null;
    console.log('Database pool closed successfully');
  } catch (error) {
    console.error('Error closing database pool:', error);
    throw error;
  }
}