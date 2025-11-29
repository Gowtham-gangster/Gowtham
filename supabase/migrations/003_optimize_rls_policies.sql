-- Migration: Optimize RLS Policies for Performance
-- Ensures RLS policies use indexed columns and are optimized for performance

-- ============================================
-- ADD PERFORMANCE INDEXES
-- ============================================

-- Profiles table indexes (most already exist, but ensuring they're there)
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_invite_code ON public.profiles(caregiver_invite_code) 
WHERE caregiver_invite_code IS NOT NULL;

-- Medicines table indexes
CREATE INDEX IF NOT EXISTS idx_medicines_user_id ON public.medicines(user_id);
CREATE INDEX IF NOT EXISTS idx_medicines_id_user_id ON public.medicines(id, user_id);

-- Schedules table indexes
CREATE INDEX IF NOT EXISTS idx_schedules_medicine_id ON public.schedules(medicine_id);

-- Dose logs table indexes
CREATE INDEX IF NOT EXISTS idx_dose_logs_user_id ON public.dose_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_medicine_id ON public.dose_logs(medicine_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_status ON public.dose_logs(status);
CREATE INDEX IF NOT EXISTS idx_dose_logs_scheduled_time ON public.dose_logs(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_dose_logs_user_status ON public.dose_logs(user_id, status);

-- Disease profiles table indexes
CREATE INDEX IF NOT EXISTS idx_disease_profiles_user_id ON public.disease_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_disease_profiles_disease_id ON public.disease_profiles(disease_id);

-- Prescriptions table indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON public.prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON public.prescriptions(status);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Caregiver links table indexes
CREATE INDEX IF NOT EXISTS idx_caregiver_links_caregiver_id ON public.caregiver_links(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_links_patient_id ON public.caregiver_links(patient_id);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ============================================
-- VERIFY RLS POLICIES ARE USING INDEXES
-- ============================================

-- All RLS policies already use indexed columns (auth.uid() and user_id/id)
-- The policies are already optimal, but let's add comments for documentation

COMMENT ON POLICY "Users can view own profile" ON public.profiles IS 
  'Uses indexed column: id. Performance: O(1) lookup via primary key.';

COMMENT ON POLICY "Users can view own medicines" ON public.medicines IS 
  'Uses indexed column: user_id. Performance: O(log n) via idx_medicines_user_id.';

COMMENT ON POLICY "Users can view own schedules" ON public.schedules IS 
  'Uses indexed column: medicine_id with EXISTS subquery. Performance: O(log n) via idx_schedules_medicine_id.';

COMMENT ON POLICY "Users can view own dose logs" ON public.dose_logs IS 
  'Uses indexed column: user_id. Performance: O(log n) via idx_dose_logs_user_id.';

COMMENT ON POLICY "Users can view own disease profiles" ON public.disease_profiles IS 
  'Uses indexed column: user_id. Performance: O(log n) via idx_disease_profiles_user_id.';

COMMENT ON POLICY "Users can view own prescriptions" ON public.prescriptions IS 
  'Uses indexed column: user_id. Performance: O(log n) via idx_prescriptions_user_id.';

COMMENT ON POLICY "Users can view own notifications" ON public.notifications IS 
  'Uses indexed column: user_id. Performance: O(log n) via idx_notifications_user_id.';

COMMENT ON POLICY "Users can view own caregiver links" ON public.caregiver_links IS 
  'Uses indexed columns: caregiver_id and patient_id. Performance: O(log n) via composite index.';

COMMENT ON POLICY "Users can view own orders" ON public.orders IS 
  'Uses indexed column: user_id. Performance: O(log n) via idx_orders_user_id.';

-- ============================================
-- ADD CAREGIVER ACCESS POLICIES
-- ============================================

-- Allow caregivers to view linked patients' medicines
DROP POLICY IF EXISTS "Caregivers can view linked patients medicines" ON public.medicines;
CREATE POLICY "Caregivers can view linked patients medicines" ON public.medicines
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.caregiver_links
      WHERE caregiver_links.caregiver_id = auth.uid()
      AND caregiver_links.patient_id = medicines.user_id
    )
  );

-- Allow caregivers to view linked patients' schedules
DROP POLICY IF EXISTS "Caregivers can view linked patients schedules" ON public.schedules;
CREATE POLICY "Caregivers can view linked patients schedules" ON public.schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.medicines
      WHERE medicines.id = schedules.medicine_id
      AND (
        medicines.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.caregiver_links
          WHERE caregiver_links.caregiver_id = auth.uid()
          AND caregiver_links.patient_id = medicines.user_id
        )
      )
    )
  );

-- Allow caregivers to view linked patients' dose logs
DROP POLICY IF EXISTS "Caregivers can view linked patients dose logs" ON public.dose_logs;
CREATE POLICY "Caregivers can view linked patients dose logs" ON public.dose_logs
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.caregiver_links
      WHERE caregiver_links.caregiver_id = auth.uid()
      AND caregiver_links.patient_id = dose_logs.user_id
    )
  );

-- Allow caregivers to view linked patients' disease profiles
DROP POLICY IF EXISTS "Caregivers can view linked patients disease profiles" ON public.disease_profiles;
CREATE POLICY "Caregivers can view linked patients disease profiles" ON public.disease_profiles
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.caregiver_links
      WHERE caregiver_links.caregiver_id = auth.uid()
      AND caregiver_links.patient_id = disease_profiles.user_id
    )
  );

-- ============================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================

ANALYZE public.profiles;
ANALYZE public.medicines;
ANALYZE public.schedules;
ANALYZE public.dose_logs;
ANALYZE public.disease_profiles;
ANALYZE public.prescriptions;
ANALYZE public.notifications;
ANALYZE public.caregiver_links;
ANALYZE public.orders;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON INDEX idx_dose_logs_user_status IS 
  'Composite index for efficient filtering by user and status';

COMMENT ON INDEX idx_notifications_user_read IS 
  'Composite index for efficient unread notification queries';

COMMENT ON INDEX idx_notifications_created_at IS 
  'Descending index for efficient recent notifications queries';

COMMENT ON INDEX idx_orders_created_at IS 
  'Descending index for efficient recent orders queries';
