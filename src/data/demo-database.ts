/**
 * Demo Database for MedReminder Pro
 * Contains realistic medical data for testing and demonstration
 */

import { Medicine, MedicineForm, FrequencyType } from '@/types/medicine';
import { DiseaseProfile } from '@/types/disease';
import { User } from '@/types/user';

// Demo Users
export const demoUsers: User[] = [
  {
    id: 'user-1',
    name: 'John Anderson',
    email: 'john.anderson@example.com',
    age: 65,
    phone: '+1-555-0101',
    address: '123 Main St, Springfield, IL 62701',
    emergencyContact: {
      name: 'Mary Anderson',
      phone: '+1-555-0102',
      relationship: 'Spouse'
    },
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'user-2',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@example.com',
    age: 58,
    phone: '+1-555-0201',
    address: '456 Oak Ave, Portland, OR 97201',
    emergencyContact: {
      name: 'David Mitchell',
      phone: '+1-555-0202',
      relationship: 'Husband'
    },
    createdAt: '2024-02-20T14:30:00Z'
  },
  {
    id: 'user-3',
    name: 'Robert Chen',
    email: 'robert.chen@example.com',
    age: 72,
    phone: '+1-555-0301',
    address: '789 Pine Rd, Seattle, WA 98101',
    emergencyContact: {
      name: 'Lisa Chen',
      phone: '+1-555-0302',
      relationship: 'Daughter'
    },
    createdAt: '2024-03-10T09:15:00Z'
  }
];

