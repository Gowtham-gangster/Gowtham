# Demo Database Quick Start Guide

## 🚀 Getting Started

The demo database is now integrated into MedReminder Pro and will automatically load when you first open the application!

## ✨ What Happens Automatically

When you start the app for the first time:
1. **Auto-loads demo user**: John Anderson (65 years old)
2. **Pre-populated data**:
   - 3 medications with schedules
   - 3 chronic disease profiles (Diabetes, Hypertension, Heart Disease)
   - 2 prescription documents
   - 1 upcoming appointment
   - Medication history

## 🎯 Quick Actions

### View Demo Data
1. Open the app - demo data loads automatically
2. Navigate to **Dashboard** to see medications and schedules
3. Go to **Medicines** to view all medications
4. Check **Chronic Diseases** for disease profiles

### Switch Demo Users
1. Go to **Settings** page
2. Scroll to **Demo Data Manager** card
3. Select a different user from dropdown:
   - **John Anderson** (65) - Diabetes, Hypertension, Heart Disease
   - **Sarah Mitchell** (58) - Hypothyroidism, Hypertension
   - **Robert Chen** (72) - Asthma, Heart Disease
4. Click **Switch to Selected User**

### Clear Demo Data
1. Go to **Settings** page
2. Find **Demo Data Manager** card
3. Click **Clear Demo Data** button
4. All demo data will be removed

### Reload Demo Data
1. After clearing, select a user from dropdown
2. Click **Initialize Demo Data**
3. Fresh demo data will be loaded

## 📊 Demo User Profiles

### John Anderson (Default)
- **Age**: 65 years
- **Conditions**: Type 2 Diabetes, Hypertension, Coronary Artery Disease
- **Medications**: 
  - Metformin 500mg - Twice daily (8 AM, 8 PM)
  - Lisinopril 10mg - Once daily (8 AM)
  - Atorvastatin 20mg - Once daily at bedtime (9 PM)
- **Best for testing**: Multiple medications, complex schedules, elderly mode

### Sarah Mitchell
- **Age**: 58 years
- **Conditions**: Hypothyroidism, Hypertension
- **Medications**:
  - Levothyroxine 75mcg - Once daily before breakfast (7 AM)
  - Amlodipine 5mg - Once daily (8 AM)
- **Best for testing**: Morning medication routines, timing constraints

### Robert Chen
- **Age**: 72 years
- **Conditions**: Asthma, Coronary Artery Disease
- **Medications**:
  - Albuterol 90mcg inhaler - As needed
  - Fluticasone 250mcg inhaler - Twice daily (8 AM, 8 PM)
  - Aspirin 81mg - Once daily (8 AM)
- **Best for testing**: Inhalers, as-needed medications, multiple forms

## 🧪 Testing Scenarios

### Test Voice Reminders
1. Load demo data (John Anderson recommended)
2. Go to **Prescription Voice** page
3. Enter medication name: "Metformin"
4. Click **Check & Speak**
5. Listen to voice output with CDS results

### Test Medication Tracking
1. Go to **Dashboard**
2. See today's medication schedule
3. Mark medications as taken/missed
4. View adherence statistics

### Test Disease Management
1. Go to **Chronic Diseases** page
2. View disease profiles with guidelines
3. See linked medications
4. Check upcoming appointments

### Test Prescription Analysis
1. Go to **Prescriptions** page
2. View uploaded prescription documents
3. See parsed medication information
4. Check linked disease profiles

## 💡 Tips

- **Elderly Mode**: Toggle in Settings to see larger text and buttons
- **Voice Settings**: Adjust speed, pitch, and volume in Prescription Voice page
- **Notifications**: Enable in Settings to test reminder system
- **Multiple Users**: Switch between users to test different scenarios

## 🔧 Programmatic Access

### In Your Code

```typescript
import { DemoDataService } from '@/services/demo-data-service';

// Initialize specific user
DemoDataService.initializeDemoData('user-2'); // Sarah Mitchell

// Check if demo data is loaded
const isLoaded = DemoDataService.isDemoDataLoaded();

// Get available demo users
const users = DemoDataService.getAvailableDemoUsers();

// Clear all demo data
DemoDataService.clearDemoData();
```

### Access Demo Data Directly

```typescript
import { 
  demoUsers, 
  demoMedicines, 
  demoDiseaseProfiles,
  getDemoDataForUser,
  getAllDemoData 
} from '@/data/demo-database';

// Get all data for a user
const userData = getDemoDataForUser('user-1');

// Get all demo data
const allData = getAllDemoData();
```

## 🎨 UI Components

### Demo Data Manager Component
Already added to Settings page. You can also add it to other pages:

```typescript
import { DemoDataManager } from '@/components/demo/DemoDataManager';

function MyPage() {
  return (
    <div>
      <DemoDataManager />
    </div>
  );
}
```

## 📝 Data Persistence

- Demo data is stored in Zustand store with persistence
- Data persists across page refreshes
- Clearing browser storage will remove demo data
- Auto-initialization runs on first app load

## 🐛 Troubleshooting

### Demo data not loading?
1. Check browser console for errors
2. Clear browser storage and refresh
3. Manually initialize from Settings page

### Can't switch users?
1. Make sure you're on Settings page
2. Select different user from dropdown
3. Click "Switch to Selected User" button

### Data looks wrong?
1. Clear demo data from Settings
2. Reinitialize with desired user
3. Check console logs for initialization messages

## 📚 Learn More

- See `DEMO_DATABASE.md` for complete documentation
- Check `src/data/demo-database.ts` for data structure
- Review `src/services/demo-data-service.ts` for API methods

## 🎉 Ready to Test!

Your demo database is ready to use. Start exploring MedReminder Pro with realistic patient data!
