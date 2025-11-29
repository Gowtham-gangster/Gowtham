-- ============================================
-- MEDREMINDER PRO - COMPREHENSIVE SQL QUERIES
-- ============================================
-- This file contains SQL queries for various medical scenarios
-- Execute these in Supabase SQL Editor or use them in your application

-- ============================================
-- 1. PATIENT QUERIES
-- ============================================

-- Get all patients with their basic information
SELECT 
    id,
    name,
    email,
    role,
    age,
    phone,
    elderly_mode,
    created_at
FROM public.profiles
WHERE role = 'PATIENT'
ORDER BY name;

-- Get patient with full details including emergency contact
SELECT 
    id,
    name,
    email,
    age,
    phone,
    address,
    emergency_contact,
    elderly_mode,
    voice_reminders_enabled,
    notifications_enabled,
    notification_settings
FROM public.profiles
WHERE id = 'YOUR_USER_ID';

-- Get patients by age group
SELECT 
    CASE 
        WHEN age < 18 THEN 'Child'
        WHEN age BETWEEN 18 AND 40 THEN 'Young Adult'
        WHEN age BETWEEN 41 AND 60 THEN 'Middle Age'
        ELSE 'Senior'
    END as age_group,
    COUNT(*) as patient_count,
    AVG(age) as average_age
FROM public.profiles
WHERE role = 'PATIENT' AND age IS NOT NULL
GROUP BY age_group
ORDER BY average_age;


-- ============================================
-- 2. MEDICATION QUERIES
-- ============================================

-- Get all medications for a specific patient
SELECT 
    m.id,
    m.name,
    m.nickname,
    m.strength,
    m.form,
    m.stock_count,
    m.refill_threshold,
    m.prescribed_by,
    m.start_date,
    m.end_date,
    m.instructions
FROM public.medicines m
WHERE m.user_id = 'YOUR_USER_ID'
ORDER BY m.name;

-- Get medications that need refill (low stock)
SELECT 
    m.name,
    m.strength,
    m.stock_count,
    m.refill_threshold,
    p.name as patient_name,
    p.phone as patient_phone
FROM public.medicines m
JOIN public.profiles p ON m.user_id = p.id
WHERE m.stock_count <= m.refill_threshold
ORDER BY m.stock_count ASC;

-- Get medications by form type
SELECT 
    form,
    COUNT(*) as medication_count,
    COUNT(DISTINCT user_id) as patient_count
FROM public.medicines
GROUP BY form
ORDER BY medication_count DESC;

-- Get medications with their schedules
SELECT 
    m.name,
    m.strength,
    m.form,
    s.frequency_type,
    s.times_of_day,
    s.dosage_amount,
    s.dosage_unit,
    s.start_date,
    s.end_date
FROM public.medicines m
LEFT JOIN public.schedules s ON m.id = s.medicine_id
WHERE m.user_id = 'YOUR_USER_ID'
ORDER BY m.name;


-- ============================================
-- 3. PRESCRIPTION QUERIES
-- ============================================

-- Get all prescriptions for a patient
SELECT 
    p.id,
    p.file_name,
    p.uploaded_at,
    p.status,
    p.is_analyzed,
    p.parsed_medicines,
    p.analysis_result
FROM public.prescriptions p
WHERE p.user_id = 'YOUR_USER_ID'
ORDER BY p.uploaded_at DESC;

-- Get prescriptions with linked disease profiles
SELECT 
    p.file_name,
    p.uploaded_at,
    p.status,
    dp.disease_name,
    dp.severity,
    dp.status as disease_status
FROM public.prescriptions p
LEFT JOIN LATERAL unnest(p.linked_disease_profiles) AS disease_id ON true
LEFT JOIN public.disease_profiles dp ON dp.id::text = disease_id::text
WHERE p.user_id = 'YOUR_USER_ID'
ORDER BY p.uploaded_at DESC;

-- Get recently uploaded prescriptions (last 30 days)
SELECT 
    pr.name as patient_name,
    p.file_name,
    p.uploaded_at,
    p.status,
    p.is_analyzed,
    jsonb_array_length(COALESCE(p.parsed_medicines, '[]'::jsonb)) as medicine_count
FROM public.prescriptions p
JOIN public.profiles pr ON p.user_id = pr.id
WHERE p.uploaded_at >= NOW() - INTERVAL '30 days'
ORDER BY p.uploaded_at DESC;

