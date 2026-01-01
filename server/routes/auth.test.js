/**
 * Basic tests for authentication endpoints
 */

import { test } from 'node:test';
import assert from 'node:assert';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(dirname(__dirname), '.env') });

// Set JWT_SECRET if not present (for testing)
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-for-testing';
}

test('Authentication module exports', async () => {
  // Test that auth middleware exports the required functions
  const authModule = await import('../middleware/auth.js');
  
  assert.ok(authModule.authenticate, 'authenticate function should be exported');
  assert.ok(authModule.generateToken, 'generateToken function should be exported');
  assert.ok(authModule.verifyToken, 'verifyToken function should be exported');
  assert.ok(authModule.hashPassword, 'hashPassword function should be exported');
  assert.ok(authModule.comparePassword, 'comparePassword function should be exported');
  
  console.log('✅ All authentication functions are exported');
});

test('Password hashing and comparison', async () => {
  const { hashPassword, comparePassword } = await import('../middleware/auth.js');
  
  const password = 'testPassword123';
  const hash = await hashPassword(password);
  
  // Verify hash is different from password
  assert.notStrictEqual(hash, password, 'Hash should be different from password');
  
  // Verify correct password matches
  const isValid = await comparePassword(password, hash);
  assert.strictEqual(isValid, true, 'Correct password should match hash');
  
  // Verify incorrect password doesn't match
  const isInvalid = await comparePassword('wrongPassword', hash);
  assert.strictEqual(isInvalid, false, 'Incorrect password should not match hash');
  
  console.log('✅ Password hashing and comparison work correctly');
});

test('JWT token generation and verification', async () => {
  const { generateToken, verifyToken } = await import('../middleware/auth.js');
  
  const user = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'PATIENT'
  };
  
  // Generate token
  const token = generateToken(user);
  assert.ok(token, 'Token should be generated');
  assert.ok(typeof token === 'string', 'Token should be a string');
  
  // Verify token
  const decoded = verifyToken(token);
  assert.strictEqual(decoded.id, user.id, 'Decoded token should contain user id');
  assert.strictEqual(decoded.email, user.email, 'Decoded token should contain user email');
  assert.strictEqual(decoded.role, user.role, 'Decoded token should contain user role');
  
  console.log('✅ JWT token generation and verification work correctly');
});

test('Invalid JWT token rejection', async () => {
  const { verifyToken } = await import('../middleware/auth.js');
  
  const invalidToken = 'invalid.token.here';
  
  try {
    verifyToken(invalidToken);
    assert.fail('Should have thrown an error for invalid token');
  } catch (error) {
    assert.ok(error, 'Should throw error for invalid token');
    assert.strictEqual(error.name, 'JsonWebTokenError', 'Should be a JWT error');
  }
  
  console.log('✅ Invalid tokens are properly rejected');
});
