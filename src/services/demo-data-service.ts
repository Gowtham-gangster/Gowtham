/**
 * Demo Data Service
 * Initializes the application with demo data for testing and demonstration
 */

import { useStore } from '@/store/useStore';
import {
  demoUsers,
  demoMedicines,
  demoDiseaseProfiles,
  demoPrescriptions,
  demoAppointments,
  demoMedicationHistory,
  defaultDemoUser,
  getDemoDataForUser
} from '@/data/demo-database';

export class DemoDataService {
  /**
   * Initialize the store with demo data for a specific user
   */
  static initializeDemoData(userId?: string) {
    const targetUserId = userId || defaultDemoUser.id;
    const demoData = getDemoDataForUser(targetUserId);
    
    const store = useStore.getState();
    
    // Set the current user (using login method)
    if (demoData.user) {
      store.login(demoData.user);
    }
    
    // Initialize medicines
    demoData.medicines.forEach(medicine => {
      // Add to store if not already present
      const existingMedicines = store.medicines || [];
      if (!existingMedicines.find(m => m.id === medicine.id)) {
        store.addMedicine(medicine);
      }
    });
    
    // Initialize disease profiles
    demoData.diseases.forEach(disease => {
      const existingDiseases = store.diseaseProfiles || [];
      if (!existingDiseases.find(d => d.id === disease.id)) {
        store.addDiseaseProfile(disease);
      }
    });
    
    // Initialize prescriptions
    demoData.prescriptions.forEach(prescription => {
      const existingPrescriptions = store.prescriptions || [];
      if (!existingPrescriptions.find(p => p.id === prescription.id)) {
        store.addPrescription(prescription as any);
      }
    });
    
    console.log('✅ Demo data initialized successfully');
    console.log(`👤 User: ${demoData.user?.name}`);
    console.log(`💊 Medicines: ${demoData.medicines.length}`);
    console.log(`🏥 Disease Profiles: ${demoData.diseases.length}`);
    console.log(`📋 Prescriptions: ${demoData.prescriptions.length}`);
    console.log(`📅 Appointments: ${demoData.appointments.length}`);
    
    return demoData;
  }
  
  /**
   * Clear all demo data from the store
   */
  static clearDemoData() {
    const store = useStore.getState();
    
    // Use logout to clear all user data
    store.logout();
    
    console.log('🗑️ Demo data cleared');
  }
  
  /**
   * Switch to a different demo user
   */
  static switchDemoUser(userId: string) {
    this.clearDemoData();
    return this.initializeDemoData(userId);
  }
  
  /**
   * Get all available demo users
   */
  static getAvailableDemoUsers() {
    return demoUsers;
  }
  
  /**
   * Check if demo data is currently loaded
   */
  static isDemoDataLoaded(): boolean {
    const store = useStore.getState();
    const user = store.user;
    
    if (!user) return false;
    
    // Check if current user is a demo user
    return demoUsers.some(demoUser => demoUser.id === user.id);
  }
  
  /**
   * Get demo medication history
   */
  static getDemoMedicationHistory(userId?: string) {
    const targetUserId = userId || useStore.getState().user?.id;
    if (!targetUserId) return [];
    
    return demoMedicationHistory.filter(h => h.userId === targetUserId);
  }
  
  /**
   * Get demo prescriptions
   */
  static getDemoPrescriptions(userId?: string) {
    const targetUserId = userId || useStore.getState().user?.id;
    if (!targetUserId) return [];
    
    return demoPrescriptions.filter(p => p.userId === targetUserId);
  }
  
  /**
   * Get demo appointments
   */
  static getDemoAppointments(userId?: string) {
    const targetUserId = userId || useStore.getState().user?.id;
    if (!targetUserId) return [];
    
    return demoAppointments.filter(a => a.userId === targetUserId);
  }
}

// Auto-initialize demo data on first load if no user is set
export function autoInitializeDemoData() {
  const store = useStore.getState();
  
  if (!store.user) {
    console.log('🚀 Auto-initializing demo data...');
    DemoDataService.initializeDemoData();
  }
}
