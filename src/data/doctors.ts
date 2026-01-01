import type { Doctor } from '@/types/appointment';

export const doctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Johnson',
    specialty: 'General Physician',
    qualifications: 'MBBS, MD',
    experience: 12,
    rating: 4.8,
    reviewCount: 245,
    bio: 'Experienced general physician specializing in chronic disease management and preventive care. Passionate about helping elderly patients manage their medications effectively.',
    languages: ['English', 'Spanish'],
    consultationFee: 50,
    platform: 'practo',
    platformUrl: 'https://www.practo.com',
    phone: '+1-555-0101',
    email: 'dr.sarah.johnson@example.com',
    clinicAddress: '123 Medical Plaza, New York, NY 10001',
    availability: [
      {
        dayOfWeek: 1, // Monday
        slots: [
          { start: '09:00', end: '09:30', available: true },
          { start: '09:30', end: '10:00', available: true },
          { start: '10:00', end: '10:30', available: false },
          { start: '14:00', end: '14:30', available: true },
          { start: '14:30', end: '15:00', available: true },
        ],
      },
      {
        dayOfWeek: 3, // Wednesday
        slots: [
          { start: '10:00', end: '10:30', available: true },
          { start: '10:30', end: '11:00', available: true },
          { start: '15:00', end: '15:30', available: true },
        ],
      },
      {
        dayOfWeek: 5, // Friday
        slots: [
          { start: '09:00', end: '09:30', available: true },
          { start: '11:00', end: '11:30', available: true },
          { start: '16:00', end: '16:30', available: true },
        ],
      },
    ],
  },
  {
    id: 'doc-2',
    name: 'Dr. Michael Chen',
    specialty: 'Cardiologist',
    qualifications: 'MBBS, MD, DM (Cardiology)',
    experience: 15,
    rating: 4.9,
    reviewCount: 312,
    bio: 'Board-certified cardiologist with expertise in heart disease management, hypertension, and cardiac medication optimization.',
    languages: ['English', 'Mandarin'],
    consultationFee: 75,
    platform: 'medibuddy',
    platformUrl: 'https://www.medibuddy.in',
    phone: '+1-555-0202',
    email: 'dr.michael.chen@example.com',
    clinicAddress: '456 Heart Center, Los Angeles, CA 90001',
    availability: [
      {
        dayOfWeek: 2, // Tuesday
        slots: [
          { start: '10:00', end: '10:30', available: true },
          { start: '10:30', end: '11:00', available: true },
          { start: '11:00', end: '11:30', available: false },
        ],
      },
      {
        dayOfWeek: 4, // Thursday
        slots: [
          { start: '14:00', end: '14:30', available: true },
          { start: '14:30', end: '15:00', available: true },
          { start: '15:00', end: '15:30', available: true },
        ],
      },
    ],
  },
  {
    id: 'doc-3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Endocrinologist',
    qualifications: 'MBBS, MD, DM (Endocrinology)',
    experience: 10,
    rating: 4.7,
    reviewCount: 189,
    bio: 'Specialist in diabetes management, thyroid disorders, and metabolic conditions. Focused on medication adherence and lifestyle modifications.',
    languages: ['English', 'Spanish', 'Portuguese'],
    consultationFee: 65,
    platform: 'docindia',
    platformUrl: 'https://www.docindia.com',
    phone: '+1-555-0303',
    email: 'dr.emily.rodriguez@example.com',
    clinicAddress: '789 Wellness Ave, Miami, FL 33101',
    availability: [
      {
        dayOfWeek: 1, // Monday
        slots: [
          { start: '11:00', end: '11:30', available: true },
          { start: '11:30', end: '12:00', available: true },
          { start: '15:00', end: '15:30', available: true },
        ],
      },
      {
        dayOfWeek: 3, // Wednesday
        slots: [
          { start: '09:00', end: '09:30', available: true },
          { start: '13:00', end: '13:30', available: true },
          { start: '16:00', end: '16:30', available: true },
        ],
      },
      {
        dayOfWeek: 5, // Friday
        slots: [
          { start: '10:00', end: '10:30', available: true },
          { start: '14:00', end: '14:30', available: true },
        ],
      },
    ],
  },
  {
    id: 'doc-4',
    name: 'Dr. James Wilson',
    specialty: 'Geriatrician',
    qualifications: 'MBBS, MD (Geriatrics)',
    experience: 18,
    rating: 4.9,
    reviewCount: 428,
    bio: 'Specialized in elderly care with focus on polypharmacy management, fall prevention, and age-related health concerns.',
    languages: ['English'],
    consultationFee: 60,
    platform: 'practo',
    platformUrl: 'https://www.practo.com',
    phone: '+1-555-0404',
    email: 'dr.james.wilson@example.com',
    clinicAddress: '321 Senior Care Blvd, Chicago, IL 60601',
    availability: [
      {
        dayOfWeek: 2, // Tuesday
        slots: [
          { start: '09:00', end: '09:30', available: true },
          { start: '09:30', end: '10:00', available: true },
          { start: '14:00', end: '14:30', available: true },
        ],
      },
      {
        dayOfWeek: 4, // Thursday
        slots: [
          { start: '10:00', end: '10:30', available: true },
          { start: '10:30', end: '11:00', available: true },
          { start: '15:00', end: '15:30', available: true },
        ],
      },
    ],
  },
  {
    id: 'doc-5',
    name: 'Dr. Priya Patel',
    specialty: 'Psychiatrist',
    qualifications: 'MBBS, MD (Psychiatry)',
    experience: 8,
    rating: 4.6,
    reviewCount: 156,
    bio: 'Mental health specialist focusing on anxiety, depression, and medication management for psychiatric conditions.',
    languages: ['English', 'Hindi', 'Gujarati'],
    consultationFee: 70,
    platform: 'medibuddy',
    platformUrl: 'https://www.medibuddy.in',
    phone: '+1-555-0505',
    email: 'dr.priya.patel@example.com',
    clinicAddress: '555 Mental Health Center, Houston, TX 77001',
    availability: [
      {
        dayOfWeek: 1, // Monday
        slots: [
          { start: '13:00', end: '13:30', available: true },
          { start: '13:30', end: '14:00', available: true },
          { start: '16:00', end: '16:30', available: true },
        ],
      },
      {
        dayOfWeek: 3, // Wednesday
        slots: [
          { start: '11:00', end: '11:30', available: true },
          { start: '14:00', end: '14:30', available: true },
        ],
      },
      {
        dayOfWeek: 5, // Friday
        slots: [
          { start: '13:00', end: '13:30', available: true },
          { start: '15:00', end: '15:30', available: true },
        ],
      },
    ],
  },
];