-- Get prescription analysis statistics
SELECT 
    status,
    COUNT(*) as count,
    COUNT(CASE WHEN is_analyzed THEN 1 END) as analyzed_count,
    AVG(jsonb_array_length(COALESCE(parsed_medicines, '[]'::jsonb))) as avg_medicines
FROM public.prescriptions
GROUP BY status;


-- ============================================
-- 4. DISEASE PROFILE QUERIES
-- ============================================

-- Get all disease profiles for a patient
SELECT 
    dp.disease_name,
    dp.diagnosis_date,
    dp.severity,
    dp.status,
    dp.symptoms,
    dp.doctor_name,
    dp.doctor_contact,
    dp.last_checkup,
    dp.next_checkup
FROM public.disease_profiles dp
WHERE dp.user_id = 'YOUR_USER_ID'
ORDER BY dp.diagnosis_date DESC;

-- Get active chronic diseases across all patients
SELECT 
    dp.disease_name,
    COUNT(*) as patient_count,
    AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, dp.diagnosis_date))) as avg_years_since_diagnosis,
    COUNT(CASE WHEN dp.severity = 'severe' THEN 1 END) as severe_cases,
    COUNT(CASE WHEN dp.severity = 'moderate' THEN 1 END) as moderate_cases,
    COUNT(CASE WHEN dp.severity = 'mild' THEN 1 END) as mild_cases
FROM public.disease_profiles dp
WHERE dp.status = 'active'
GROUP BY dp.disease_name
ORDER BY patient_count DESC;

-- Get patients with multiple chronic conditions
SELECT 
    p.name,
    p.age,
    COUNT(dp.id) as disease_count,
    array_agg(dp.disease_name) as diseases
FROM public.profiles p
JOIN public.disease_profiles dp ON p.id = dp.user_id
WHERE dp.status = 'active'
GROUP BY p.id, p.name, p.age
HAVING COUNT(dp.id) >= 2
ORDER BY disease_count DESC;

-- Get disease profiles with upcoming checkups
SELECT 
    pr.name as patient_name,
    pr.phone,
    dp.disease_name,
    dp.next_checkup,
    dp.doctor_name,
    dp.doctor_contact,
    (dp.next_checkup - CURRENT_DATE) as days_until_checkup
FROM public.disease_profiles dp
JOIN public.profiles pr ON dp.user_id = pr.id
WHERE dp.next_checkup IS NOT NULL 
    AND dp.next_checkup >= CURRENT_DATE
    AND dp.next_checkup <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY dp.next_checkup;


-- ============================================
-- 5. DOSE LOG & ADHERENCE QUERIES
-- ============================================

-- Get today's medication schedule for a patient
SELECT 
    m.name,
    m.strength,
    dl.scheduled_time,
    dl.status,
    dl.taken_time,
    dl.notes
FROM public.dose_logs dl
JOIN public.medicines m ON dl.medicine_id = m.id
WHERE dl.user_id = 'YOUR_USER_ID'
    AND DATE(dl.scheduled_time) = CURRENT_DATE
ORDER BY dl.scheduled_time;

-- Get medication adherence rate for a patient (last 30 days)
SELECT 
    m.name,
    COUNT(*) as total_doses,
    COUNT(CASE WHEN dl.status = 'TAKEN' THEN 1 END) as taken_doses,
    COUNT(CASE WHEN dl.status = 'MISSED' THEN 1 END) as missed_doses,
    COUNT(CASE WHEN dl.status = 'SKIPPED' THEN 1 END) as skipped_doses,
    ROUND(
        (COUNT(CASE WHEN dl.status = 'TAKEN' THEN 1 END)::numeric / 
        NULLIF(COUNT(*), 0) * 100), 2
    ) as adherence_percentage
FROM public.dose_logs dl
JOIN public.medicines m ON dl.medicine_id = m.id
WHERE dl.user_id = 'YOUR_USER_ID'
    AND dl.scheduled_time >= NOW() - INTERVAL '30 days'
GROUP BY m.id, m.name
ORDER BY adherence_percentage DESC;

-- Get missed doses in the last 7 days
SELECT 
    p.name as patient_name,
    m.name as medication,
    m.strength,
    dl.scheduled_time,
    dl.notes
FROM public.dose_logs dl
JOIN public.medicines m ON dl.medicine_id = m.id
JOIN public.profiles p ON dl.user_id = p.id
WHERE dl.status = 'MISSED'
    AND dl.scheduled_time >= NOW() - INTERVAL '7 days'
ORDER BY dl.scheduled_time DESC;

