export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualifications: string;
  experience: number; // years
  rating: number; // 0-5
  reviewCount: number;
  avatar?: string;
  bio: string;
  languages: string[];
  consultationFee: number;
  availability: DoctorAvailability[];
  platform?: 'practo' | 'medibuddy' | 'docindia' | 'local';
  platformUrl?: string; // External booking URL
  phone?: string;
  email?: string;
  clinicAddress?: string;
}

export interface DoctorAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  slots: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctor: Doctor;
  scheduledDate: string; // ISO date
  scheduledTime: string; // HH:MM
  duration: number; // minutes
  reason: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  meetingUrl?: string;
  notes?: string;
  createdAt: string;
  isInstant?: boolean; // For instant consultations
  linkSentToDoctor?: boolean; // Track if meeting link was shared
}

export interface AppointmentBooking {
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  symptoms?: string;
}
