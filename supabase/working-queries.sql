-- ============================================
-- MEDREMINDER PRO - WORKING SELECT QUERIES
-- ============================================
-- These queries will work with your actual Supabase data
-- No errors when executing - ready to use!

-- ============================================
-- BASIC QUERIES - START HERE
-- ============================================

-- 1. View all patients
SELECT 
    id,
    name,
    email,
    age,
    phone,
    elderly_mode,
    created_at
FROM public.profiles
WHERE role = 'PATIENT'
ORDER BY name;

-- 2. View all medications
SELECT 
    m.name as medication,
    m.strength,
    m.form,
    m.stock_count,
    m.prescribed_by,
    p.name as patient_name
FROM public.medicines m
JOIN public.profiles p ON m.user_id = p.id
ORDER BY p.name, m.name;

-- 3. View all disease profiles
SELECT 
    dp.disease_name,
    dp.severity,
    dp.status,
    dp.diagnosis_date,
    p.name as patient_name,
    p.age as patient_age
FROM public.disease_profiles dp
JOIN public.profiles p ON dp.user_id = p.id
ORDER BY p.name, dp.disease_name;

-- 4. View all prescriptions
SELECT 
    pr.file_name,
    pr.uploaded_at,
    pr.status,
    pr.is_analyzed,
    p.name as patient_name
FROM public.prescriptions pr
JOIN public.profiles p ON pr.user_id = p.id
ORDER BY pr.uploaded_at DESC;

-- 5. View all notifications
SELECT 
    n.type,
    n.message,
    n.read,
    n.created_at,
    p.name as patient_name
FROM public.notifications n
JOIN public.profiles p ON n.user_id = p.id
ORDER BY n.created_at DESC
LIMIT 50;


-- ============================================
-- PATIENT-SPECIFIC QUERIES
-- ============================================

-- 6. Get complete patient profile with all details
SELECT 
    p.id,
    p.name,
    p.email,
    p.age,
    p.phone,
    p.address,
    p.emergency_contact,
    p.elderly_mode,
    p.voice_reminders_enabled,
    p.notifications_enabled,
    p.notification_settings,
    COUNT(DISTINCT m.id) as total_medications,
    COUNT(DISTINCT dp.id) as total_diseases,
    COUNT(DISTINCT pr.id) as total_prescriptions
FROM public.profiles p
LEFT JOIN public.medicines m ON p.id = m.user_id
LEFT JOIN public.disease_profiles dp ON p.id = dp.user_id
LEFT JOIN public.prescriptions pr ON p.id = pr.user_id
WHERE p.role = 'PATIENT'
GROUP BY p.id
ORDER BY p.name;

-- 7. Get patient medications with full details
SELECT 
    p.name as patient_name,
    m.name as medication,
    m.strength,
    m.form,
    m.instructions,
    m.prescribed_by,
    m.stock_count,
    m.refill_threshold,
    m.start_date,
    m.end_date,
    m.side_effects
FROM public.medicines m
JOIN public.profiles p ON m.user_id = p.id
ORDER BY p.name, m.name;

-- 8. Get patient diseases with symptoms and guidelines
SELECT 
    p.name as patient_name,
    p.age,
    dp.disease_name,
    dp.severity,
    dp.status,
    dp.diagnosis_date,
    dp.symptoms,
    dp.doctor_name,
    dp.doctor_contact,
    dp.next_checkup,
    dp.guidelines,
    dp.precautions
FROM public.disease_profiles dp
JOIN public.profiles p ON dp.user_id = p.id
WHERE dp.status = 'active'
ORDER BY p.name, dp.disease_name;


-- ============================================
-- MEDICATION MANAGEMENT QUERIES
-- ============================================

-- 9. Medications that need refill (low stock)
SELECT 
    p.name as patient_name,
    p.phone as patient_phone,
    m.name as medication,
    m.strength,
    m.stock_count,
    m.refill_threshold,
    m.prescribed_by,
    (m.refill_threshold - m.stock_count) as units_needed
FROM public.medicines m
JOIN public.profiles p ON m.user_id = p.id
WHERE m.stock_count <= m.refill_threshold
ORDER BY m.stock_count ASC;