-- Get overall adherence statistics
SELECT 
    p.name,
    COUNT(*) as total_scheduled,
    COUNT(CASE WHEN dl.status = 'TAKEN' THEN 1 END) as taken,
    COUNT(CASE WHEN dl.status = 'MISSED' THEN 1 END) as missed,
    ROUND(
        (COUNT(CASE WHEN dl.status = 'TAKEN' THEN 1 END)::numeric / 
        NULLIF(COUNT(*), 0) * 100), 2
    ) as adherence_rate
FROM public.dose_logs dl
JOIN public.profiles p ON dl.user_id = p.id
WHERE dl.scheduled_time >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name
ORDER BY adherence_rate DESC;


-- ============================================
-- 6. NOTIFICATION QUERIES
-- ============================================

-- Get unread notifications for a user
SELECT 
    n.type,
    n.message,
    n.created_at,
    m.name as medication_name
FROM public.notifications n
LEFT JOIN public.medicines m ON n.medicine_id = m.id
WHERE n.user_id = 'YOUR_USER_ID'
    AND n.read = false
ORDER BY n.created_at DESC;

-- Get notification statistics by type
SELECT 
    type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN read = false THEN 1 END) as unread_count,
    COUNT(CASE WHEN read = true THEN 1 END) as read_count
FROM public.notifications
WHERE user_id = 'YOUR_USER_ID'
GROUP BY type
ORDER BY total_count DESC;

-- Get recent dose reminders
SELECT 
    n.message,
    n.created_at,
    m.name as medication,
    m.strength,
    n.read
FROM public.notifications n
JOIN public.medicines m ON n.medicine_id = m.id
WHERE n.user_id = 'YOUR_USER_ID'
    AND n.type = 'DOSE_DUE'
    AND n.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY n.created_at DESC;

-- Get refill warnings
SELECT 
    p.name as patient_name,
    p.phone,
    m.name as medication,
    m.stock_count,
    m.refill_threshold,
    n.message,
    n.created_at
FROM public.notifications n
JOIN public.medicines m ON n.medicine_id = m.id
JOIN public.profiles p ON n.user_id = p.id
WHERE n.type = 'REFILL_WARNING'
    AND n.read = false
ORDER BY m.stock_count ASC;


-- ============================================
-- 7. CAREGIVER QUERIES
-- ============================================

-- Get all caregivers and their patients
SELECT 
    c.name as caregiver_name,
    c.email as caregiver_email,
    cl.patient_name,
    p.email as patient_email,
    p.age as patient_age,
    cl.created_at as link_created
FROM public.caregiver_links cl
JOIN public.profiles c ON cl.caregiver_id = c.id
JOIN public.profiles p ON cl.patient_id = p.id
ORDER BY c.name, cl.patient_name;

-- Get patients for a specific caregiver
SELECT 
    cl.patient_name,
    p.age,
    p.phone,
    p.elderly_mode,
    COUNT(DISTINCT m.id) as medication_count,
    COUNT(DISTINCT dp.id) as disease_count
FROM public.caregiver_links cl
JOIN public.profiles p ON cl.patient_id = p.id
LEFT JOIN public.medicines m ON p.id = m.user_id
LEFT JOIN public.disease_profiles dp ON p.id = dp.user_id
WHERE cl.caregiver_id = 'YOUR_CAREGIVER_ID'
GROUP BY cl.patient_name, p.age, p.phone, p.elderly_mode;

-- Get caregiver alerts
SELECT 
    cl.patient_name,
    n.type,
    n.message,
    n.created_at
FROM public.notifications n
JOIN public.caregiver_links cl ON n.user_id = cl.patient_id
WHERE cl.caregiver_id = 'YOUR_CAREGIVER_ID'
    AND n.type = 'CAREGIVER_ALERT'
    AND n.read = false
ORDER BY n.created_at DESC;


-- ============================================
-- 8. ORDER QUERIES
-- ============================================

-- Get all orders for a patient
SELECT 
    o.id,
    o.vendor->>'name' as vendor_name,
    o.vendor->>'type' as vendor_type,
    o.delivery->>'address' as delivery_address,
    o.delivery->>'date' as delivery_date,
    o.notes,
    o.created_at
FROM public.orders o
WHERE o.user_id = 'YOUR_USER_ID'
ORDER BY o.created_at DESC;

-- Get orders with item details
SELECT 
    p.name as patient_name,
    o.vendor->>'name' as vendor,
    item->>'name' as item_name,
    (item->>'quantity')::int as quantity,
    (item->>'price')::numeric as price,
    o.delivery->>'date' as delivery_date,
    o.created_at as order_date
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
CROSS JOIN jsonb_array_elements(o.items) as item
ORDER BY o.created_at DESC;

