# Database Services

This directory contains all Supabase database service layers.

## Structure

```
database/
├── auth-service.ts          - Authentication (signup, login, logout)
├── medicines-service.ts     - Medicines CRUD operations
├── schedules-service.ts     - Schedules management
├── dose-logs-service.ts     - Dose tracking
├── disease-profiles-service.ts - Disease management
├── prescriptions-service.ts - Prescription uploads
├── notifications-service.ts - Notifications
├── orders-service.ts        - Orders management
└── caregiver-service.ts     - Caregiver linking
```

## Usage Example

```typescript
import { medicinesService } from '@/services/database/medicines-service';

// Create medicine
const medicine = await medicinesService.create({
  name: 'Metformin',
  strength: '500mg',
  form: 'tablet'
});

// Get all medicines
const medicines = await medicinesService.getAll();

// Update medicine
await medicinesService.update(medicine.id, {
  stock_count: 50
});

// Delete medicine
await medicinesService.delete(medicine.id);
```

## Real-time Subscriptions

```typescript
import { medicinesService } from '@/services/database/medicines-service';

// Subscribe to changes
const subscription = medicinesService.subscribe((payload) => {
  console.log('Medicine changed:', payload);
});

// Unsubscribe
subscription.unsubscribe();
```

## Status

⏳ **Pending**: Waiting for Supabase credentials to complete implementation

Once credentials are provided, all services will be implemented with:
- Full CRUD operations
- Real-time subscriptions
- Error handling
- TypeScript types
- Optimistic updates