-- 10. Medications by form type
SELECT 
    m.form,
    COUNT(*) as medication_count,
    COUNT(DISTINCT m.user_id) as patient_count,
    array_agg(DISTINCT m.name) as medication_names
FROM public.medicines m
GROUP BY m.form
ORDER BY medication_count DESC;

-- 11. Medications by prescribing doctor
SELECT 
    m.prescribed_by as doctor,
    COUNT(*) as total_prescriptions,
    COUNT(DISTINCT m.user_id) as unique_patients,
    array_agg(DISTINCT m.name) as medications_prescribed
FROM public.medicines m
WHERE m.prescribed_by IS NOT NULL
GROUP BY m.prescribed_by
ORDER BY total_prescriptions DESC;

-- 12. Active medications (not expired)
SELECT 
    p.name as patient_name,
    m.name as medication,
    m.strength,
    m.form,
    m.start_date,
    m.end_date,
    CASE 
        WHEN m.end_date IS NULL THEN 'Ongoing'
        WHEN m.end_date > CURRENT_DATE THEN 'Active'
        ELSE 'Expired'
    END as status
FROM public.medicines m
JOIN public.profiles p ON m.user_id = p.id
WHERE m.end_date IS NULL OR m.end_date >= CURRENT_DATE
ORDER BY p.name, m.name;


-- ============================================
-- DISEASE ANALYSIS QUERIES
-- ============================================

-- 13. Disease distribution across patients
SELECT 
    dp.disease_name,
    COUNT(*) as patient_count,
    COUNT(CASE WHEN dp.severity = 'severe' THEN 1 END) as severe_cases,
    COUNT(CASE WHEN dp.severity = 'moderate' THEN 1 END) as moderate_cases,
    COUNT(CASE WHEN dp.severity = 'mild' THEN 1 END) as mild_cases,
    AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, dp.diagnosis_date))) as avg_years_diagnosed
FROM public.disease_profiles dp
WHERE dp.status = 'active'
GROUP BY dp.disease_name
ORDER BY patient_count DESC;

-- 14. Patients with multiple chronic conditions
SELECT 
    p.name as patient_name,
    p.age,
    p.phone,
    COUNT(dp.id) as disease_count,
    array_agg(dp.disease_name ORDER BY dp.disease_name) as diseases,
    array_agg(dp.severity ORDER BY dp.disease_name) as severities
FROM public.profiles p
JOIN public.disease_profiles dp ON p.id = dp.user_id
WHERE dp.status = 'active'
GROUP BY p.id, p.name, p.age, p.phone
HAVING COUNT(dp.id) >= 2
ORDER BY disease_count DESC, p.name;

-- 15. Upcoming medical checkups (next 60 days)
SELECT 
    p.name as patient_name,
    p.phone,
    dp.disease_name,
    dp.next_checkup,
    dp.doctor_name,
    dp.doctor_contact,
    (dp.next_checkup - CURRENT_DATE) as days_until_checkup
FROM public.disease_profiles dp
JOIN public.profiles p ON dp.user_id = p.id
WHERE dp.next_checkup IS NOT NULL 
    AND dp.next_checkup >= CURRENT_DATE
    AND dp.next_checkup <= CURRENT_DATE + INTERVAL '60 days'
ORDER BY dp.next_checkup;

-- 16. Disease-Medication correlation
SELECT 
    dp.disease_name,
    m.name as medication,
    COUNT(DISTINCT dp.user_id) as patient_count,
    array_agg(DISTINCT p.name) as patient_names
FROM public.disease_profiles dp
JOIN public.medicines m ON dp.user_id = m.user_id
JOIN public.profiles p ON dp.user_id = p.id
WHERE dp.status = 'active'
GROUP BY dp.disease_name, m.name
ORDER BY dp.disease_name, patient_count DESC;


-- ============================================
-- DOSE LOG & ADHERENCE QUERIES
-- ============================================

-- 17. Today's medication schedule
SELECT 
    p.name as patient_name,
    m.name as medication,
    m.strength,
    dl.scheduled_time,
    dl.status,
    dl.taken_time,
    dl.notes
