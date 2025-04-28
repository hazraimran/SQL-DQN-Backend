import { Pool } from 'pg';
import { DbConfig } from '../types/types';

// Configure database connection pools for serverless environment
let pool: Pool | null = null;

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
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : undefined,
    // Optimize for serverless
    max: 1, // Reduce to 1 for serverless
    idleTimeoutMillis: 120000, // Extend idle timeout
    connectionTimeoutMillis: 10000,
  };
}

/**
 * Get database pool (singleton pattern)
 */
export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool(getDbConfig());
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  
  return pool;
}

/**
 * Close database pool (useful for testing and development)
 */
export async function closeDbPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}