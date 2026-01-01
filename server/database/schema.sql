-- MedReminder Pro - MySQL Database Schema
-- Execute this SQL in MySQL Workbench to create the database

-- Create database
CREATE DATABASE IF NOT EXISTS medreminder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medreminder;

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('PATIENT', 'CAREGIVER') NOT NULL,
  elderly_mode BOOLEAN DEFAULT FALSE,
  timezone VARCHAR(50) DEFAULT 'UTC',
  caregiver_invite_code VARCHAR(8) UNIQUE,
  voice_reminders_enabled BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  notification_settings JSON,
  age INT,
  phone VARCHAR(20),
  address TEXT,
  emergency_contact JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_caregiver_code (caregiver_invite_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MEDICINES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medicines (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  nickname VARCHAR(255),
  strength VARCHAR(100) NOT NULL,
  form ENUM('tablet', 'capsule', 'liquid', 'injection', 'inhaler', 'other') NOT NULL,
  color_tag ENUM('red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'teal'),
  icon_key VARCHAR(50),
  stock_count INT DEFAULT 0,
  refill_threshold INT DEFAULT 10,
  instructions TEXT,
  frequency JSON,
  start_date DATE,
  end_date DATE,
  prescribed_by VARCHAR(255),
  refills_remaining INT,
  quantity INT,
  side_effects JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SCHEDULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS schedules (
  id VARCHAR(36) PRIMARY KEY,
  medicine_id VARCHAR(36) NOT NULL,
  frequency_type ENUM('DAILY', 'WEEKDAYS', 'CUSTOM_DAYS', 'EVERY_X_DAYS', 'EVERY_X_HOURS', 'AS_NEEDED') NOT NULL,
  times_of_day JSON NOT NULL,
  days_of_week JSON,
  interval_days INT,
  interval_hours INT,
  start_date DATE NOT NULL,
  end_date DATE,
  dosage_amount DECIMAL(10, 2) NOT NULL,
  dosage_unit VARCHAR(50) NOT NULL,
  max_dose_per_day DECIMAL(10, 2),
  max_dose_per_intake DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
  INDEX idx_medicine_id (medicine_id),
  INDEX idx_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DOSE LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS dose_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  medicine_id VARCHAR(36) NOT NULL,
  scheduled_time TIMESTAMP NOT NULL,
  taken_time TIMESTAMP,
  status ENUM('PENDING', 'TAKEN', 'MISSED', 'SKIPPED') NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_medicine_id (medicine_id),
  INDEX idx_scheduled_time (scheduled_time),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DISEASE PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS disease_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  disease_id VARCHAR(100) NOT NULL,
  disease_name VARCHAR(255) NOT NULL,
  personal_info JSON NOT NULL,
  symptoms JSON,
  lifestyle JSON,
  medication_history TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_disease_id (disease_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PRESCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  parsed_medicines JSON,
  status ENUM('pending', 'processed', 'error') NOT NULL,
  analysis_result JSON,
  linked_disease_profiles JSON,
  is_analyzed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('DOSE_DUE', 'MISSED_DOSE', 'REFILL_WARNING', 'CAREGIVER_ALERT') NOT NULL,
  message TEXT NOT NULL,
  medicine_id VARCHAR(36),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CAREGIVER LINKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS caregiver_links (
  id VARCHAR(36) PRIMARY KEY,
  caregiver_id VARCHAR(36) NOT NULL,
  patient_id VARCHAR(36) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (caregiver_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_link (caregiver_id, patient_id),
  INDEX idx_caregiver_id (caregiver_id),
  INDEX idx_patient_id (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  vendor JSON NOT NULL,
  items JSON NOT NULL,
  notes TEXT,
  delivery JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COMPLETED!
-- ============================================
-- Database schema created successfully!
-- Next steps:
-- 1. Update your .env file with MySQL credentials
-- 2. Install backend dependencies: cd server && npm install
-- 3. Start the backend server: npm run dev