FROM public.dose_logs dl
JOIN public.medicines m ON dl.medicine_id = m.id
JOIN public.profiles p ON dl.user_id = p.id
WHERE DATE(dl.scheduled_time AT TIME ZONE 'UTC') = CURRENT_DATE
ORDER BY dl.scheduled_time, p.name;

-- 18. Medication adherence rate (last 30 days)
SELECT 
    p.name as patient_name,
    m.name as medication,
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
JOIN public.profiles p ON dl.user_id = p.id
WHERE dl.scheduled_time >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name, m.id, m.name
ORDER BY adherence_percentage DESC, p.name;

-- 19. Recent missed doses (last 7 days)
SELECT 
    p.name as patient_name,
    p.phone,
    m.name as medication,
    m.strength,
    dl.scheduled_time,
    dl.notes,
    (NOW() - dl.scheduled_time) as time_since_missed
FROM public.dose_logs dl
JOIN public.medicines m ON dl.medicine_id = m.id
JOIN public.profiles p ON dl.user_id = p.id
WHERE dl.status = 'MISSED'
    AND dl.scheduled_time >= NOW() - INTERVAL '7 days'
ORDER BY dl.scheduled_time DESC;

-- 20. Overall patient adherence statistics
SELECT 
    p.name as patient_name,
    p.age,
    p.elderly_mode,
    COUNT(*) as total_scheduled,
    COUNT(CASE WHEN dl.status = 'TAKEN' THEN 1 END) as taken,
    COUNT(CASE WHEN dl.status = 'MISSED' THEN 1 END) as missed,
    COUNT(CASE WHEN dl.status = 'SKIPPED' THEN 1 END) as skipped,
    ROUND(
        (COUNT(CASE WHEN dl.status = 'TAKEN' THEN 1 END)::numeric / 
        NULLIF(COUNT(*), 0) * 100), 2
    ) as adherence_rate
FROM public.dose_logs dl
JOIN public.profiles p ON dl.user_id = p.id
WHERE dl.scheduled_time >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name, p.age, p.elderly_mode
ORDER BY adherence_rate DESC;


-- ============================================
-- PRESCRIPTION & NOTIFICATION QUERIES
-- ============================================

-- 21. All prescriptions with details
SELECT 
    p.name as patient_name,
    pr.file_name,
    pr.uploaded_at,
    pr.status,
    pr.is_analyzed,
    pr.parsed_medicines,
    pr.analysis_result
FROM public.prescriptions pr
JOIN public.profiles p ON pr.user_id = p.id
ORDER BY pr.uploaded_at DESC;

-- 22. Unread notifications by patient
SELECT 
    p.name as patient_name,
    n.type,
    n.message,
    n.created_at,
    m.name as related_medication
FROM public.notifications n
JOIN public.profiles p ON n.user_id = p.id
LEFT JOIN public.medicines m ON n.medicine_id = m.id
WHERE n.read = false
ORDER BY n.created_at DESC;

-- 23. Notification statistics by type
SELECT 
    n.type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN n.read = false THEN 1 END) as unread_count,
    COUNT(CASE WHEN n.read = true THEN 1 END) as read_count,
    ROUND(
        (COUNT(CASE WHEN n.read = true THEN 1 END)::numeric / 
        NULLIF(COUNT(*), 0) * 100), 2
    ) as read_percentage
FROM public.notifications n
GROUP BY n.type
ORDER BY total_count DESC;

-- 24. Recent refill warnings
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
ORDER BY m.stock_count ASC, n.created_at DESC;


-- ============================================
-- CAREGIVER & ORDER QUERIES
-- ============================================

-- 25. Caregiver-Patient relationships
SELECT 
    c.name as caregiver_name,
    c.email as caregiver_email,
    cl.patient_name,
    p.email as patient_email,
    p.age as patient_age,
    p.elderly_mode,
    cl.created_at as link_created
FROM public.caregiver_links cl
JOIN public.profiles c ON cl.caregiver_id = c.id
JOIN public.profiles p ON cl.patient_id = p.id
ORDER BY c.name, cl.patient_name;

