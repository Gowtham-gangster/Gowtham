# MedReminder Pro - SQL Query Guide

## 📋 Overview

This guide provides comprehensive SQL queries for the MedReminder Pro application. All queries are tested and ready to execute in Supabase SQL Editor without errors.

## 📁 Files

1. **demo-data-insert.sql** - INSERT statements to populate demo data
2. **working-queries.sql** - 38 SELECT queries organized by category
3. **comprehensive-queries.sql** - Additional complex analytical queries

## 🚀 Quick Start

### Step 1: Insert Demo Data (Optional)

If you want to test with demo data:

```sql
-- Open: supabase/demo-data-insert.sql
-- Replace 'user-X-uuid-replace-with-real-auth-id' with actual auth.users IDs
-- Execute the INSERT statements
```

### Step 2: Run Queries

Open `supabase/working-queries.sql` and execute any query you need.

## 📊 Query Categories

### Basic Queries (1-5)
- View all patients
- View all medications
- View all disease profiles
- View all prescriptions
- View all notifications

### Patient-Specific Queries (6-8)
- Complete patient profile with counts
- Patient medications with full details
- Patient diseases with symptoms and guidelines

### Medication Management (9-12)
- Medications needing refill
- Medications by form type
- Medications by prescribing doctor
- Active medications (not expired)

### Disease Analysis (13-16)
- Disease distribution across patients
- Patients with multiple chronic conditions
- Upcoming medical checkups
- Disease-medication correlation

### Dose Logs & Adherence (17-20)
- Today's medication schedule
- Medication adherence rate (30 days)
- Recent missed doses (7 days)
- Overall patient adherence statistics

### Prescriptions & Notifications (21-24)
- All prescriptions with details
- Unread notifications by patient
- Notification statistics by type
- Recent refill warnings

### Caregiver & Orders (25-27)
- Caregiver-patient relationships
- All orders with vendor details
- Order items breakdown

### Advanced Analytics (28-32)
- Complete patient health dashboard
- Polypharmacy risk assessment
- Elderly patients requiring attention
- Medication side effects analysis
- Doctor workload analysis

### Summary & Statistics (33-38)
- System-wide statistics
- Age demographics
- Medication form distribution
- Disease severity distribution
- Record counts per table
- Recent activity (24 hours)

## 💡 Usage Examples

### Example 1: Find patients needing medication refills

```sql
SELECT 
    p.name as patient_name,
    p.phone,
    m.name as medication,
    m.stock_count,
    m.refill_threshold
FROM public.medicines m
JOIN public.profiles p ON m.user_id = p.id
WHERE m.stock_count <= m.refill_threshold
ORDER BY m.stock_count ASC;
```

### Example 2: Get patient health dashboard

```sql
SELECT 
    p.name,
    p.age,
    COUNT(DISTINCT m.id) as total_medications,
    COUNT(DISTINCT dp.id) as active_diseases
FROM public.profiles p
LEFT JOIN public.medicines m ON p.id = m.user_id
LEFT JOIN public.disease_profiles dp ON p.id = dp.user_id
WHERE p.role = 'PATIENT'
GROUP BY p.id, p.name, p.age;
```

### Example 3: Check medication adherence

```sql
SELECT 
    p.name,
    COUNT(CASE WHEN dl.status = 'TAKEN' THEN 1 END) as taken,
    COUNT(CASE WHEN dl.status = 'MISSED' THEN 1 END) as missed,
    ROUND(
        (COUNT(CASE WHEN dl.status = 'TAKEN' THEN 1 END)::numeric / 
        NULLIF(COUNT(*), 0) * 100), 2
    ) as adherence_rate
FROM public.dose_logs dl
JOIN public.profiles p ON dl.user_id = p.id
WHERE dl.scheduled_time >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name;
```

## 🔍 Common Scenarios

### Scenario 1: New Patient Onboarding
Run queries: 1, 6, 7, 8

### Scenario 2: Medication Management
Run queries: 9, 10, 11, 12

### Scenario 3: Disease Monitoring
Run queries: 13, 14, 15, 16

### Scenario 4: Adherence Tracking
Run queries: 17, 18, 19, 20

### Scenario 5: System Analytics
Run queries: 28, 29, 33, 34

## ⚠️ Important Notes

1. **User IDs**: Replace placeholder UUIDs with actual auth.users IDs
2. **Timestamps**: All timestamps are in UTC
3. **NULL Values**: Queries handle NULL values gracefully
4. **Performance**: Indexes are created for optimal query performance
5. **RLS**: Row Level Security policies are enforced

## 🛠️ Customization

### Modify Time Ranges

Change `INTERVAL '30 days'` to any duration:
- `INTERVAL '7 days'` - Last week
- `INTERVAL '90 days'` - Last 3 months
- `INTERVAL '1 year'` - Last year

### Filter by Specific Patient

Add `WHERE p.id = 'YOUR_USER_ID'` to any query

### Add Sorting

Add `ORDER BY column_name ASC/DESC` at the end

## 📈 Query Performance Tips

1. Use indexes on frequently queried columns
2. Limit results with `LIMIT` clause for large datasets
3. Use `EXPLAIN ANALYZE` to check query performance
4. Avoid `SELECT *` in production queries

## 🔗 Related Documentation

- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MedReminder Pro Schema](./schema.sql)

## 📞 Support

For questions or issues:
1. Check query syntax in Supabase SQL Editor
2. Verify table and column names match schema
3. Ensure RLS policies allow access
4. Check user authentication status

---

**Last Updated**: November 2024  
**Version**: 1.0  
**Compatible with**: PostgreSQL 14+, Supabase

