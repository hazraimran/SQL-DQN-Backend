import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_DATABASE || 'matrix_sql',
  ssl: {
    rejectUnauthorized: false
  }
};

console.log('=== Database Connection Test ===');
console.log('Configuration (password hidden):');
console.log({
  user: dbConfig.user,
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  ssl: dbConfig.ssl,
  password: dbConfig.password ? '***' : 'NOT SET'
});

// Test database connection
async function testDatabaseConnection() {
  let pool;
  
  try {
    console.log('\n1. Creating connection pool...');
    pool = new Pool(dbConfig);
    
    console.log('2. Testing connection...');
    const client = await pool.connect();
    console.log('✅ Successfully connected to database!');
    
    console.log('3. Testing basic query...');
    const result = await client.query('SELECT NOW() as current_time, version()');
    console.log('✅ Query executed successfully!');
    console.log('Current time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].version);
    
    console.log('\n4. Testing database schema...');
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('✅ Found tables in database:');
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.tablename}`);
      });
    } else {
      console.log('⚠️  No tables found in public schema');
    }
    
    // Release the client
    client.release();
    
    console.log('\n5. Testing connection pool close...');
    await pool.end();
    console.log('✅ Connection pool closed successfully!');
    
    console.log('\n🎉 All database tests passed!');
    
  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    // Provide specific troubleshooting advice
    if (error.message.includes('pg_hba.conf')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   - The database server is rejecting your connection');
      console.log('   - Check if your IP address is allowed in pg_hba.conf');
      console.log('   - Try enabling SSL/TLS encryption');
      console.log('   - Verify your database credentials');
    }
    
    if (error.message.includes('no encryption')) {
      console.log('\n💡 SSL/TLS issue:');
      console.log('   - Your database requires encrypted connections');
      console.log('   - Make sure SSL is properly configured');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused:');
      console.log('   - Check if database server is running');
      console.log('   - Verify host and port are correct');
      console.log('   - Check firewall settings');
    }
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Host not found:');
      console.log('   - Check if database host address is correct');
      console.log('   - Verify DNS resolution');
    }
    
    process.exit(1);
  } finally {
    if (pool) {
      try {
        await pool.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

// Run the test
testDatabaseConnection(); 