-- 26. All orders with vendor details
SELECT 
    p.name as patient_name,
    o.vendor->>'name' as vendor_name,
    o.vendor->>'type' as vendor_type,
    o.delivery->>'address' as delivery_address,
    o.delivery->>'date' as delivery_date,
    o.notes,
    o.created_at as order_date
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC;

-- 27. Order items breakdown
SELECT 
    p.name as patient_name,
    o.vendor->>'name' as vendor,
    o.created_at as order_date,
    jsonb_array_length(o.items) as item_count,
    o.items
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC;


-- ============================================
-- ADVANCED ANALYTICAL QUERIES
-- ============================================

-- 28. Complete Patient Health Dashboard
SELECT 
    p.id,
    p.name,
    p.age,
    p.elderly_mode,
    p.phone,
    COUNT(DISTINCT m.id) as total_medications,
    COUNT(DISTINCT dp.id) as active_diseases,
    COUNT(DISTINCT CASE WHEN m.stock_count <= m.refill_threshold THEN m.id END) as medications_need_refill,
    COUNT(DISTINCT pr.id) as total_prescriptions,
    COUNT(DISTINCT n.id) FILTER (WHERE n.read = false) as unread_notifications
FROM public.profiles p
LEFT JOIN public.medicines m ON p.id = m.user_id
LEFT JOIN public.disease_profiles dp ON p.id = dp.user_id AND dp.status = 'active'
LEFT JOIN public.prescriptions pr ON p.id = pr.user_id
LEFT JOIN public.notifications n ON p.id = n.user_id
WHERE p.role = 'PATIENT'
GROUP BY p.id, p.name, p.age, p.elderly_mode, p.phone
ORDER BY p.name;

-- 29. Polypharmacy Risk Assessment
SELECT 
    p.name as patient_name,
    p.age,
    COUNT(DISTINCT m.id) as medication_count,
    array_agg(DISTINCT m.name ORDER BY m.name) as medications,
    array_agg(DISTINCT dp.disease_name ORDER BY dp.disease_name) as conditions,
    CASE 
        WHEN COUNT(DISTINCT m.id) >= 5 THEN 'High Risk - Polypharmacy'
        WHEN COUNT(DISTINCT m.id) >= 3 THEN 'Moderate Risk'
        WHEN COUNT(DISTINCT m.id) >= 1 THEN 'Low Risk'
        ELSE 'No Medications'
    END as interaction_risk_level
FROM public.profiles p
LEFT JOIN public.medicines m ON p.id = m.user_id
LEFT JOIN public.disease_profiles dp ON p.id = dp.user_id AND dp.status = 'active'
WHERE p.role = 'PATIENT'
GROUP BY p.id, p.name, p.age
ORDER BY medication_count DESC, p.name;

-- 30. Elderly patients requiring special attention
SELECT 
    p.name,
    p.age,
    p.phone,
    p.elderly_mode,
    p.emergency_contact,
    COUNT(DISTINCT m.id) as medication_count,
    COUNT(DISTINCT dp.id) as disease_count,
    COUNT(DISTINCT CASE WHEN m.stock_count <= m.refill_threshold THEN m.id END) as refills_needed
FROM public.profiles p
LEFT JOIN public.medicines m ON p.id = m.user_id
LEFT JOIN public.disease_profiles dp ON p.id = dp.user_id AND dp.status = 'active'
WHERE p.age >= 65 OR p.elderly_mode = true
GROUP BY p.id, p.name, p.age, p.phone, p.elderly_mode, p.emergency_contact
ORDER BY p.age DESC;

-- 31. Medication side effects analysis
SELECT 
    m.name as medication,
    m.form,
    COUNT(DISTINCT m.user_id) as patient_count,
    m.side_effects,
    array_length(m.side_effects, 1) as side_effect_count
FROM public.medicines m
WHERE m.side_effects IS NOT NULL AND array_length(m.side_effects, 1) > 0
GROUP BY m.name, m.form, m.side_effects
ORDER BY patient_count DESC, side_effect_count DESC;

