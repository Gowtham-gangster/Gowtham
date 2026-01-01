import type { Appointment, AppointmentBooking, Doctor } from '@/types/appointment';
import { doctors } from '@/data/doctors';

const APPOINTMENTS_KEY = 'medreminder_appointments';

class AppointmentService {
  /**
   * Get all doctors
   */
  getDoctors(): Doctor[] {
    return doctors;
  }

  /**
   * Get doctor by ID
   */
  getDoctor(id: string): Doctor | undefined {
    return doctors.find(d => d.id === id);
  }

  /**
   * Search doctors by specialty or name
   */
  searchDoctors(query: string): Doctor[] {
    const lowerQuery = query.toLowerCase();
    return doctors.filter(
      d =>
        d.name.toLowerCase().includes(lowerQuery) ||
        d.specialty.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get all appointments for a user
   */
  getAppointments(userId: string): Appointment[] {
    try {
      const stored = localStorage.getItem(APPOINTMENTS_KEY);
      const all: Appointment[] = stored ? JSON.parse(stored) : [];
      return all.filter(a => a.patientId === userId);
    } catch {
      return [];
    }
  }

  /**
   * Get upcoming appointments
   */
  getUpcomingAppointments(userId: string): Appointment[] {
    const appointments = this.getAppointments(userId);
    const now = new Date();
    return appointments
      .filter(a => {
        const appointmentDate = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
        return appointmentDate > now && a.status !== 'cancelled' && a.status !== 'completed';
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
        const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
        return dateA.getTime() - dateB.getTime();
      });
  }

  /**
   * Book an appointment
   */
  bookAppointment(userId: string, booking: AppointmentBooking): Appointment {
    const doctor = this.getDoctor(booking.doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Generate meeting URL (in production, this would be from a real video service)
    const meetingId = Math.random().toString(36).substring(2, 15);
    const meetingUrl = `https://meet.jit.si/medreminder-${meetingId}`;

    const appointment: Appointment = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      patientId: userId,
      doctorId: booking.doctorId,
      doctor,
      scheduledDate: booking.date,
      scheduledTime: booking.time,
      duration: 30,
      reason: booking.reason,
      status: 'scheduled',
      meetingUrl,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    try {
      const stored = localStorage.getItem(APPOINTMENTS_KEY);
      const all: Appointment[] = stored ? JSON.parse(stored) : [];
      all.push(appointment);
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(all));
    } catch (error) {
      console.error('Failed to save appointment:', error);
      throw new Error('Failed to book appointment');
    }

    return appointment;
  }

  /**
   * Cancel an appointment
   */
  cancelAppointment(appointmentId: string): void {
    try {
      const stored = localStorage.getItem(APPOINTMENTS_KEY);
      const all: Appointment[] = stored ? JSON.parse(stored) : [];
      const updated = all.map(a =>
        a.id === appointmentId ? { ...a, status: 'cancelled' as const } : a
      );
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      throw new Error('Failed to cancel appointment');
    }
  }

  /**
   * Update appointment status
   */
  updateAppointmentStatus(appointmentId: string, status: Appointment['status']): void {
    try {
      const stored = localStorage.getItem(APPOINTMENTS_KEY);
      const all: Appointment[] = stored ? JSON.parse(stored) : [];
      const updated = all.map(a => (a.id === appointmentId ? { ...a, status } : a));
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update appointment:', error);
      throw new Error('Failed to update appointment');
    }
  }

  /**
   * Get appointment by ID
   */
  getAppointment(appointmentId: string): Appointment | undefined {
    try {
      const stored = localStorage.getItem(APPOINTMENTS_KEY);
      const all: Appointment[] = stored ? JSON.parse(stored) : [];
      return all.find(a => a.id === appointmentId);
    } catch {
      return undefined;
    }
  }

  /**
   * Create instant consultation
   */
  createInstantConsultation(userId: string, doctorId: string, reason: string): Appointment {
    const doctor = this.getDoctor(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Generate meeting URL
    const meetingId = Math.random().toString(36).substring(2, 15);
    const meetingUrl = `https://meet.jit.si/medreminder-instant-${meetingId}`;

    const now = new Date();
    const appointment: Appointment = {
      id: `apt-instant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      patientId: userId,
      doctorId,
      doctor,
      scheduledDate: now.toISOString().split('T')[0],
      scheduledTime: now.toTimeString().substring(0, 5),
      duration: 30,
      reason,
      status: 'in-progress',
      meetingUrl,
      isInstant: true,
      linkSentToDoctor: false,
      createdAt: now.toISOString(),
    };

    // Save to localStorage
    try {
      const stored = localStorage.getItem(APPOINTMENTS_KEY);
      const all: Appointment[] = stored ? JSON.parse(stored) : [];
      all.push(appointment);
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(all));
    } catch (error) {
      console.error('Failed to save instant consultation:', error);
      throw new Error('Failed to create instant consultation');
    }

    return appointment;
  }

  /**
   * Share meeting link with doctor
   */
  shareMeetingLink(appointmentId: string): { success: boolean; message: string } {
    try {
      const appointment = this.getAppointment(appointmentId);
      if (!appointment) {
        return { success: false, message: 'Appointment not found' };
      }

      if (!appointment.meetingUrl) {
        return { success: false, message: 'No meeting URL available' };
      }

      // In production, this would send via SMS/Email/WhatsApp
      // For now, we'll copy to clipboard and show instructions
      const doctor = appointment.doctor;
      const message = `
Meeting Link for ${doctor.name}:
${appointment.meetingUrl}

Patient: ${appointment.reason}
Time: ${appointment.scheduledDate} at ${appointment.scheduledTime}

${doctor.phone ? `Doctor's Phone: ${doctor.phone}` : ''}
${doctor.email ? `Doctor's Email: ${doctor.email}` : ''}
      `.trim();

      // Copy to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(message);
      }

      // Mark as sent
      const stored = localStorage.getItem(APPOINTMENTS_KEY);
      const all: Appointment[] = stored ? JSON.parse(stored) : [];
      const updated = all.map(a =>
        a.id === appointmentId ? { ...a, linkSentToDoctor: true } : a
      );
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));

      return {
        success: true,
        message: 'Meeting link copied! Share it with the doctor via phone/email/WhatsApp.',
      };
    } catch (error) {
      console.error('Failed to share meeting link:', error);
      return { success: false, message: 'Failed to share meeting link' };
    }
  }
}

export const appointmentService = new AppointmentService();
