# 🚀 Supabase Setup Guide for MedReminder Pro

## ✅ Prerequisites Completed
- ✅ Supabase client installed (`@supabase/supabase-js`)
- ✅ Database schema created (`supabase/schema.sql`)
- ✅ Supabase client configured (`src/lib/supabase.ts`)
- ✅ Environment files created (`.env`, `.env.example`)

---

## 📝 Step-by-Step Setup

### Step 1: Create Supabase Project (5 minutes)

1. **Go to Supabase**
   - Visit: https://supabase.com
   - Click "Start your project"
   - Sign in with GitHub (recommended) or email

2. **Create New Project**
   - Click "New Project"
   - Choose your organization (or create one)
   - Fill in project details:
     - **Name**: `medreminder-pro` (or your choice)
     - **Database Password**: Create a strong password (SAVE THIS!)
     - **Region**: Choose closest to you
     - **Pricing Plan**: Free tier is perfect for development

3. **Wait for Setup**
   - Takes 1-2 minutes to provision
   - You'll see a progress indicator

---

### Step 2: Run Database Schema (3 minutes)

1. **Open SQL Editor**
   - In your Supabase dashboard
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

2. **Copy and Paste Schema**
   - Open `supabase/schema.sql` from this project
   - Copy ALL the SQL code
   - Paste into the SQL Editor

3. **Run the Query**
   - Click "Run" button (or press Ctrl/Cmd + Enter)
   - Wait for "Success" message
   - You should see: "Success. No rows returned"

4. **Verify Tables Created**
   - Click "Table Editor" in left sidebar
   - You should see all tables:
     - profiles
     - medicines
     - schedules
     - dose_logs
     - disease_profiles
     - prescriptions
     - notifications
     - caregiver_links
     - orders

---

### Step 3: Get Your Credentials (2 minutes)

1. **Go to Project Settings**
   - Click the gear icon (⚙️) in bottom left
   - Click "API" in the settings menu

2. **Copy Your Credentials**
   - **Project URL**: Copy the URL (looks like `https://xxxxx.supabase.co`)
   - **anon/public key**: Copy the key (starts with `eyJ...`)

---

### Step 4: Configure Environment Variables (1 minute)

1. **Open `.env` file** in your project root

2. **Replace placeholders** with your actual credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Save the file**

---

### Step 5: Enable Email Authentication (Optional, 2 minutes)

1. **Go to Authentication Settings**
   - Click "Authentication" in left sidebar
   - Click "Providers"

2. **Configure Email Provider**
   - Email is enabled by default
   - For production, configure SMTP settings
   - For development, use Supabase's built-in email

3. **Email Templates** (Optional)
   - Click "Email Templates"
   - Customize signup/reset password emails

---

### Step 6: Configure Storage (Optional, 2 minutes)

The schema already created a `prescriptions` bucket, but verify:

1. **Go to Storage**
   - Click "Storage" in left sidebar
   - You should see "prescriptions" bucket

2. **Verify Policies**
   - Click on "prescriptions" bucket
   - Click "Policies" tab
   - Should see 3 policies (upload, view, delete)

---

### Step 7: Test the Connection (1 minute)

1. **Restart your dev server**
   ```bash
   npm run dev
   ```

2. **Check the console**
   - Open browser console
   - Should NOT see "Supabase credentials not found"
   - If configured correctly, you'll see normal app logs

3. **Test signup**
   - Go to signup page
   - Create a test account
   - Check if it works!

---

## 🎯 What's Been Implemented

### ✅ Database Schema
- **9 tables** with proper relationships
- **Row Level Security (RLS)** for data privacy
- **Indexes** for performance
- **Triggers** for auto-updating timestamps
- **Storage bucket** for prescription files

### ✅ Security Features
- **RLS Policies**: Users can only access their own data
- **Authentication**: Email/password ready
- **File Upload Security**: Users can only upload to their folder
- **HIPAA-Ready**: Proper data isolation

### ✅ Features Enabled
- User profiles with settings
- Medicines with schedules
- Dose logging and tracking
- Disease profile management
- Prescription file uploads
- Notifications system
- Caregiver linking
- Order management

---

## 🔧 Next Steps (What I'll Implement Next)

Once you provide your Supabase credentials, I'll implement:

### 1. **Authentication Service** (`src/services/auth-service.ts`)
- Sign up / Sign in
- Password reset
- Session management
- Profile creation

### 2. **Database Service Layer** (`src/services/database/`)
- `medicines-service.ts` - CRUD for medicines
- `schedules-service.ts` - Schedule management
- `dose-logs-service.ts` - Dose tracking
- `disease-profiles-service.ts` - Disease management
- `prescriptions-service.ts` - File uploads
- `notifications-service.ts` - Real-time notifications

### 3. **Real-time Subscriptions**
- Live updates for medicines
- Real-time notifications
- Caregiver monitoring

### 4. **Hybrid Mode**
- Keep demo data for testing
- Switch between local/cloud
- Data sync utilities

### 5. **Migration Utilities**
- Import demo data to Supabase
- Export data for backup
- Sync local to cloud

---

## 📊 Database Structure Overview

```
auth.users (Supabase managed)
    ↓
profiles (your user data)
    ↓
    ├── medicines
    │   └── schedules
    │       └── dose_logs
    ├── disease_profiles
    ├── prescriptions (with file storage)
    ├── notifications
    ├── caregiver_links
    └── orders
```

---

## 🔐 Security Best Practices

### ✅ Already Implemented
- Row Level Security on all tables
- User data isolation
- Secure file uploads
- Authentication required

### 🎯 Recommendations
1. **Never commit `.env`** - Already in `.gitignore`
2. **Use environment variables** - Already configured
3. **Enable 2FA** - In Supabase dashboard
4. **Regular backups** - Supabase does this automatically
5. **Monitor usage** - Check Supabase dashboard

---

## 🐛 Troubleshooting

### Issue: "Supabase credentials not found"
**Solution**: Check your `.env` file has correct values

### Issue: "Failed to create table"
**Solution**: Make sure you ran the ENTIRE schema.sql file

### Issue: "Row Level Security policy violation"
**Solution**: Make sure you're authenticated before accessing data

### Issue: "Storage bucket not found"
**Solution**: Run the storage bucket creation part of schema.sql

### Issue: "Can't upload files"
**Solution**: Check storage policies are created

---

## 📚 Useful Resources

- **Supabase Docs**: https://supabase.com/docs
- **JavaScript Client**: https://supabase.com/docs/reference/javascript
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **Storage**: https://supabase.com/docs/guides/storage

---

## ✨ Ready to Continue!

Once you've completed Steps 1-4 and provided your credentials, I'll:

1. ✅ Implement all service layers
2. ✅ Add authentication flows
3. ✅ Set up real-time subscriptions
4. ✅ Create data migration tools
5. ✅ Test everything end-to-end

**Just paste your Supabase URL and anon key when ready!** 🚀
