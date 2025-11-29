-- MedReminder Pro - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('PATIENT', 'CAREGIVER')),
    elderly_mode BOOLEAN DEFAULT false,
    timezone TEXT DEFAULT 'UTC',
    caregiver_invite_code TEXT UNIQUE,
    voice_reminders_enabled BOOLEAN DEFAULT true,
    notifications_enabled BOOLEAN DEFAULT true,
    notification_settings JSONB DEFAULT '{
        "doseReminders": true,
        "missedDoseAlerts": true,
        "refillWarnings": true,
        "orderNotifications": true,
        "emailEnabled": false
    }'::jsonb,
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
CREATE TABLE public.medicines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    nickname TEXT,
    strength TEXT NOT NULL,
    form TEXT NOT NULL CHECK (form IN ('tablet', 'capsule', 'liquid', 'injection', 'inhaler', 'other')),
    color_tag TEXT CHECK (color_tag IN ('red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'teal')),
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
CREATE TABLE public.schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE NOT NULL,
    frequency_type TEXT NOT NULL CHECK (frequency_type IN ('DAILY', 'WEEKDAYS', 'CUSTOM_DAYS', 'EVERY_X_DAYS', 'EVERY_X_HOURS', 'AS_NEEDED')),
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
CREATE TABLE public.dose_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    taken_time TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'TAKEN', 'MISSED', 'SKIPPED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DISEASE PROFILES TABLE
-- ============================================
CREATE TABLE public.disease_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    disease_id TEXT NOT NULL,
    disease_name TEXT NOT NULL,
    diagnosis_date DATE,
    severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
    status TEXT CHECK (status IN ('active', 'managed', 'resolved')),
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
CREATE TABLE public.prescriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT,
    file_path TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    parsed_medicines JSONB,
    status TEXT CHECK (status IN ('pending', 'processed', 'error')),
    analysis_result JSONB,
    linked_disease_profiles UUID[],
    is_analyzed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('DOSE_DUE', 'MISSED_DOSE', 'REFILL_WARNING', 'CAREGIVER_ALERT')),
    message TEXT NOT NULL,
    medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CAREGIVER LINKS TABLE
-- ============================================
CREATE TABLE public.caregiver_links (
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
CREATE TABLE public.orders (
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
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_medicines_user_id ON public.medicines(user_id);
CREATE INDEX idx_schedules_medicine_id ON public.schedules(medicine_id);
CREATE INDEX idx_dose_logs_user_id ON public.dose_logs(user_id);
CREATE INDEX idx_dose_logs_medicine_id ON public.dose_logs(medicine_id);
CREATE INDEX idx_dose_logs_scheduled_time ON public.dose_logs(scheduled_time);
CREATE INDEX idx_disease_profiles_user_id ON public.disease_profiles(user_id);
CREATE INDEX idx_prescriptions_user_id ON public.prescriptions(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_caregiver_links_caregiver_id ON public.caregiver_links(caregiver_id);
CREATE INDEX idx_caregiver_links_patient_id ON public.caregiver_links(patient_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Medicines: Users can manage their own medicines
CREATE POLICY "Users can view own medicines" ON public.medicines
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medicines" ON public.medicines
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medicines" ON public.medicines
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medicines" ON public.medicines
    FOR DELETE USING (auth.uid() = user_id);

-- Schedules: Users can manage schedules for their medicines
CREATE POLICY "Users can view own schedules" ON public.schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.medicines
            WHERE medicines.id = schedules.medicine_id
            AND medicines.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own schedules" ON public.schedules
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.medicines
            WHERE medicines.id = schedules.medicine_id
            AND medicines.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own schedules" ON public.schedules
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.medicines
            WHERE medicines.id = schedules.medicine_id
            AND medicines.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own schedules" ON public.schedules
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.medicines
            WHERE medicines.id = schedules.medicine_id
            AND medicines.user_id = auth.uid()
        )
    );

-- Dose Logs: Users can manage their own dose logs
CREATE POLICY "Users can view own dose logs" ON public.dose_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dose logs" ON public.dose_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dose logs" ON public.dose_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dose logs" ON public.dose_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Disease Profiles: Users can manage their own disease profiles
CREATE POLICY "Users can view own disease profiles" ON public.disease_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own disease profiles" ON public.disease_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own disease profiles" ON public.disease_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own disease profiles" ON public.disease_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Prescriptions: Users can manage their own prescriptions
CREATE POLICY "Users can view own prescriptions" ON public.prescriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prescriptions" ON public.prescriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prescriptions" ON public.prescriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prescriptions" ON public.prescriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Notifications: Users can manage their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Caregiver Links: Caregivers and patients can view their links
CREATE POLICY "Users can view own caregiver links" ON public.caregiver_links
    FOR SELECT USING (auth.uid() = caregiver_id OR auth.uid() = patient_id);

CREATE POLICY "Caregivers can insert links" ON public.caregiver_links
    FOR INSERT WITH CHECK (auth.uid() = caregiver_id);

CREATE POLICY "Users can delete own caregiver links" ON public.caregiver_links
    FOR DELETE USING (auth.uid() = caregiver_id OR auth.uid() = patient_id);

-- Orders: Users can manage their own orders
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orders" ON public.orders
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON public.medicines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disease_profiles_updated_at BEFORE UPDATE ON public.disease_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate caregiver invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
BEGIN
    code := upper(substring(md5(random()::text) from 1 for 8));
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STORAGE BUCKETS for Prescription Files
-- ============================================

-- Create storage bucket for prescriptions
INSERT INTO storage.buckets (id, name, public)
VALUES ('prescriptions', 'prescriptions', false);

-- Storage policy: Users can upload their own prescription files
CREATE POLICY "Users can upload own prescriptions"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'prescriptions' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policy: Users can view their own prescription files
CREATE POLICY "Users can view own prescriptions"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'prescriptions' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policy: Users can delete their own prescription files
CREATE POLICY "Users can delete own prescriptions"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'prescriptions' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- COMPLETED!
-- ============================================
-- Your database schema is now ready!
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Configure your .env file with Supabase credentials
-- 3. Start using the Supabase client in your app
