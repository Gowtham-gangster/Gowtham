/**
 * Property-Based Tests for MySQL Database Schema
 * Feature: mysql-migration, Property 1: Foreign key constraint enforcement
 * Validates: Requirements 2.2
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
  multipleStatements: true
};

/**
 * Property 1: Foreign key constraint enforcement
 * For any attempt to insert a record with an invalid foreign key,
 * the database should reject the operation with a foreign key constraint error
 */
test('Property 1: Foreign key constraint enforcement', async (t) => {
  let connection;

  try {
    // Attempt to connect to the database
    try {
      connection = await mysql.createConnection(dbConfig);
    } catch (error) {
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('⚠️  Database connection failed: Access denied');
        console.log('📝 Please ensure:');
        console.log('   1. MySQL is running');
        console.log('   2. Create a .env file in the server directory (copy from .env.example)');
        console.log('   3. Update DB_PASSWORD in .env with your MySQL password');
        console.log('   4. Run the schema.sql script in MySQL Workbench to create the database');
        throw new Error('Database not configured. See instructions above.');
      }
      throw error;
    }

    await fc.assert(
      fc.asyncProperty(
        // Generate random UUIDs for invalid foreign keys
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 255 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom('tablet', 'capsule', 'liquid', 'injection', 'inhaler', 'other'),
        async (invalidUserId, invalidMedicineId, medicineName, strength, form) => {
          // Test 1: Insert medicine with invalid user_id (foreign key to profiles)
          const medicineId = fc.sample(fc.uuid(), 1)[0];
          const medicineQuery = `
            INSERT INTO medicines (id, user_id, name, strength, form)
            VALUES (?, ?, ?, ?, ?)
          `;

          try {
            await connection.execute(medicineQuery, [
              medicineId,
              invalidUserId,
              medicineName,
              strength,
              form
            ]);
            // If we reach here, the foreign key constraint didn't work
            assert.fail('Expected foreign key constraint error for medicines.user_id');
          } catch (error) {
            // Verify it's a foreign key constraint error
            assert.ok(
              error.code === 'ER_NO_REFERENCED_ROW_2' || 
              error.errno === 1452,
              `Expected foreign key error, got: ${error.code}`
            );
          }

          // Test 2: Insert schedule with invalid medicine_id (foreign key to medicines)
          const scheduleId = fc.sample(fc.uuid(), 1)[0];
          const scheduleQuery = `
            INSERT INTO schedules (id, medicine_id, frequency_type, times_of_day, start_date, dosage_amount, dosage_unit)
            VALUES (?, ?, 'DAILY', '["08:00"]', CURDATE(), 1.0, 'tablet')
          `;

          try {
            await connection.execute(scheduleQuery, [scheduleId, invalidMedicineId]);
            assert.fail('Expected foreign key constraint error for schedules.medicine_id');
          } catch (error) {
            assert.ok(
              error.code === 'ER_NO_REFERENCED_ROW_2' || 
              error.errno === 1452,
              `Expected foreign key error, got: ${error.code}`
            );
          }

          // Test 3: Insert dose_log with invalid user_id and medicine_id
          const doseLogId = fc.sample(fc.uuid(), 1)[0];
          const doseLogQuery = `
            INSERT INTO dose_logs (id, user_id, medicine_id, scheduled_time, status)
            VALUES (?, ?, ?, NOW(), 'PENDING')
          `;

          try {
            await connection.execute(doseLogQuery, [doseLogId, invalidUserId, invalidMedicineId]);
            assert.fail('Expected foreign key constraint error for dose_logs');
          } catch (error) {
            assert.ok(
              error.code === 'ER_NO_REFERENCED_ROW_2' || 
              error.errno === 1452,
              `Expected foreign key error, got: ${error.code}`
            );
          }

          // Test 4: Insert disease_profile with invalid user_id
          const diseaseProfileId = fc.sample(fc.uuid(), 1)[0];
          const diseaseProfileQuery = `
            INSERT INTO disease_profiles (id, user_id, disease_id, disease_name, personal_info)
            VALUES (?, ?, 'diabetes', 'Diabetes', '{}')
          `;

          try {
            await connection.execute(diseaseProfileQuery, [diseaseProfileId, invalidUserId]);
            assert.fail('Expected foreign key constraint error for disease_profiles.user_id');
          } catch (error) {
            assert.ok(
              error.code === 'ER_NO_REFERENCED_ROW_2' || 
              error.errno === 1452,
              `Expected foreign key error, got: ${error.code}`
            );
          }

          // Test 5: Insert prescription with invalid user_id
          const prescriptionId = fc.sample(fc.uuid(), 1)[0];
          const prescriptionQuery = `
            INSERT INTO prescriptions (id, user_id, file_name, status)
            VALUES (?, ?, 'test.pdf', 'pending')
          `;

          try {
            await connection.execute(prescriptionQuery, [prescriptionId, invalidUserId]);
            assert.fail('Expected foreign key constraint error for prescriptions.user_id');
          } catch (error) {
            assert.ok(
              error.code === 'ER_NO_REFERENCED_ROW_2' || 
              error.errno === 1452,
              `Expected foreign key error, got: ${error.code}`
            );
          }

          // Test 6: Insert notification with invalid user_id
          const notificationId = fc.sample(fc.uuid(), 1)[0];
          const notificationQuery = `
            INSERT INTO notifications (id, user_id, type, message)
            VALUES (?, ?, 'DOSE_DUE', 'Test notification')
          `;

          try {
            await connection.execute(notificationQuery, [notificationId, invalidUserId]);
            assert.fail('Expected foreign key constraint error for notifications.user_id');
          } catch (error) {
            assert.ok(
              error.code === 'ER_NO_REFERENCED_ROW_2' || 
              error.errno === 1452,
              `Expected foreign key error, got: ${error.code}`
            );
          }

          // Test 7: Insert caregiver_link with invalid caregiver_id and patient_id
          const caregiverLinkId = fc.sample(fc.uuid(), 1)[0];
          const invalidPatientId = fc.sample(fc.uuid(), 1)[0];
          const caregiverLinkQuery = `
            INSERT INTO caregiver_links (id, caregiver_id, patient_id, patient_name)
            VALUES (?, ?, ?, 'Test Patient')
          `;

          try {
            await connection.execute(caregiverLinkQuery, [
              caregiverLinkId,
              invalidUserId,
              invalidPatientId
            ]);
            assert.fail('Expected foreign key constraint error for caregiver_links');
          } catch (error) {
            assert.ok(
              error.code === 'ER_NO_REFERENCED_ROW_2' || 
              error.errno === 1452,
              `Expected foreign key error, got: ${error.code}`
            );
          }

          // Test 8: Insert order with invalid user_id
          const orderId = fc.sample(fc.uuid(), 1)[0];
          const orderQuery = `
            INSERT INTO orders (id, user_id, vendor, items, delivery)
            VALUES (?, ?, '{}', '[]', '{}')
          `;

          try {
            await connection.execute(orderQuery, [orderId, invalidUserId]);
            assert.fail('Expected foreign key constraint error for orders.user_id');
          } catch (error) {
            assert.ok(
              error.code === 'ER_NO_REFERENCED_ROW_2' || 
              error.errno === 1452,
              `Expected foreign key error, got: ${error.code}`
            );
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in the design
    );

    console.log('✅ Property 1 passed: Foreign key constraints are properly enforced');
  } catch (error) {
    console.error('❌ Property test failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});
