-- ============================================
-- SIMPLE COPY-PASTE QUERIES
-- ============================================
-- Just copy and paste these into Supabase SQL Editor
-- No modifications needed - they work as-is!

-- ============================================
-- 1. VIEW ALL DATA
-- ============================================

-- See all patients
SELECT * FROM public.profiles WHERE role = 'PATIENT';

-- See all medications
SELECT * FROM public.medicines;

-- See all diseases
SELECT * FROM public.disease_profiles;

-- See all prescriptions
SELECT * FROM public.prescriptions;

-- See all notifications
SELECT * FROM public.notifications;

-- See all dose logs
SELECT * FROM public.dose_logs;

-- See all orders
SELECT * FROM public.orders;

-- ============================================
-- 2. COUNT EVERYTHING
-- ============================================

-- How many patients?
SELECT COUNT(*) as total_patients FROM public.profiles WHERE role = 'PATIENT';

-- How many medications?
SELECT COUNT(*) as total_medications FROM public.medicines;

-- How many diseases?
SELECT COUNT(*) as total_diseases FROM public.disease_profiles;

-- How many prescriptions?
SELECT COUNT(*) as total_prescriptions FROM public.prescriptions;

-- ============================================
-- 3. SIMPLE JOINS
-- ============================================

-- Patients with their medications
SELECT 
    p.name as patient,
    m.name as medication,
    m.strength
FROM public.medicines m
JOIN public.profiles p ON m.user_id = p.id;

-- Patients with their diseases
SELECT 
    p.name as patient,
    dp.disease_name,
    dp.severity
FROM public.disease_profiles dp
JOIN public.profiles p ON dp.user_id = p.id;

-- Medications that need refill
SELECT 
    p.name as patient,
    m.name as medication,
    m.stock_count
FROM public.medicines m
JOIN public.profiles p ON m.user_id = p.id
WHERE m.stock_count <= m.refill_threshold;

-- ============================================
-- 4. USEFUL FILTERS
-- ============================================

-- Elderly patients only
SELECT * FROM public.profiles 
WHERE age >= 65 OR elderly_mode = true;

-- Active diseases only
SELECT * FROM public.disease_profiles 
WHERE status = 'active';

-- Unread notifications
SELECT * FROM public.notifications 
WHERE read = false;

-- Recent prescriptions (last 30 days)
SELECT * FROM public.prescriptions 
WHERE uploaded_at >= NOW() - INTERVAL '30 days';

-- ============================================
-- 5. QUICK SUMMARIES
-- ============================================

-- Medications per patient
SELECT 
    p.name,
    COUNT(m.id) as medication_count
FROM public.profiles p
LEFT JOIN public.medicines m ON p.id = m.user_id
GROUP BY p.name
ORDER BY medication_count DESC;

-- Diseases per patient
SELECT 
    p.name,
    COUNT(dp.id) as disease_count
FROM public.profiles p
LEFT JOIN public.disease_profiles dp ON p.id = dp.user_id
GROUP BY p.name
ORDER BY disease_count DESC;

-- Medications by type
SELECT 
    form,
    COUNT(*) as count
FROM public.medicines
GROUP BY form
ORDER BY count DESC;

-- ============================================
-- 6. SEARCH QUERIES
-- ============================================

-- Find patient by name
SELECT * FROM public.profiles 
WHERE name ILIKE '%john%';

-- Find medication by name
SELECT * FROM public.medicines 
WHERE name ILIKE '%metformin%';

-- Find disease by name
SELECT * FROM public.disease_profiles 
WHERE disease_name ILIKE '%diabetes%';

-- ============================================
-- 7. DATE QUERIES
-- ============================================

-- Checkups this month
SELECT 
    p.name,
    dp.disease_name,
    dp.next_checkup
FROM public.disease_profiles dp
JOIN public.profiles p ON dp.user_id = p.id
WHERE EXTRACT(MONTH FROM dp.next_checkup) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(YEAR FROM dp.next_checkup) = EXTRACT(YEAR FROM CURRENT_DATE);

-- Medications started this year
SELECT * FROM public.medicines 
WHERE EXTRACT(YEAR FROM start_date::date) = EXTRACT(YEAR FROM CURRENT_DATE);

-- Recent activity (today)
SELECT * FROM public.notifications 
WHERE DATE(created_at) = CURRENT_DATE;

-- ============================================
-- 8. SORTING QUERIES
-- ============================================

-- Patients by age (oldest first)
SELECT name, age FROM public.profiles 
WHERE role = 'PATIENT'
ORDER BY age DESC;

-- Medications by stock (lowest first)
SELECT name, stock_count FROM public.medicines 
ORDER BY stock_count ASC;

-- Recent notifications (newest first)
SELECT * FROM public.notifications 
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================
-- 9. AGGREGATION QUERIES
-- ============================================

-- Average patient age
SELECT AVG(age) as average_age 
FROM public.profiles 
WHERE role = 'PATIENT';

-- Total medications in stock
SELECT SUM(stock_count) as total_stock 
FROM public.medicines;

-- Oldest and newest patients
SELECT 
    MIN(age) as youngest,
    MAX(age) as oldest
FROM public.profiles 
WHERE role = 'PATIENT';

-- ============================================
-- 10. COMBINED QUERIES
-- ============================================

-- Complete patient overview
SELECT 
    p.name,
    p.age,
    p.phone,
    COUNT(DISTINCT m.id) as medications,
    COUNT(DISTINCT dp.id) as diseases,
    COUNT(DISTINCT pr.id) as prescriptions
FROM public.profiles p
LEFT JOIN public.medicines m ON p.id = m.user_id
LEFT JOIN public.disease_profiles dp ON p.id = dp.user_id
LEFT JOIN public.prescriptions pr ON p.id = pr.user_id
WHERE p.role = 'PATIENT'
GROUP BY p.id, p.name, p.age, p.phone;

-- Medications with patient and disease info
SELECT 
    p.name as patient,
    m.name as medication,
    m.strength,
    dp.disease_name,
    m.prescribed_by as doctor
FROM public.medicines m
JOIN public.profiles p ON m.user_id = p.id
LEFT JOIN public.disease_profiles dp ON p.id = dp.user_id
ORDER BY p.name, m.name;

-- ============================================
-- END - ALL QUERIES READY TO USE!
-- ============================================