// Demo Medicines
export const demoMedicines: Medicine[] = [
  {
    id: 'med-1',
    userId: 'user-1',
    name: 'Metformin',
    form: 'tablet' as MedicineForm,
    strength: '500mg',
    frequency: {
      type: 'DAILY' as FrequencyType,
      timesPerDay: 2,
      specificTimes: ['08:00', '20:00']
    },
    instructions: 'Take with meals',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    prescribedBy: 'Dr. Emily Roberts',
    refillsRemaining: 3,
    quantity: 60,
    sideEffects: ['Nausea', 'Diarrhea', 'Stomach upset'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'med-2',
    userId: 'user-1',
    name: 'Lisinopril',
    form: 'tablet' as MedicineForm,
    strength: '10mg',
    frequency: {
      type: 'DAILY' as FrequencyType,
      timesPerDay: 1,
      specificTimes: ['08:00']
    },
    instructions: 'Take in the morning',
    startDate: '2024-01-15',
    prescribedBy: 'Dr. Emily Roberts',
    refillsRemaining: 5,
    quantity: 30,
    sideEffects: ['Dizziness', 'Dry cough', 'Headache'],
    createdAt: '2024-01-15T10:35:00Z',
    updatedAt: '2024-01-15T10:35:00Z'
  },
  {
    id: 'med-3',
    userId: 'user-1',
    name: 'Atorvastatin',
    form: 'tablet' as MedicineForm,
    strength: '20mg',
    frequency: {
      type: 'DAILY' as FrequencyType,
      timesPerDay: 1,
      specificTimes: ['21:00']
    },
    instructions: 'Take at bedtime',
    startDate: '2024-02-01',
    prescribedBy: 'Dr. Emily Roberts',
    refillsRemaining: 4,
    quantity: 30,
    sideEffects: ['Muscle pain', 'Fatigue'],
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-02-01T11:00:00Z'
  },
  {
    id: 'med-4',
    userId: 'user-2',
    name: 'Levothyroxine',
    form: 'tablet' as MedicineForm,
    strength: '75mcg',
    frequency: {
      type: 'DAILY' as FrequencyType,
      timesPerDay: 1,
      specificTimes: ['07:00']
    },
    instructions: 'Take on empty stomach, 30 minutes before breakfast',
    startDate: '2024-02-20',
    prescribedBy: 'Dr. Michael Chang',
    refillsRemaining: 6,
    quantity: 30,
    sideEffects: ['Palpitations', 'Insomnia'],
    createdAt: '2024-02-20T15:00:00Z',
    updatedAt: '2024-02-20T15:00:00Z'
  },
  {
    id: 'med-5',
    userId: 'user-2',
    name: 'Amlodipine',
    form: 'tablet' as MedicineForm,
    strength: '5mg',
    frequency: {
      type: 'DAILY' as FrequencyType,
      timesPerDay: 1,
      specificTimes: ['08:00']
    },
    instructions: 'Take with or without food',
    startDate: '2024-02-20',
    prescribedBy: 'Dr. Michael Chang',
    refillsRemaining: 5,
    quantity: 30,
    sideEffects: ['Swelling of ankles', 'Flushing'],
    createdAt: '2024-02-20T15:10:00Z',
    updatedAt: '2024-02-20T15:10:00Z'
  },
  {
    id: 'med-6',
    userId: 'user-3',
    name: 'Albuterol',
    form: 'inhaler' as MedicineForm,
    strength: '90mcg',
    frequency: {
      type: 'AS_NEEDED' as FrequencyType,
      instructions: 'Use as needed for breathing difficulty'
    },
    instructions: 'Shake well before use. 2 puffs every 4-6 hours as needed',
    startDate: '2024-03-10',
    prescribedBy: 'Dr. Jennifer Lee',
    refillsRemaining: 2,
    quantity: 1,
    sideEffects: ['Tremor', 'Nervousness', 'Rapid heartbeat'],
    createdAt: '2024-03-10T09:30:00Z',
    updatedAt: '2024-03-10T09:30:00Z'
  },
  {
    id: 'med-7',
    userId: 'user-3',
    name: 'Fluticasone',
    form: 'inhaler' as MedicineForm,
    strength: '250mcg',
    frequency: {
      type: 'DAILY' as FrequencyType,
      timesPerDay: 2,
      specificTimes: ['08:00', '20:00']
    },
    instructions: 'Rinse mouth after use',
    startDate: '2024-03-10',
    prescribedBy: 'Dr. Jennifer Lee',
    refillsRemaining: 3,
    quantity: 1,
    sideEffects: ['Hoarseness', 'Throat irritation'],
    createdAt: '2024-03-10T09:35:00Z',
    updatedAt: '2024-03-10T09:35:00Z'
  },
  {
    id: 'med-8',
    userId: 'user-3',
    name: 'Aspirin',
    form: 'tablet' as MedicineForm,
    strength: '81mg',
    frequency: {
      type: 'DAILY' as FrequencyType,
      timesPerDay: 1,
      specificTimes: ['08:00']
    },
    instructions: 'Take with food',
    startDate: '2024-03-10',
    prescribedBy: 'Dr. Jennifer Lee',
    refillsRemaining: 6,
    quantity: 90,
    sideEffects: ['Stomach upset', 'Easy bruising'],
    createdAt: '2024-03-10T09:40:00Z',
    updatedAt: '2024-03-10T09:40:00Z'
  }
];

// Demo Disease Profiles
export const demoDiseaseProfiles: DiseaseProfile[] = [
  {
    id: 'disease-1',
    userId: 'user-1',
    diseaseId: 'diabetes',
    diseaseName: 'Type 2 Diabetes',
    diagnosisDate: '2020-05-15',
    severity: 'moderate',
    status: 'active',
    symptoms: [
      'Increased thirst',
      'Frequent urination',
      'Fatigue',
      'Blurred vision'
    ],
    medications: ['med-1'], // Metformin
    lastCheckup: '2024-01-10',
    nextCheckup: '2024-04-10',
    doctorName: 'Dr. Emily Roberts',
    doctorContact: '+1-555-1001',
    notes: 'Patient managing well with medication and diet. HbA1c at 6.8%',
    guidelines: [
      'Monitor blood glucose daily',
      'Follow diabetic diet plan',
      'Exercise 30 minutes daily',
      'Regular foot care',
      'Annual eye examination'
    ],
    precautions: [
      'Avoid high sugar foods',
      'Check feet daily for cuts or sores',
      'Carry glucose tablets for hypoglycemia',
      'Stay hydrated'
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'disease-2',
    userId: 'user-1',
    diseaseId: 'hypertension',
    diseaseName: 'Hypertension',
    diagnosisDate: '2019-03-20',
    severity: 'moderate',
    status: 'active',
    symptoms: [
      'Occasional headaches',
      'Dizziness'
    ],
    medications: ['med-2'], // Lisinopril
    lastCheckup: '2024-01-10',
    nextCheckup: '2024-04-10',
    doctorName: 'Dr. Emily Roberts',
    doctorContact: '+1-555-1001',
    notes: 'Blood pressure controlled at 130/80. Continue current medication.',
    guidelines: [
      'Monitor blood pressure twice daily',
      'Reduce sodium intake',
      'Maintain healthy weight',
      'Regular exercise',
      'Limit alcohol consumption'
    ],
    precautions: [
      'Avoid excessive salt',
      'Manage stress levels',
      'No smoking',
      'Limit caffeine intake'
    ],
    createdAt: '2024-01-15T10:05:00Z',
    updatedAt: '2024-01-15T10:05:00Z'
  },
  {
    id: 'disease-3',
    userId: 'user-1',
    diseaseId: 'heart-disease',
    diseaseName: 'Coronary Artery Disease',
    diagnosisDate: '2021-08-10',
    severity: 'moderate',
    status: 'active',
    symptoms: [
      'Chest discomfort',
      'Shortness of breath',
      'Fatigue'
    ],
    medications: ['med-3'], // Atorvastatin
    lastCheckup: '2024-02-01',
    nextCheckup: '2024-05-01',
    doctorName: 'Dr. Emily Roberts',
    doctorContact: '+1-555-1001',
    notes: 'Cholesterol levels improving. LDL at 95 mg/dL.',
    guidelines: [
      'Heart-healthy diet',
      'Regular cardiac exercise',
      'Stress management',
      'Regular cholesterol monitoring',
      'Maintain healthy weight'
    ],
    precautions: [
      'Avoid high-fat foods',
      'No strenuous activity without approval',
      'Recognize warning signs of heart attack',
      'Keep nitroglycerin accessible'
    ],
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-02-01T11:00:00Z'
  },
  {
    id: 'disease-4',
    userId: 'user-2',
    diseaseId: 'thyroid-disorders',
    diseaseName: 'Hypothyroidism',
    diagnosisDate: '2018-11-05',
    severity: 'mild',
    status: 'active',
    symptoms: [
      'Fatigue',
      'Weight gain',
      'Cold sensitivity',
      'Dry skin'
    ],
    medications: ['med-4'], // Levothyroxine
    lastCheckup: '2024-02-15',
    nextCheckup: '2024-08-15',
    doctorName: 'Dr. Michael Chang',
    doctorContact: '+1-555-2001',
    notes: 'TSH levels normal at 2.5. Continue current dosage.',
    guidelines: [
      'Take medication consistently',
      'Regular thyroid function tests',
      'Maintain balanced diet',
      'Adequate iodine intake',
      'Regular exercise'
    ],
    precautions: [
      'Take medication on empty stomach',
      'Avoid soy products near medication time',
      'Monitor for symptoms changes',
      'Inform doctor of any new medications'
    ],
    createdAt: '2024-02-20T15:00:00Z',
    updatedAt: '2024-02-20T15:00:00Z'
  },
  {
    id: 'disease-5',
    userId: 'user-2',
    diseaseId: 'hypertension',
    diseaseName: 'Hypertension',
    diagnosisDate: '2020-06-12',
    severity: 'mild',
    status: 'active',
    symptoms: [
      'Occasional headaches'
    ],
    medications: ['med-5'], // Amlodipine
    lastCheckup: '2024-02-15',
    nextCheckup: '2024-05-15',
    doctorName: 'Dr. Michael Chang',
    doctorContact: '+1-555-2001',
    notes: 'Blood pressure well controlled at 125/78.',
    guidelines: [
      'Monitor blood pressure daily',
      'Low sodium diet',
      'Regular exercise',
      'Stress management',
      'Maintain healthy weight'
    ],
    precautions: [
      'Limit salt intake',
      'Avoid processed foods',
      'No smoking',
      'Moderate alcohol consumption'
    ],
    createdAt: '2024-02-20T15:10:00Z',
    updatedAt: '2024-02-20T15:10:00Z'
  },
  {
    id: 'disease-6',
    userId: 'user-3',
    diseaseId: 'asthma',
    diseaseName: 'Asthma',
    diagnosisDate: '2015-04-20',
    severity: 'moderate',
    status: 'active',
    symptoms: [
      'Wheezing',
      'Shortness of breath',
      'Chest tightness',
      'Coughing'
    ],
    medications: ['med-6', 'med-7'], // Albuterol, Fluticasone
    lastCheckup: '2024-03-05',
    nextCheckup: '2024-06-05',
    doctorName: 'Dr. Jennifer Lee',
    doctorContact: '+1-555-3001',
    notes: 'Asthma well controlled with current regimen. Peak flow at 85% of personal best.',
    guidelines: [
      'Use controller inhaler daily',
      'Keep rescue inhaler accessible',
      'Avoid triggers',
      'Monitor peak flow',
      'Regular breathing exercises'
    ],
    precautions: [
      'Avoid smoke and pollution',
      'Stay away from allergens',
      'Use air purifier at home',
      'Get flu vaccine annually',
      'Recognize early warning signs'
    ],
    createdAt: '2024-03-10T09:30:00Z',
    updatedAt: '2024-03-10T09:30:00Z'
  },
  {
    id: 'disease-7',
    userId: 'user-3',
    diseaseId: 'heart-disease',
    diseaseName: 'Coronary Artery Disease',
    diagnosisDate: '2019-09-15',
    severity: 'moderate',
    status: 'active',
    symptoms: [
      'Chest pain',
      'Shortness of breath',
      'Fatigue'
    ],
    medications: ['med-8'], // Aspirin
    lastCheckup: '2024-03-05',
    nextCheckup: '2024-06-05',
    doctorName: 'Dr. Jennifer Lee',
    doctorContact: '+1-555-3001',
    notes: 'Patient stable. Continue aspirin therapy and lifestyle modifications.',
    guidelines: [
      'Heart-healthy diet',
      'Regular moderate exercise',
      'Stress reduction',
      'Regular cardiac monitoring',
      'Maintain healthy weight'
    ],
    precautions: [
      'Avoid high-cholesterol foods',
      'No heavy lifting',
      'Recognize heart attack symptoms',
      'Keep emergency contacts handy',
      'Avoid extreme temperatures'
    ],
    createdAt: '2024-03-10T09:40:00Z',
    updatedAt: '2024-03-10T09:40:00Z'
  }
];

// Demo Medication History
export const demoMedicationHistory = [
  {
    id: 'hist-1',
    userId: 'user-1',
    medicineId: 'med-1',
    medicineName: 'Metformin',
    action: 'taken',
    scheduledTime: '2024-11-28T08:00:00Z',
    actualTime: '2024-11-28T08:05:00Z',
    notes: 'Taken with breakfast',
    createdAt: '2024-11-28T08:05:00Z'
  },
  {
    id: 'hist-2',
    userId: 'user-1',
    medicineId: 'med-2',
    medicineName: 'Lisinopril',
    action: 'taken',
    scheduledTime: '2024-11-28T08:00:00Z',
    actualTime: '2024-11-28T08:05:00Z',
    notes: 'Taken with water',
    createdAt: '2024-11-28T08:05:00Z'
  },
  {
    id: 'hist-3',
    userId: 'user-1',
    medicineId: 'med-1',
    action: 'taken',
    scheduledTime: '2024-11-27T20:00:00Z',
    actualTime: '2024-11-27T20:10:00Z',
    notes: 'Taken with dinner',
    createdAt: '2024-11-27T20:10:00Z'
  },
  {
    id: 'hist-4',
    userId: 'user-2',
    medicineId: 'med-4',
    medicineName: 'Levothyroxine',
    action: 'taken',
    scheduledTime: '2024-11-28T07:00:00Z',
    actualTime: '2024-11-28T07:00:00Z',
    notes: 'Taken on empty stomach',
    createdAt: '2024-11-28T07:00:00Z'
  },
  {
    id: 'hist-5',
    userId: 'user-3',
    medicineId: 'med-6',
    medicineName: 'Albuterol',
    action: 'taken',
    scheduledTime: '2024-11-28T10:00:00Z',
    actualTime: '2024-11-28T10:00:00Z',
    notes: 'Used for breathing difficulty',
    createdAt: '2024-11-28T10:00:00Z'
  }
];

// Demo Prescriptions
export const demoPrescriptions = [
  {
    id: 'rx-1',
    userId: 'user-1',
    fileName: 'prescription_jan_2024.pdf',
    fileUrl: '/demo/prescriptions/rx1.pdf',
    uploadedAt: '2024-01-15T10:00:00Z',
    parsedMedicines: [
      { name: 'Metformin', strength: '500mg', frequency: 'Twice daily' },
      { name: 'Lisinopril', strength: '10mg', frequency: 'Once daily' }
    ],
    status: 'processed',
    isAnalyzed: true,
    linkedDiseaseProfiles: ['disease-1', 'disease-2']
  },
  {
    id: 'rx-2',
    userId: 'user-1',
    fileName: 'prescription_feb_2024.pdf',
    fileUrl: '/demo/prescriptions/rx2.pdf',
    uploadedAt: '2024-02-01T11:00:00Z',
    parsedMedicines: [
      { name: 'Atorvastatin', strength: '20mg', frequency: 'Once daily at bedtime' }
    ],
    status: 'processed',
    isAnalyzed: true,
    linkedDiseaseProfiles: ['disease-3']
  },
  {
    id: 'rx-3',
    userId: 'user-2',
    fileName: 'prescription_feb_2024.pdf',
    fileUrl: '/demo/prescriptions/rx3.pdf',
    uploadedAt: '2024-02-20T15:00:00Z',
    parsedMedicines: [
      { name: 'Levothyroxine', strength: '75mcg', frequency: 'Once daily before breakfast' },
      { name: 'Amlodipine', strength: '5mg', frequency: 'Once daily' }
    ],
    status: 'processed',
    isAnalyzed: true,
    linkedDiseaseProfiles: ['disease-4', 'disease-5']
  },
  {
    id: 'rx-4',
    userId: 'user-3',
    fileName: 'prescription_mar_2024.pdf',
    fileUrl: '/demo/prescriptions/rx4.pdf',
    uploadedAt: '2024-03-10T09:30:00Z',
    parsedMedicines: [
      { name: 'Albuterol', strength: '90mcg', frequency: 'As needed' },
      { name: 'Fluticasone', strength: '250mcg', frequency: 'Twice daily' },
      { name: 'Aspirin', strength: '81mg', frequency: 'Once daily' }
    ],
    status: 'processed',
    isAnalyzed: true,
    linkedDiseaseProfiles: ['disease-6', 'disease-7']
  }
];

// Demo Appointments
export const demoAppointments = [
  {
    id: 'appt-1',
    userId: 'user-1',
    doctorName: 'Dr. Emily Roberts',
    specialty: 'Endocrinology',
    date: '2024-04-10',
    time: '10:00',
    location: 'Springfield Medical Center, Room 305',
    reason: 'Diabetes follow-up',
    status: 'scheduled',
    notes: 'Bring recent blood glucose logs',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'appt-2',
    userId: 'user-2',
    doctorName: 'Dr. Michael Chang',
    specialty: 'Internal Medicine',
    date: '2024-05-15',
    time: '14:30',
    location: 'Portland Health Clinic, Suite 201',
    reason: 'Thyroid function check',
    status: 'scheduled',
    notes: 'Fasting required for blood work',
    createdAt: '2024-02-20T15:00:00Z'
  },
  {
    id: 'appt-3',
    userId: 'user-3',
    doctorName: 'Dr. Jennifer Lee',
    specialty: 'Pulmonology',
    date: '2024-06-05',
    time: '09:00',
    location: 'Seattle Respiratory Center',
    reason: 'Asthma management review',
    status: 'scheduled',
    notes: 'Bring peak flow meter readings',
    createdAt: '2024-03-10T09:30:00Z'
  }
];

// Demo Medication-Disease Mapping
export const medicationDiseaseMap: Record<string, Array<{ diseaseId: string; likelihood: number; class: string }>> = {
  // Diabetes medications
  metformin: [{ diseaseId: 'diabetes', likelihood: 0.95, class: 'Biguanide' }],
  insulin: [{ diseaseId: 'diabetes', likelihood: 0.98, class: 'Insulin' }],
  glipizide: [{ diseaseId: 'diabetes', likelihood: 0.90, class: 'Sulfonylurea' }],
  glyburide: [{ diseaseId: 'diabetes', likelihood: 0.90, class: 'Sulfonylurea' }],
  
  // Hypertension medications
  lisinopril: [{ diseaseId: 'hypertension', likelihood: 0.90, class: 'ACE Inhibitor' }],
  amlodipine: [{ diseaseId: 'hypertension', likelihood: 0.85, class: 'Calcium Channel Blocker' }],
  losartan: [{ diseaseId: 'hypertension', likelihood: 0.88, class: 'ARB' }],
  hydrochlorothiazide: [{ diseaseId: 'hypertension', likelihood: 0.80, class: 'Diuretic' }],
  
  // Asthma medications
  albuterol: [{ diseaseId: 'asthma', likelihood: 0.95, class: 'Bronchodilator' }],
  fluticasone: [
    { diseaseId: 'asthma', likelihood: 0.80, class: 'Corticosteroid' },
    { diseaseId: 'copd', likelihood: 0.60, class: 'Corticosteroid' }
  ],
  
  // Heart disease medications
  atorvastatin: [{ diseaseId: 'heart-disease', likelihood: 0.85, class: 'Statin' }],
  aspirin: [{ diseaseId: 'heart-disease', likelihood: 0.70, class: 'Antiplatelet' }],
  
  // Thyroid medications
  levothyroxine: [{ diseaseId: 'thyroid-disorders', likelihood: 0.95, class: 'Thyroid Hormone' }]
};

// Helper function to get demo data for a specific user
export function getDemoDataForUser(userId: string) {
  return {
    user: demoUsers.find(u => u.id === userId),
    medicines: demoMedicines.filter(m => m.userId === userId),
    diseases: demoDiseaseProfiles.filter(d => d.userId === userId),
    prescriptions: demoPrescriptions.filter(p => p.userId === userId),
    appointments: demoAppointments.filter(a => a.userId === userId),
    history: demoMedicationHistory.filter(h => h.userId === userId)
  };
}

// Helper function to get all demo data
export function getAllDemoData() {
  return {
    users: demoUsers,
    medicines: demoMedicines,
    diseases: demoDiseaseProfiles,
    prescriptions: demoPrescriptions,
    appointments: demoAppointments,
    history: demoMedicationHistory,
    medicationDiseaseMap
  };
}

// Export default demo user (for quick testing)
export const defaultDemoUser = demoUsers[0];
export const defaultDemoData = getDemoDataForUser(defaultDemoUser.id);