-- Get order statistics by vendor
SELECT 
    o.vendor->>'name' as vendor_name,
    o.vendor->>'type' as vendor_type,
    COUNT(*) as order_count,
    SUM(jsonb_array_length(o.items)) as total_items
FROM public.orders o
GROUP BY o.vendor->>'name', o.vendor->>'type'
ORDER BY order_count DESC;

-- Get upcoming deliveries
SELECT 
    p.name as patient_name,
    p.phone,
    o.vendor->>'name' as vendor,
    o.delivery->>'address' as address,
    o.delivery->>'date' as delivery_date,
    o.delivery->>'instructions' as instructions
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
WHERE (o.delivery->>'date')::date >= CURRENT_DATE
ORDER BY (o.delivery->>'date')::date;


-- ============================================
-- 9. COMPLEX ANALYTICAL QUERIES
-- ============================================

-- Patient Health Dashboard (Complete Overview)
SELECT 
    p.name,
    p.age,
    p.elderly_mode,
    COUNT(DISTINCT m.id) as total_medications,
    COUNT(DISTINCT dp.id) as active_diseases,
    COUNT(DISTINCT CASE WHEN m.stock_count <= m.refill_threshold THEN m.id END) as medications_need_refill,
    COUNT(DISTINCT pr.id) as total_prescriptions,
    ROUND(
        (COUNT(CASE WHEN dl.status = 'TAKEN' AND dl.scheduled_time >= NOW() - INTERVAL '30 days' THEN 1 END)::numeric / 
        NULLIF(COUNT(CASE WHEN dl.scheduled_time >= NOW() - INTERVAL '30 days' THEN 1 END), 0) * 100), 2
    ) as adherence_rate_30d
FROM public.profiles p
LEFT JOIN public.medicines m ON p.id = m.user_id
LEFT JOIN public.disease_profiles dp ON p.id = dp.user_id AND dp.status = 'active'
LEFT JOIN public.prescriptions pr ON p.id = pr.user_id
LEFT JOIN public.dose_logs dl ON p.id = dl.user_id
WHERE p.id = 'YOUR_USER_ID'
GROUP BY p.id, p.name, p.age, p.elderly_mode;

-- Medication Interaction Risk Analysis
SELECT 
    p.name as patient_name,
    array_agg(DISTINCT m.name) as medications,
    COUNT(DISTINCT m.id) as medication_count,
    array_agg(DISTINCT dp.disease_name) as conditions,
    CASE 
        WHEN COUNT(DISTINCT m.id) >= 5 THEN 'High Risk - Polypharmacy'
        WHEN COUNT(DISTINCT m.id) >= 3 THEN 'Moderate Risk'
        ELSE 'Low Risk'
    END as interaction_risk_level
FROM public.profiles p
JOIN public.medicines m ON p.id = m.user_id
LEFT JOIN public.disease_profiles dp ON p.id = dp.user_id AND dp.status = 'active'
GROUP BY p.id, p.name
HAVING COUNT(DISTINCT m.id) >= 3
ORDER BY medication_count DESC;

-- Disease-Medication Correlation
SELECT 
    dp.disease_name,
    m.name as medication_name,
    COUNT(DISTINCT dp.user_id) as patient_count,
    AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, dp.diagnosis_date))) as avg_years_with_disease
FROM public.disease_profiles dp
JOIN public.medicines m ON dp.user_id = m.user_id
WHERE dp.status = 'active'
GROUP BY dp.disease_name, m.name
HAVING COUNT(DISTINCT dp.user_id) >= 1
ORDER BY dp.disease_name, patient_count DESC;

-- Weekly Adherence Trend
SELECT 
    DATE_TRUNC('week', dl.scheduled_time) as week,
    COUNT(*) as total_doses,
    COUNT(CASE WHEN dl.status = 'TAKEN' THEN 1 END) as taken_doses,
    COUNT(CASE WHEN dl.status = 'MISSED' THEN 1 END) as missed_doses,
    ROUND(
        (COUNT(CASE WHEN dl.status = 'TAKEN' THEN 1 END)::numeric / 
        NULLIF(COUNT(*), 0) * 100), 2
    ) as adherence_percentage
FROM public.dose_logs dl
WHERE dl.user_id = 'YOUR_USER_ID'
    AND dl.scheduled_time >= NOW() - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', dl.scheduled_time)
ORDER BY week DESC;

