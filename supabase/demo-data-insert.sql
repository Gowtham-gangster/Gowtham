-- ============================================
-- MEDREMINDER PRO - DEMO DATA INSERT STATEMENTS
-- ============================================
-- Run these INSERT statements first to populate your database
-- Then use the SELECT queries to view the data

-- ============================================
-- 1. INSERT DEMO USERS (PROFILES)
-- ============================================
-- Note: Replace the UUIDs with actual auth.users IDs from your Supabase Auth

INSERT INTO public.profiles (id, name, email, role, age, phone, address, emergency_contact, elderly_mode, created_at)
VALUES 
(
    'user-1-uuid-replace-with-real-auth-id',
    'John Anderson',
    'john.anderson@example.com',
    'PATIENT',
    65,
    '+1-555-0101',
    '123 Main St, Springfield, IL 62701',
    '{"name": "Mary Anderson", "phone": "+1-555-0102", "relationship": "Spouse"}'::jsonb,
    true,
    '2024-01-15T10:00:00Z'
),
(
    'user-2-uuid-replace-with-real-auth-id',
    'Sarah Mitchell',
    'sarah.mitchell@example.com',
    'PATIENT',
    58,
    '+1-555-0201',
    '456 Oak Ave, Portland, OR 97201',
    '{"name": "David Mitchell", "phone": "+1-555-0202", "relationship": "Husband"}'::jsonb,
    false,
    '2024-02-20T14:30:00Z'
),
(
    'user-3-uuid-replace-with-real-auth-id',
    'Robert Chen',
    'robert.chen@example.com',
    'PATIENT',
    72,
    '+1-555-0301',
    '789 Pine Rd, Seattle, WA 98101',
    '{"name": "Lisa Chen", "phone": "+1-555-0302", "relationship": "Daughter"}'::jsonb,
    true,
    '2024-03-10T09:15:00Z'
);


-- ============================================
-- 2. INSERT DEMO MEDICINES
-- ============================================

INSERT INTO public.medicines (id, user_id, name, strength, form, instructions, start_date, end_date, prescribed_by, refills_remaining, stock_count, refill_threshold, side_effects, created_at)
VALUES
-- John Anderson's Medications
(
    uuid_generate_v4(),
    'user-1-uuid-replace-with-real-auth-id',
    'Metformin',
    '500mg',
    'tablet',
    'Take with meals',
    '2024-01-15',
    '2024-12-31',
    'Dr. Emily Roberts',
    3,
    60,
    10,
    ARRAY['Nausea', 'Diarrhea', 'Stomach upset'],
    '2024-01-15T10:30:00Z'
),
(
    uuid_generate_v4(),
    'user-1-uuid-replace-with-real-auth-id',
    'Lisinopril',
    '10mg',
    'tablet',
    'Take in the morning',
    '2024-01-15',
    NULL,
    'Dr. Emily Roberts',
    5,
    30,
    10,
    ARRAY['Dizziness', 'Dry cough', 'Headache'],
    '2024-01-15T10:35:00Z'
),
(
    uuid_generate_v4(),
    'user-1-uuid-replace-with-real-auth-id',
    'Atorvastatin',
    '20mg',
    'tablet',
    'Take at bedtime',
    '2024-02-01',
    NULL,
    'Dr. Emily Roberts',
    4,
    30,
    10,
    ARRAY['Muscle pain', 'Fatigue'],
    '2024-02-01T11:00:00Z'
),
-- Sarah Mitchell's Medications
(
    uuid_generate_v4(),
    'user-2-uuid-replace-with-real-auth-id',
    'Levothyroxine',
    '75mcg',
    'tablet',
    'Take on empty stomach, 30 minutes before breakfast',
    '2024-02-20',
    NULL,
    'Dr. Michael Chang',
    6,
    30,
    10,
    ARRAY['Palpitations', 'Insomnia'],
    '2024-02-20T15:00:00Z'
),
(
    uuid_generate_v4(),
    'user-2-uuid-replace-with-real-auth-id',
    'Amlodipine',
    '5mg',
    'tablet',
    'Take with or without food',
    '2024-02-20',
    NULL,
    'Dr. Michael Chang',
    5,
    30,
    10,
    ARRAY['Swelling of ankles', 'Flushing'],
    '2024-02-20T15:10:00Z'
),
-- Robert Chen's Medications
(
    uuid_generate_v4(),
    'user-3-uuid-replace-with-real-auth-id',
    'Albuterol',
    '90mcg',
    'inhaler',
    'Shake well before use. 2 puffs every 4-6 hours as needed',
    '2024-03-10',
    NULL,
    'Dr. Jennifer Lee',
    2,
    1,
    1,
    ARRAY['Tremor', 'Nervousness', 'Rapid heartbeat'],
    '2024-03-10T09:30:00Z'
),
(
    uuid_generate_v4(),
    'user-3-uuid-replace-with-real-auth-id',
    'Fluticasone',
    '250mcg',
    'inhaler',
    'Rinse mouth after use',
    '2024-03-10',
    NULL,
    'Dr. Jennifer Lee',
    3,
    1,
    1,
    ARRAY['Hoarseness', 'Throat irritation'],
    '2024-03-10T09:35:00Z'
),
(
    uuid_generate_v4(),
    'user-3-uuid-replace-with-real-auth-id',
    'Aspirin',
    '81mg',
    'tablet',
    'Take with food',
    '2024-03-10',
    NULL,
    'Dr. Jennifer Lee',
    6,
    90,
    20,
    ARRAY['Stomach upset', 'Easy bruising'],
    '2024-03-10T09:40:00Z'
);


