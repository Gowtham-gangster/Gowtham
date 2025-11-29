# MedReminder Pro - Demo Database Documentation

## Overview

The demo database provides realistic medical data for testing and demonstrating the MedReminder Pro application. It includes three complete patient profiles with medications, chronic diseases, prescriptions, and appointments.

## Demo Users

### User 1: John Anderson
- **Age**: 65 years
- **Email**: john.anderson@example.com
- **Conditions**: Type 2 Diabetes, Hypertension, Coronary Artery Disease
- **Medications**: 
  - Metformin 500mg (twice daily)
  - Lisinopril 10mg (once daily)
  - Atorvastatin 20mg (once daily at bedtime)

### User 2: Sarah Mitchell
- **Age**: 58 years
- **Email**: sarah.mitchell@example.com
- **Conditions**: Hypothyroidism, Hypertension
- **Medications**:
  - Levothyroxine 75mcg (once daily before breakfast)
  - Amlodipine 5mg (once daily)

### User 3: Robert Chen
- **Age**: 72 years
- **Email**: robert.chen@example.com
- **Conditions**: Asthma, Coronary Artery Disease
- **Medications**:
  - Albuterol 90mcg inhaler (as needed)
  - Fluticasone 250mcg inhaler (twice daily)
  - Aspirin 81mg (once daily)

## Data Structure

### Medicines
Each medicine includes:
- Name, form (tablet, capsule, inhaler, etc.)
- Strength and dosage
- Frequency schedule with specific times
- Instructions and side effects
- Prescribing doctor
- Refills remaining

### Disease Profiles
Each disease profile includes:
- Disease name and diagnosis date
- Severity level (mild, moderate, severe)
- Current symptoms
- Associated medications
- Doctor information
- Guidelines and precautions
- Checkup schedule

### Prescriptions
- Uploaded prescription documents
- Parsed medication information
- Linked disease profiles
- Analysis status

### Appointments
- Scheduled doctor visits
- Specialty and location
- Appointment reason
- Preparation notes

### Medication History
- Tracking of taken/missed medications
- Scheduled vs actual times
- Notes for each dose

## Usage

### Initializing Demo Data

```typescript
import { DemoDataService } from '@/services/demo-data-service';

// Initialize with default user (John Anderson)
DemoDataService.initializeDemoData();

// Initialize with specific user
DemoDataService.initializeDemoData('user-2'); // Sarah Mitchell
```

### Switching Users

```typescript
// Switch to different demo user
DemoDataService.switchDemoUser('user-3'); // Robert Chen
```

### Clearing Demo Data

```typescript
// Remove all demo data from store
DemoDataService.clearDemoData();
```

### Using the Demo Data Manager Component

Add the component to any page:

```typescript
import { DemoDataManager } from '@/components/demo/DemoDataManager';

function SettingsPage() {
  return (
    <div>
      <DemoDataManager />
    </div>
  );
}
```

### Auto-Initialize on App Start

In your main App component:

```typescript
import { autoInitializeDemoData } from '@/services/demo-data-service';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    autoInitializeDemoData();
  }, []);
  
  return <YourApp />;
}
```

## Medication-Disease Mapping

The demo database includes a comprehensive medication-to-disease mapping for CDS (Clinical Decision Support):

```typescript
import { medicationDiseaseMap } from '@/data/demo-database';

// Example: Check what diseases Metformin treats
const metforminDiseases = medicationDiseaseMap['metformin'];
// Returns: [{ diseaseId: 'diabetes', likelihood: 0.95, class: 'Biguanide' }]
```

### Supported Medication Classes

- **Diabetes**: Biguanides, Insulin, Sulfonylureas
- **Hypertension**: ACE Inhibitors, ARBs, Calcium Channel Blockers, Diuretics
- **Asthma/COPD**: Bronchodilators, Corticosteroids
- **Heart Disease**: Statins, Antiplatelets
- **Thyroid**: Thyroid Hormones

## Helper Functions

### Get Data for Specific User

```typescript
import { getDemoDataForUser } from '@/data/demo-database';

const userData = getDemoDataForUser('user-1');
// Returns: { user, medicines, diseases, prescriptions, appointments, history }
```

### Get All Demo Data

```typescript
import { getAllDemoData } from '@/data/demo-database';

const allData = getAllDemoData();
// Returns: { users, medicines, diseases, prescriptions, appointments, history, medicationDiseaseMap }
```

### Check if Demo Data is Loaded

```typescript
import { DemoDataService } from '@/services/demo-data-service';

const isLoaded = DemoDataService.isDemoDataLoaded();
```

## Testing Scenarios

### Scenario 1: Elderly Patient with Multiple Conditions
**User**: John Anderson (65 years)
- Test medication reminders for multiple daily doses
- Test disease management for diabetes, hypertension, and heart disease
- Test prescription analysis with multiple medications
- Test voice features with elderly mode

### Scenario 2: Middle-Aged Patient with Thyroid Issues
**User**: Sarah Mitchell (58 years)
- Test early morning medication reminders (Levothyroxine)
- Test medication timing constraints (empty stomach)
- Test dual condition management

### Scenario 3: Senior with Respiratory Issues
**User**: Robert Chen (72 years)
- Test as-needed medication tracking (Albuterol)
- Test inhaler usage instructions
- Test multiple medication forms (tablets and inhalers)

## Data Integrity

All demo data includes:
- ✅ Realistic medical information
- ✅ Proper medication dosages
- ✅ Accurate disease-medication relationships
- ✅ Valid frequency schedules
- ✅ Complete timestamps
- ✅ Cross-referenced IDs

## Extending Demo Data

To add new demo users or medications:

1. Add user to `demoUsers` array in `src/data/demo-database.ts`
2. Add medicines to `demoMedicines` array with matching `userId`
3. Add disease profiles to `demoDiseaseProfiles` array
4. Update medication-disease mappings if needed
5. Add prescriptions and appointments as needed

Example:

```typescript
export const demoUsers: User[] = [
  // ... existing users
  {
    id: 'user-4',
    name: 'New Patient',
    email: 'new.patient@example.com',
    age: 50,
    // ... other fields
  }
];
```

## Notes

- All demo data is stored in memory and will be cleared on page refresh unless persisted
- Demo data does not make actual API calls
- Prescription file URLs are placeholders
- Emergency contacts are fictional
- Doctor information is for demonstration only

## Security

⚠️ **Important**: Demo data should only be used in development and testing environments. Never use demo data in production or with real patient information.

## Support

For questions or issues with demo data:
1. Check the console logs for initialization messages
2. Verify user IDs match between related data
3. Ensure Zustand store methods are available
4. Check that all required types are imported

## Future Enhancements

Planned improvements to demo database:
- [ ] More diverse patient profiles
- [ ] Additional medication types
- [ ] More complex disease interactions
- [ ] Historical data spanning multiple months
- [ ] Medication adherence patterns
- [ ] Lab results and vital signs
- [ ] Insurance and pharmacy information
