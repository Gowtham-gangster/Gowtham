export type UserRole = "PATIENT" | "CAREGIVER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  elderlyMode: boolean;
  timezone: string;
  caregiverInviteCode?: string;
  voiceRemindersEnabled: boolean;
  notificationsEnabled: boolean;
  notificationSettings?: {
    doseReminders: boolean;
    missedDoseAlerts: boolean;
    refillWarnings: boolean;
    orderNotifications: boolean;
    emailEnabled: boolean;
  };
  // Optional user profile fields
  age?: number;
  phone?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt?: string;
}

export type MedicineForm = "tablet" | "capsule" | "liquid" | "injection" | "inhaler" | "other";
export type PillColor = "red" | "blue" | "green" | "yellow" | "purple" | "orange" | "pink" | "teal";

export interface Medicine {
  id: string;
  userId: string;
  name: string;
  nickname?: string;
  strength: string;
  form: MedicineForm;
  colorTag?: PillColor;
  iconKey?: string;
  stockCount?: number;
  refillThreshold?: number;
  instructions?: string;
  createdAt: string;
  updatedAt?: string;
  // Optional medicine metadata fields
  frequency?: {
    type: FrequencyType;
    timesPerDay?: number;
    specificTimes?: string[];
    interval?: number;
    instructions?: string;
  };
  startDate?: string;
  endDate?: string;
  prescribedBy?: string;
  refillsRemaining?: number;
  quantity?: number;
  sideEffects?: string[];
}

export type FrequencyType = "DAILY" | "WEEKDAYS" | "CUSTOM_DAYS" | "EVERY_X_DAYS" | "EVERY_X_HOURS" | "AS_NEEDED";

export interface Schedule {
  id: string;
  medicineId: string;
  frequencyType: FrequencyType;
  timesOfDay: string[];
  daysOfWeek?: number[];
  intervalDays?: number;
  intervalHours?: number;
  startDate: string;
  endDate?: string;
  dosageAmount: number;
  dosageUnit: string;
  maxDosePerDay?: number;
  maxDosePerIntake?: number;
}

export type DoseStatus = "PENDING" | "TAKEN" | "MISSED" | "SKIPPED";

export interface DoseLog {
  id: string;
  odcUserId: string;
  medicineId: string;
  scheduledTime: string;
  takenTime?: string;
  status: DoseStatus;
  notes?: string;
}

export type NotificationType = "DOSE_DUE" | "MISSED_DOSE" | "REFILL_WARNING" | "CAREGIVER_ALERT";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  medicineId?: string;
  createdAt: string;
  read: boolean;
}

export interface CaregiverLink {
  id: string;
  caregiverId: string;
  patientId: string;
  patientName: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  userId: string;
  fileName: string;
  uploadedAt: string;
  parsedMedicines: ParsedMedicine[];
  status: "pending" | "processed" | "error";
  
  // NEW FIELDS for prescription analysis
  analysisResult?: any; // AnalysisResult type
  linkedDiseaseProfiles?: string[]; // Profile IDs
  isAnalyzed?: boolean;
}

export interface ParsedMedicine {
  name: string;
  strength: string;
  frequency: string;
  instructions?: string;
  confirmed: boolean;
}

export interface ScheduledDose {
  id: string;
  medicine: Medicine;
  schedule: Schedule;
  scheduledTime: string;
  status: DoseStatus;
  doseLogId?: string;
}

export interface OrderItem {
  id: string;
  medicineId?: string;
  name: string;
  strength?: string;
  quantity: number;
  unit?: string;
}

export interface OrderVendor {
  name: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface OrderDelivery {
  expectedDate?: string;
  deliveredDate?: string;
  address?: string;
  status: "pending" | "shipped" | "delivered" | "cancelled";
}

export interface Order {
  id: string;
  userId: string;
  vendor: OrderVendor;
  items: OrderItem[];
  createdAt: string;
  notes?: string;
  delivery: OrderDelivery;
}
