/**
 * Property-Based Tests for Database Connection Pool Stability
 * Feature: mysql-migration, Property 16: Connection pool stability
 * Validates: Requirements 9.3
 */

import { test } from 'node:test';
import assert from 'node:assert';
import fc from 'fast-check';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(dirname(__dirname), '.env') });

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'medreminder',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

/**
 * Property 16: Connection pool stability
 * For any sequence of database queries, the connection pool should maintain stable size by releasing connections after use
 */
test('Property 16: Connection pool stability', async () => {
  let pool;

  try {
    // Create connection pool
    try {
      pool = mysql.createPool(dbConfig);
      // Test connection
      const testConn = await pool.getConnection();
      testConn.release();
    } catch (error) {
      if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ECONNREFUSED') {
        console.log('⚠️  Database connection failed');
        console.log('📝 Please ensure:');
        console.log('   1. MySQL is running');
        console.log('   2. .env file is configured with correct credentials');
        console.log('   3. Database schema is created');
        throw new Error('Database not configured. See instructions above.');
      }
      throw error;
    }

    await fc.assert(
      fc.asyncProperty(
        // Generate random number of concurrent queries (1 to 20)
        fc.integer({ min: 1, max: 20 }),
        // Generate random query delay (0 to 100ms to simulate work)
        fc.integer({ min: 0, max: 100 }),
        async (numQueries, queryDelay) => {
          // Track active connections
          const activeConnections = new Set();
          let maxConcurrentConnections = 0;

          // Execute multiple queries concurrently
          const queries = Array.from({ length: numQueries }, async (_, i) => {
            const connection = await pool.getConnection();
            
            // Track this connection
            activeConnections.add(connection);
            maxConcurrentConnections = Math.max(maxConcurrentConnections, activeConnections.size);
            
            try {
              // Simulate query work with delay
              await new Promise(resolve => setTimeout(resolve, queryDelay));
              
              // Execute a simple query
              await connection.query('SELECT 1 as test');
              
              return { success: true, index: i };
            } finally {
              // Always release connection
              activeConnections.delete(connection);
              connection.release();
            }
          });

          // Wait for all queries to complete
          const results = await Promise.all(queries);

          // Verify all queries succeeded
          assert.strictEqual(
            results.filter(r => r.success).length,
            numQueries,
            'All queries should complete successfully'
          );

          // Wait a bit for connections to be fully released
          await new Promise(resolve => setTimeout(resolve, 50));

          // Verify: All connections should be released
          assert.strictEqual(
            activeConnections.size,
            0,
            'All connections should be released after queries complete'
          );

          // Verify: Max concurrent connections should not exceed pool limit
          assert.ok(
            maxConcurrentConnections <= dbConfig.connectionLimit,
            `Max concurrent connections (${maxConcurrentConnections}) should not exceed limit (${dbConfig.connectionLimit})`
          );

          // Test that we can still get a connection (pool is healthy)
          const testConnection = await pool.getConnection();
          assert.ok(testConnection, 'Should be able to acquire connection after queries');
          testConnection.release();
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in the design
    );

    console.log('✅ Property 16 passed: Connection pool maintains stability across concurrent queries');
  } catch (error) {
    console.error('❌ Property test failed:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
});

/**
 * Additional test: Verify connection release on query error
 */
test('Property 16 (error case): Connections released even on query errors', async () => {
  let pool;

  try {
    pool = mysql.createPool(dbConfig);
    
    // Test connection
    const testConn = await pool.getConnection();
    testConn.release();

    await fc.assert(
      fc.asyncProperty(
        // Generate random number of queries (5 to 15)
        fc.integer({ min: 5, max: 15 }),
        async (numQueries) => {
          // Track active connections
          const activeConnections = new Set();

          // Execute queries that will fail
          const queries = Array.from({ length: numQueries }, async () => {
            const connection = await pool.getConnection();
            activeConnections.add(connection);
            
            try {
              // Execute an invalid query that will fail
              await connection.query('SELECT * FROM nonexistent_table_xyz');
              return { success: true };
            } catch (error) {
              // Expected to fail
              return { success: false, error: error.code };
            } finally {
              // Always release connection even on error
              activeConnections.delete(connection);
              connection.release();
            }
          });

          // Wait for all queries to complete
          const results = await Promise.all(queries);

          // Verify all queries failed as expected
          assert.ok(
            results.every(r => !r.success),
            'All queries should fail (querying non-existent table)'
          );

          // Wait for connections to be fully released
          await new Promise(resolve => setTimeout(resolve, 50));

          // Verify: All connections should be released even after errors
          assert.strictEqual(
            activeConnections.size,
            0,
            'All connections should be released even after query errors'
          );

          // Test that pool is still healthy
          const testConnection = await pool.getConnection();
          assert.ok(testConnection, 'Pool should still be healthy after errors');
          testConnection.release();
        }
      ),
      { numRuns: 50 } // Run 50 iterations for error case
    );

    console.log('✅ Property 16 (error case) passed: Connections properly released even on query errors');
  } catch (error) {
    console.error('❌ Property test failed:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
});

/**
 * Additional test: Verify pool handles connection limit correctly
 */
test('Property 16 (limit case): Pool queues requests when limit reached', async () => {
  let pool;

  try {
    // Create pool with small connection limit for testing
    const smallPoolConfig = {
      ...dbConfig,
      connectionLimit: 3
    };
    
    pool = mysql.createPool(smallPoolConfig);
    
    // Test connection
    const testConn = await pool.getConnection();
    testConn.release();

    await fc.assert(
      fc.asyncProperty(
        // Generate number of queries exceeding pool limit (5 to 10)
        fc.integer({ min: 5, max: 10 }),
        // Generate query duration (50 to 200ms)
        fc.integer({ min: 50, max: 200 }),
        async (numQueries, queryDuration) => {
          const startTime = Date.now();
          const connectionAcquireTimes = [];
          const activeConnections = new Set();
          let maxConcurrentConnections = 0;

          // Execute more queries than pool limit
          const queries = Array.from({ length: numQueries }, async (_, i) => {
            const acquireStart = Date.now();
            const connection = await pool.getConnection();
            const acquireEnd = Date.now();
            
            activeConnections.add(connection);
            maxConcurrentConnections = Math.max(maxConcurrentConnections, activeConnections.size);
            
            connectionAcquireTimes.push({
              index: i,
              acquireTime: acquireEnd - acquireStart
            });
            
            try {
              // Hold connection for specified duration
              await new Promise(resolve => setTimeout(resolve, queryDuration));
              await connection.query('SELECT 1');
              return { success: true };
            } finally {
              activeConnections.delete(connection);
              connection.release();
            }
          });

          // Wait for all queries to complete
          const results = await Promise.all(queries);
          const endTime = Date.now();

          // Verify all queries succeeded
          assert.strictEqual(
            results.filter(r => r.success).length,
            numQueries,
            'All queries should complete successfully'
          );

          // Verify: Some queries had to wait (queued) since we exceeded pool limit
          const queriesWithWait = connectionAcquireTimes.filter(t => t.acquireTime > 10);
          if (numQueries > smallPoolConfig.connectionLimit) {
            assert.ok(
              queriesWithWait.length > 0,
              'Some queries should have waited when pool limit was exceeded'
            );
          }

          // Verify: Max concurrent connections should not exceed pool limit
          assert.ok(
            maxConcurrentConnections <= smallPoolConfig.connectionLimit,
            `Max concurrent connections (${maxConcurrentConnections}) should not exceed limit (${smallPoolConfig.connectionLimit})`
          );

          // Wait for cleanup
          await new Promise(resolve => setTimeout(resolve, 50));

          // Verify: All connections released
          assert.strictEqual(
            activeConnections.size,
            0,
            'All connections should be released after queued requests complete'
          );

          // Test pool is still healthy
          const testConnection = await pool.getConnection();
          assert.ok(testConnection, 'Pool should be healthy after handling queued requests');
          testConnection.release();
        }
      ),
      { numRuns: 30 } // Run 30 iterations for limit case
    );

    console.log('✅ Property 16 (limit case) passed: Pool correctly queues requests when limit reached');
  } catch (error) {
    console.error('❌ Property test failed:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
});
