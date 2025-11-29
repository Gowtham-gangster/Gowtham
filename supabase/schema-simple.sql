-- MedReminder Pro - Simplified Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('PATIENT', 'CAREGIVER')),
    elderly_mode BOOLEAN DEFAULT false,
    timezone TEXT DEFAULT 'UTC',
    caregiver_invite_code TEXT UNIQUE,
    voice_reminders_enabled BOOLEAN DEFAULT true,
    notifications_enabled BOOLEAN DEFAULT true,
    notification_settings JSONB DEFAULT '{"doseReminders": true, "missedDoseAlerts": true, "refillWarnings": true, "orderNotifications": true, "emailEnabled": false}'::jsonb,
    age INTEGER,
    phone TEXT,
    address TEXT,
    emergency_contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MEDICINES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    nickname TEXT,
    strength TEXT NOT NULL,
    form TEXT NOT NULL,
    color_tag TEXT,
    icon_key TEXT,
    stock_count INTEGER DEFAULT 0,
    refill_threshold INTEGER DEFAULT 10,
    instructions TEXT,
    frequency JSONB,
    start_date DATE,
    end_date DATE,
    prescribed_by TEXT,
    refills_remaining INTEGER,
    quantity INTEGER,
    side_effects TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SCHEDULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE NOT NULL,
    frequency_type TEXT NOT NULL,
    times_of_day TEXT[] NOT NULL,
    days_of_week INTEGER[],
    interval_days INTEGER,
    interval_hours INTEGER,
    start_date DATE NOT NULL,
    end_date DATE,
    dosage_amount NUMERIC NOT NULL,
    dosage_unit TEXT NOT NULL,
    max_dose_per_day NUMERIC,
    max_dose_per_intake NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DOSE LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.dose_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    taken_time TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DISEASE PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.disease_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    disease_id TEXT NOT NULL,
    disease_name TEXT NOT NULL,
    diagnosis_date DATE,
    severity TEXT,
    status TEXT,
    symptoms TEXT[],
    medications UUID[],
    last_checkup DATE,
    next_checkup DATE,
    doctor_name TEXT,
    doctor_contact TEXT,
    notes TEXT,
    guidelines TEXT[],
    precautions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PRESCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT,
    file_path TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    parsed_medicines JSONB,
    status TEXT,
    analysis_result JSONB,
    linked_disease_profiles UUID[],
    is_analyzed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CAREGIVER LINKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.caregiver_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    caregiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    patient_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(caregiver_id, patient_id)
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    vendor JSONB NOT NULL,
    items JSONB NOT NULL,
    notes TEXT,
    delivery JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_medicines_user_id ON public.medicines(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_medicine_id ON public.schedules(medicine_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_user_id ON public.dose_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_medicine_id ON public.dose_logs(medicine_id);
CREATE INDEX IF NOT EXISTS idx_disease_profiles_user_id ON public.disease_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON public.prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- ============================================
-- ROW LEVEL SECURITY - ENABLE
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY - POLICIES
-- ============================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Medicines policies
DROP POLICY IF EXISTS "Users can view own medicines" ON public.medicines;
CREATE POLICY "Users can view own medicines" ON public.medicines
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own medicines" ON public.medicines;
CREATE POLICY "Users can insert own medicines" ON public.medicines
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own medicines" ON public.medicines;
CREATE POLICY "Users can update own medicines" ON public.medicines
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own medicines" ON public.medicines;
CREATE POLICY "Users can delete own medicines" ON public.medicines
    FOR DELETE USING (auth.uid() = user_id);

-- Schedules policies
DROP POLICY IF EXISTS "Users can manage own schedules" ON public.schedules;
CREATE POLICY "Users can manage own schedules" ON public.schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.medicines
            WHERE medicines.id = schedules.medicine_id
            AND medicines.user_id = auth.uid()
        )
    );

-- Dose logs policies
DROP POLICY IF EXISTS "Users can view own dose logs" ON public.dose_logs;
CREATE POLICY "Users can view own dose logs" ON public.dose_logs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own dose logs" ON public.dose_logs;
CREATE POLICY "Users can insert own dose logs" ON public.dose_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own dose logs" ON public.dose_logs;
CREATE POLICY "Users can update own dose logs" ON public.dose_logs
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own dose logs" ON public.dose_logs;
CREATE POLICY "Users can delete own dose logs" ON public.dose_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Disease profiles policies
DROP POLICY IF EXISTS "Users can view own disease profiles" ON public.disease_profiles;
CREATE POLICY "Users can view own disease profiles" ON public.disease_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own disease profiles" ON public.disease_profiles;
CREATE POLICY "Users can insert own disease profiles" ON public.disease_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own disease profiles" ON public.disease_profiles;
CREATE POLICY "Users can update own disease profiles" ON public.disease_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own disease profiles" ON public.disease_profiles;
CREATE POLICY "Users can delete own disease profiles" ON public.disease_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Prescriptions policies
DROP POLICY IF EXISTS "Users can view own prescriptions" ON public.prescriptions;
CREATE POLICY "Users can view own prescriptions" ON public.prescriptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own prescriptions" ON public.prescriptions;
CREATE POLICY "Users can insert own prescriptions" ON public.prescriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own prescriptions" ON public.prescriptions;
CREATE POLICY "Users can update own prescriptions" ON public.prescriptions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own prescriptions" ON public.prescriptions;
CREATE POLICY "Users can delete own prescriptions" ON public.prescriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Caregiver links policies
DROP POLICY IF EXISTS "Users can view own caregiver links" ON public.caregiver_links;
CREATE POLICY "Users can view own caregiver links" ON public.caregiver_links
    FOR SELECT USING (auth.uid() = caregiver_id OR auth.uid() = patient_id);

DROP POLICY IF EXISTS "Caregivers can insert links" ON public.caregiver_links;
CREATE POLICY "Caregivers can insert links" ON public.caregiver_links
    FOR INSERT WITH CHECK (auth.uid() = caregiver_id);

DROP POLICY IF EXISTS "Users can delete own caregiver links" ON public.caregiver_links;
CREATE POLICY "Users can delete own caregiver links" ON public.caregiver_links
    FOR DELETE USING (auth.uid() = caregiver_id OR auth.uid() = patient_id);

-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
CREATE POLICY "Users can update own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own orders" ON public.orders;
CREATE POLICY "Users can delete own orders" ON public.orders
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medicines_updated_at ON public.medicines;
CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON public.medicines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedules_updated_at ON public.schedules;
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_disease_profiles_updated_at ON public.disease_profiles;
CREATE TRIGGER update_disease_profiles_updated_at BEFORE UPDATE ON public.disease_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('prescriptions', 'prescriptions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Users can upload own prescriptions" ON storage.objects;
CREATE POLICY "Users can upload own prescriptions"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'prescriptions' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view own prescriptions" ON storage.objects;
CREATE POLICY "Users can view own prescriptions"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'prescriptions' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own prescriptions" ON storage.objects;
CREATE POLICY "Users can delete own prescriptions"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'prescriptions' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- COMPLETED!
-- ============================================
SELECT 'Schema created successfully!' as message;