-- ============================================
-- 3. INSERT DEMO DISEASE PROFILES
-- ============================================

INSERT INTO public.disease_profiles (id, user_id, disease_id, disease_name, diagnosis_date, severity, status, symptoms, doctor_name, doctor_contact, last_checkup, next_checkup, notes, guidelines, precautions, created_at)
VALUES
-- John Anderson's Diseases
(
    uuid_generate_v4(),
    'user-1-uuid-replace-with-real-auth-id',
    'diabetes',
    'Type 2 Diabetes',
    '2020-05-15',
    'moderate',
    'active',
    ARRAY['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision'],
    'Dr. Emily Roberts',
    '+1-555-1001',
    '2024-01-10',
    '2024-04-10',
    'Patient managing well with medication and diet. HbA1c at 6.8%',
    ARRAY['Monitor blood glucose daily', 'Follow diabetic diet plan', 'Exercise 30 minutes daily', 'Regular foot care', 'Annual eye examination'],
    ARRAY['Avoid high sugar foods', 'Check feet daily for cuts or sores', 'Carry glucose tablets for hypoglycemia', 'Stay hydrated'],
    '2024-01-15T10:00:00Z'
),
(
    uuid_generate_v4(),
    'user-1-uuid-replace-with-real-auth-id',
    'hypertension',
    'Hypertension',
    '2019-03-20',
    'moderate',
    'active',
    ARRAY['Occasional headaches', 'Dizziness'],
    'Dr. Emily Roberts',
    '+1-555-1001',
    '2024-01-10',
    '2024-04-10',
    'Blood pressure controlled at 130/80. Continue current medication.',
    ARRAY['Monitor blood pressure twice daily', 'Reduce sodium intake', 'Maintain healthy weight', 'Regular exercise', 'Limit alcohol consumption'],
    ARRAY['Avoid excessive salt', 'Manage stress levels', 'No smoking', 'Limit caffeine intake'],
    '2024-01-15T10:05:00Z'
),
(
    uuid_generate_v4(),
    'user-1-uuid-replace-with-real-auth-id',
    'heart-disease',
    'Coronary Artery Disease',
    '2021-08-10',
    'moderate',
    'active',
    ARRAY['Chest discomfort', 'Shortness of breath', 'Fatigue'],
    'Dr. Emily Roberts',
    '+1-555-1001',
    '2024-02-01',
    '2024-05-01',
    'Cholesterol levels improving. LDL at 95 mg/dL.',
    ARRAY['Heart-healthy diet', 'Regular cardiac exercise', 'Stress management', 'Regular cholesterol monitoring', 'Maintain healthy weight'],
    ARRAY['Avoid high-fat foods', 'No strenuous activity without approval', 'Recognize warning signs of heart attack', 'Keep nitroglycerin accessible'],
    '2024-02-01T11:00:00Z'
),
-- Sarah Mitchell's Diseases
(
    uuid_generate_v4(),
    'user-2-uuid-replace-with-real-auth-id',
    'thyroid-disorders',
    'Hypothyroidism',
    '2018-11-05',
    'mild',
    'active',
    ARRAY['Fatigue', 'Weight gain', 'Cold sensitivity', 'Dry skin'],
    'Dr. Michael Chang',
    '+1-555-2001',
    '2024-02-15',
    '2024-08-15',
    'TSH levels normal at 2.5. Continue current dosage.',
    ARRAY['Take medication consistently', 'Regular thyroid function tests', 'Maintain balanced diet', 'Adequate iodine intake', 'Regular exercise'],
    ARRAY['Take medication on empty stomach', 'Avoid soy products near medication time', 'Monitor for symptoms changes', 'Inform doctor of any new medications'],
    '2024-02-20T15:00:00Z'
),
(
    uuid_generate_v4(),
    'user-2-uuid-replace-with-real-auth-id',
    'hypertension',
    'Hypertension',
    '2020-06-12',
    'mild',
    'active',
    ARRAY['Occasional headaches'],
    'Dr. Michael Chang',
    '+1-555-2001',
    '2024-02-15',
    '2024-05-15',
    'Blood pressure well controlled at 125/78.',
    ARRAY['Monitor blood pressure daily', 'Low sodium diet', 'Regular exercise', 'Stress management', 'Maintain healthy weight'],
    ARRAY['Limit salt intake', 'Avoid processed foods', 'No smoking', 'Moderate alcohol consumption'],
    '2024-02-20T15:10:00Z'
),
-- Robert Chen's Diseases
(
    uuid_generate_v4(),
    'user-3-uuid-replace-with-real-auth-id',
    'asthma',
    'Asthma',
    '2015-04-20',
    'moderate',
    'active',
    ARRAY['Wheezing', 'Shortness of breath', 'Chest tightness', 'Coughing'],
    'Dr. Jennifer Lee',
    '+1-555-3001',
    '2024-03-05',
    '2024-06-05',
    'Asthma well controlled with current regimen. Peak flow at 85% of personal best.',
    ARRAY['Use controller inhaler daily', 'Keep rescue inhaler accessible', 'Avoid triggers', 'Monitor peak flow', 'Regular breathing exercises'],
    ARRAY['Avoid smoke and pollution', 'Stay away from allergens', 'Use air purifier at home', 'Get flu vaccine annually', 'Recognize early warning signs'],
    '2024-03-10T09:30:00Z'
),
(
    uuid_generate_v4(),
    'user-3-uuid-replace-with-real-auth-id',
    'heart-disease',
    'Coronary Artery Disease',
    '2019-09-15',
    'moderate',
    'active',
    ARRAY['Chest pain', 'Shortness of breath', 'Fatigue'],
    'Dr. Jennifer Lee',
    '+1-555-3001',
    '2024-03-05',
    '2024-06-05',
    'Patient stable. Continue aspirin therapy and lifestyle modifications.',
    ARRAY['Heart-healthy diet', 'Regular moderate exercise', 'Stress reduction', 'Regular cardiac monitoring', 'Maintain healthy weight'],
    ARRAY['Avoid high-cholesterol foods', 'No heavy lifting', 'Recognize heart attack symptoms', 'Keep emergency contacts handy', 'Avoid extreme temperatures'],
    '2024-03-10T09:40:00Z'
);