-- 32. Doctor workload analysis
SELECT 
    COALESCE(m.prescribed_by, 'Unknown') as doctor_name,
    COUNT(DISTINCT m.user_id) as unique_patients,
    COUNT(DISTINCT m.id) as total_prescriptions,
    COUNT(DISTINCT dp.id) as diseases_managed,
    array_agg(DISTINCT m.name ORDER BY m.name) as medications_prescribed
FROM public.medicines m
LEFT JOIN public.disease_profiles dp ON m.prescribed_by = dp.doctor_name
GROUP BY m.prescribed_by
ORDER BY unique_patients DESC, total_prescriptions DESC;


-- ============================================
-- SUMMARY & STATISTICS QUERIES
-- ============================================

-- 33. System-wide statistics
SELECT 
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'PATIENT') as total_patients,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'CAREGIVER') as total_caregivers,
    (SELECT COUNT(*) FROM public.medicines) as total_medications,
    (SELECT COUNT(*) FROM public.disease_profiles WHERE status = 'active') as active_diseases,
    (SELECT COUNT(*) FROM public.prescriptions) as total_prescriptions,
    (SELECT COUNT(*) FROM public.dose_logs) as total_dose_logs,
    (SELECT COUNT(*) FROM public.notifications WHERE read = false) as unread_notifications,
    (SELECT COUNT(*) FROM public.orders) as total_orders;

-- 34. Age demographics
SELECT 
    CASE 
        WHEN age < 18 THEN 'Under 18'
        WHEN age BETWEEN 18 AND 30 THEN '18-30'
        WHEN age BETWEEN 31 AND 50 THEN '31-50'
        WHEN age BETWEEN 51 AND 65 THEN '51-65'
        WHEN age > 65 THEN 'Over 65'
        ELSE 'Unknown'
    END as age_group,
    COUNT(*) as patient_count,
    ROUND(AVG(age), 1) as average_age,
    COUNT(CASE WHEN elderly_mode = true THEN 1 END) as elderly_mode_enabled
FROM public.profiles
WHERE role = 'PATIENT' AND age IS NOT NULL
GROUP BY age_group
ORDER BY average_age;

-- 35. Medication form distribution
SELECT 
    form,
    COUNT(*) as count,
    ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM public.medicines) * 100), 2) as percentage
FROM public.medicines
GROUP BY form
ORDER BY count DESC;

-- 36. Disease severity distribution
SELECT 
    severity,
    COUNT(*) as count,
    ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM public.disease_profiles WHERE status = 'active') * 100), 2) as percentage,
    array_agg(DISTINCT disease_name) as diseases
FROM public.disease_profiles
WHERE status = 'active'
GROUP BY severity
ORDER BY 
    CASE severity
        WHEN 'severe' THEN 1
        WHEN 'moderate' THEN 2
        WHEN 'mild' THEN 3
    END;

-- ============================================
-- QUICK REFERENCE QUERIES
-- ============================================

-- 37. Count records in each table
SELECT 
    'profiles' as table_name, COUNT(*) as record_count FROM public.profiles
UNION ALL
SELECT 'medicines', COUNT(*) FROM public.medicines
UNION ALL
SELECT 'disease_profiles', COUNT(*) FROM public.disease_profiles
UNION ALL
SELECT 'prescriptions', COUNT(*) FROM public.prescriptions
UNION ALL
SELECT 'dose_logs', COUNT(*) FROM public.dose_logs
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications
UNION ALL
SELECT 'caregiver_links', COUNT(*) FROM public.caregiver_links
UNION ALL
SELECT 'orders', COUNT(*) FROM public.orders
ORDER BY record_count DESC;

-- 38. Recent activity (last 24 hours)
SELECT 
    'New Prescriptions' as activity_type,
    COUNT(*) as count
FROM public.prescriptions
WHERE uploaded_at >= NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'New Notifications',
    COUNT(*)
FROM public.notifications
WHERE created_at >= NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'Doses Logged',
    COUNT(*)
FROM public.dose_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'New Orders',
    COUNT(*)
FROM public.orders
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- ============================================
-- END OF QUERIES
-- ============================================
-- All queries are ready to execute in Supabase SQL Editor
-- No errors expected - tested for compatibility

