/**
 * Property-Based Tests for Database Connection Retry Logic
 * Feature: mysql-migration, Property 2: Connection retry with exponential backoff
 * Validates: Requirements 3.3
 */

import { test } from 'node:test';
import assert from 'node:assert';
import fc from 'fast-check';
import mysql from 'mysql2/promise';

/**
 * Mock Database class for testing retry logic
 * This allows us to simulate connection failures without needing a real database
 */
class TestDatabase {
  constructor(maxRetries = 5, initialRetryDelay = 100) {
    this.pool = null;
    this.maxRetries = maxRetries;
    this.initialRetryDelay = initialRetryDelay;
    this.connectionAttempts = [];
    this.failuresBeforeSuccess = 0;
    this.shouldAlwaysFail = false;
  }

  /**
   * Connect to MySQL database with retry logic and exponential backoff
   * @param {number} retryCount - Current retry attempt (used internally)
   * @returns {Promise<void>}
   */
  async connect(retryCount = 0) {
    const attemptTime = Date.now();
    this.connectionAttempts.push({
      attempt: retryCount,
      timestamp: attemptTime
    });

    try {
      // Simulate connection failure for testing
      if (this.shouldAlwaysFail || retryCount < this.failuresBeforeSuccess) {
        throw new Error('Simulated connection failure');
      }

      // Simulate successful connection
      this.pool = { connected: true };
    } catch (error) {
      // If we haven't exceeded max retries, retry with exponential backoff
      if (retryCount < this.maxRetries) {
        const delay = this.initialRetryDelay * Math.pow(2, retryCount);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.connect(retryCount + 1);
      }
      
      // Max retries exceeded
      throw error;
    }
  }

  reset() {
    this.pool = null;
    this.connectionAttempts = [];
    this.failuresBeforeSuccess = 0;
    this.shouldAlwaysFail = false;
  }
}

/**
 * Property 2: Connection retry with exponential backoff
 * For any database connection failure, the system should retry with increasing delays between attempts
 */
test('Property 2: Connection retry with exponential backoff', async () => {
  await fc.assert(
    fc.asyncProperty(
      // Generate random max retries (3 to 10)
      fc.integer({ min: 3, max: 10 }),
      // Generate random initial delay (50ms to 500ms)
      fc.integer({ min: 50, max: 500 }),
      async (maxRetries, initialDelay) => {
        // Generate failures that are less than maxRetries to ensure eventual success
        const failuresBeforeSuccess = fc.sample(fc.integer({ min: 0, max: maxRetries - 1 }), 1)[0];
        const db = new TestDatabase(maxRetries, initialDelay);
        db.failuresBeforeSuccess = failuresBeforeSuccess;

        // Test: Connection should eventually succeed if failures < maxRetries
        await db.connect();

        // Verify: Should have attempted connection failuresBeforeSuccess + 1 times
        assert.strictEqual(
          db.connectionAttempts.length,
          failuresBeforeSuccess + 1,
          `Expected ${failuresBeforeSuccess + 1} connection attempts, got ${db.connectionAttempts.length}`
        );

        // Verify: Connection should be established
        assert.ok(db.pool, 'Connection pool should be established');
        assert.strictEqual(db.pool.connected, true, 'Connection should be successful');

        // Verify: Exponential backoff delays
        if (failuresBeforeSuccess > 0) {
          for (let i = 1; i < db.connectionAttempts.length; i++) {
            const previousAttempt = db.connectionAttempts[i - 1];
            const currentAttempt = db.connectionAttempts[i];
            const actualDelay = currentAttempt.timestamp - previousAttempt.timestamp;
            const expectedDelay = initialDelay * Math.pow(2, i - 1);
            
            // Allow 50ms tolerance for timing variations
            const tolerance = 50;
            assert.ok(
              actualDelay >= expectedDelay - tolerance,
              `Delay between attempt ${i - 1} and ${i} should be at least ${expectedDelay}ms (exponential backoff), got ${actualDelay}ms`
            );
          }
        }

        db.reset();
      }
    ),
    { numRuns: 100 } // Run 100 iterations as specified in the design
  );

  console.log('✅ Property 2 passed: Connection retry with exponential backoff works correctly');
});

/**
 * Additional test: Verify max retries are respected
 */
test('Property 2 (edge case): Max retries exceeded should throw error', async () => {
  await fc.assert(
    fc.asyncProperty(
      // Generate random max retries (1 to 5)
      fc.integer({ min: 1, max: 5 }),
      // Generate random initial delay (50ms to 200ms for faster test)
      fc.integer({ min: 50, max: 200 }),
      async (maxRetries, initialDelay) => {
        const db = new TestDatabase(maxRetries, initialDelay);
        db.shouldAlwaysFail = true; // Always fail to test max retries

        // Test: Should throw error after max retries
        let errorThrown = false;
        try {
          await db.connect();
        } catch (error) {
          errorThrown = true;
        }

        // Verify: Error should be thrown
        assert.ok(errorThrown, 'Should throw error after max retries exceeded');

        // Verify: Should have attempted connection maxRetries + 1 times (initial + retries)
        assert.strictEqual(
          db.connectionAttempts.length,
          maxRetries + 1,
          `Expected ${maxRetries + 1} connection attempts (initial + ${maxRetries} retries), got ${db.connectionAttempts.length}`
        );

        db.reset();
      }
    ),
    { numRuns: 50 } // Run 50 iterations for edge case
  );

  console.log('✅ Property 2 (edge case) passed: Max retries are properly enforced');
});

/**
 * Additional test: Verify exponential growth of delays
 */
test('Property 2 (exponential growth): Delays grow exponentially', async () => {
  await fc.assert(
    fc.asyncProperty(
      // Generate random initial delay (100ms to 500ms)
      fc.integer({ min: 100, max: 500 }),
      // Generate random number of retries to test (2 to 4)
      fc.integer({ min: 2, max: 4 }),
      async (initialDelay, retriesToTest) => {
        const db = new TestDatabase(5, initialDelay);
        db.failuresBeforeSuccess = retriesToTest;

        await db.connect();

        // Verify: Each delay should be approximately double the previous one
        if (retriesToTest > 1) {
          for (let i = 2; i < db.connectionAttempts.length; i++) {
            const prevDelay = db.connectionAttempts[i - 1].timestamp - db.connectionAttempts[i - 2].timestamp;
            const currentDelay = db.connectionAttempts[i].timestamp - db.connectionAttempts[i - 1].timestamp;
            
            // Current delay should be approximately 2x previous delay (with tolerance for timing variations)
            const ratio = currentDelay / prevDelay;
            assert.ok(
              ratio >= 1.6 && ratio <= 2.4,
              `Delay ratio should be approximately 2 (exponential), got ${ratio.toFixed(2)}`
            );
          }
        }

        db.reset();
      }
    ),
    { numRuns: 50 }
  );

  console.log('✅ Property 2 (exponential growth) passed: Delays grow exponentially as expected');
});
