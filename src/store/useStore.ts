import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  Medicine, 
  Schedule, 
  DoseLog, 
  Notification, 
  CaregiverLink,
  Prescription,
  DoseStatus,
  Order
} from '@/types';
import { DiseaseProfile } from '@/types/chronic-disease';
import { initEmail, sendNotificationEmail, sendPrescriptionUploadEmail, sendOrderEmail } from '@/services/email';
import { authService } from '@/services/api/auth-service';
import { medicinesService } from '@/services/api/medicines-service';
import { schedulesService } from '@/services/api/schedules-service';
import { doseLogsService } from '@/services/api/dose-logs-service';
import { diseaseProfilesService } from '@/services/api/disease-profiles-service';
import { prescriptionsService } from '@/services/api/prescriptions-service';
import { ordersService } from '@/services/api/orders-service';
import { notificationsService } from '@/services/api/notifications-service';
import { caregiverService } from '@/services/api/caregiver-service';
import { toast } from 'sonner';

// Initialize EmailJS SDK safely at module load (guarded inside initEmail)
try { initEmail(); } catch (e) { /* ignore init errors during SSR or test env */ }

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // Data
  medicines: Medicine[];
  schedules: Schedule[];
  doseLogs: DoseLog[];
  notifications: Notification[];
  caregiverLinks: CaregiverLink[];
  prescriptions: Prescription[];
  orders: Order[];
  diseaseProfiles: DiseaseProfile[];
  
  // UI State
  elderlyMode: boolean;
  
  // Auth actions
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Medicine actions
  addMedicine: (medicine: Medicine) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  
  // Schedule actions
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (id: string, updates: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  
  // Dose log actions
  addDoseLog: (log: DoseLog) => void;
  updateDoseLog: (id: string, updates: Partial<DoseLog>) => void;
  logDose: (medicineId: string, scheduledTime: string, status: DoseStatus, notes?: string) => void;
  
  // Notification actions
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Caregiver actions
  addCaregiverLink: (link: CaregiverLink) => void;
  removeCaregiverLink: (id: string) => void;
  
  // Prescription actions
  addPrescription: (prescription: Prescription) => void;
  updatePrescription: (id: string, updates: Partial<Prescription>) => void;
  
  // Order actions
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  
  // Disease Profile actions
  addDiseaseProfile: (profile: DiseaseProfile) => void;
  updateDiseaseProfile: (id: string, updates: Partial<DiseaseProfile>) => void;
  deleteDiseaseProfile: (id: string) => void;
  getDiseaseProfile: (id: string) => DiseaseProfile | undefined;
  
  // UI actions
  toggleElderlyMode: () => void;
  
  // Stock management
  decrementStock: (medicineId: string, amount: number) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      medicines: [],
      schedules: [],
      doseLogs: [],
      notifications: [],
      caregiverLinks: [],
      prescriptions: [],
      orders: [],
      diseaseProfiles: [],
      elderlyMode: false,
      
      // Auth actions
      login: async (user) => {
        set({ user, isAuthenticated: true, elderlyMode: user.elderlyMode });
        // Load user data after login
        try {
          const [medicines, schedules, doseLogs, notifications, diseaseProfiles, prescriptions, orders, caregiverLinks] = await Promise.all([
            medicinesService.getAll(),
            schedulesService.getAll(),
            doseLogsService.getAll(),
            notificationsService.getAll(),
            diseaseProfilesService.getAll(),
            prescriptionsService.getAll(),
            ordersService.getAll(),
            caregiverService.getAll()
          ]);
          
          set({
            medicines: medicines.medicines || [],
            schedules: schedules.schedules || [],
            doseLogs: doseLogs.doseLogs || [],
            notifications: notifications.notifications || [],
            diseaseProfiles: diseaseProfiles.profiles || [],
            prescriptions: prescriptions.prescriptions || [],
            orders: orders.orders || [],
            caregiverLinks: [...(caregiverLinks.caregiverLinks || []), ...(caregiverLinks.patientLinks || [])]
          });
        } catch (error) {
          console.error('Failed to load user data:', error);
        }
      },
      logout: async () => {
        try {
          // Revoke token through backend
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        // Clear ALL sessionStorage data
        sessionStorage.clear();
        
        // Clear ALL localStorage data
        localStorage.clear();
        
        // Reset application state
        set({ 
          user: null, 
          isAuthenticated: false,
          medicines: [],
          schedules: [],
          doseLogs: [],
          notifications: [],
          caregiverLinks: [],
          prescriptions: [],
          orders: [],
          diseaseProfiles: [],
          elderlyMode: false
        });
      },
      updateUser: async (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        }));
        // Note: User profile update API endpoint would be needed here
      },
      
      // Medicine actions
      addMedicine: async (medicine) => {
        try {
          const result = await medicinesService.create(medicine);
          set((state) => ({
            medicines: [...state.medicines, result.medicine]
          }));
        } catch (error: any) {
          toast.error(error.message || 'Failed to add medicine');
          throw error;
        }
      },
      updateMedicine: async (id, updates) => {
        try {
          const result = await medicinesService.update(id, updates);
          set((state) => ({
            medicines: state.medicines.map((m) => 
              m.id === id ? result.medicine : m
            )
          }));
        } catch (error: any) {
          toast.error(error.message || 'Failed to update medicine');
          throw error;
        }
      },
      deleteMedicine: async (id) => {
        try {
          await medicinesService.delete(id);
          set((state) => ({
            medicines: state.medicines.filter((m) => m.id !== id),
            schedules: state.schedules.filter((s) => s.medicineId !== id)
          }));
        } catch (error: any) {
          toast.error(error.message || 'Failed to delete medicine');
          throw error;
        }
      },
      
      // Schedule actions
      addSchedule: async (schedule) => {
        try {
          const result = await schedulesService.create(schedule);
          set((state) => ({
            schedules: [...state.schedules, result.schedule]
          }));
        } catch (error: any) {
          toast.error(error.message || 'Failed to add schedule');
          throw error;
        }
      },
      updateSchedule: async (id, updates) => {
        try {
          const result = await schedulesService.update(id, updates);
          set((state) => ({
            schedules: state.schedules.map((s) =>
              s.id === id ? result.schedule : s
            )
          }));
        } catch (error: any) {
          toast.error(error.message || 'Failed to update schedule');
          throw error;
        }
      },
      deleteSchedule: async (id) => {
        try {
          await schedulesService.delete(id);
          set((state) => ({
            schedules: state.schedules.filter((s) => s.id !== id)
          }));
        } catch (error: any) {
          toast.error(error.message || 'Failed to delete schedule');
          throw error;
        }
      },
      
      // Dose log actions
      addDoseLog: async (log) => {
        try {
          const result = await doseLogsService.create(log);
          set((state) => ({
            doseLogs: [...state.doseLogs, result.doseLog]
          }));
        } catch (error: any) {
          toast.error(error.message || 'Failed to add dose log');
          throw error;
        }
      },
      updateDoseLog: async (id, updates) => {
        try {
          const result = await doseLogsService.update(id, updates);
          set((state) => ({
            doseLogs: state.doseLogs.map((l) =>
              l.id === id ? result.doseLog : l
            )
          }));
        } catch (error: any) {
          toast.error(error.message || 'Failed to update dose log');
          throw error;
        }
      },
      logDose: async (medicineId, scheduledTime, status, notes) => {
        const log: Partial<DoseLog> = {
          medicineId,
          scheduledTime,
          takenTime: status === 'TAKEN' ? new Date().toISOString() : undefined,
          status,
          notes
        };
        
        try {
          const result = await doseLogsService.create(log);
          set((state) => ({
            doseLogs: [...state.doseLogs, result.doseLog]
          }));
          
          // Decrement stock if taken
          if (status === 'TAKEN') {
            const schedule = get().schedules.find(s => s.medicineId === medicineId);
            if (schedule) {
              get().decrementStock(medicineId, schedule.dosageAmount);
            }
          }
        } catch (error: any) {
          toast.error(error.message || 'Failed to log dose');
          throw error;
        }
      },
      
      // Notification actions
      addNotification: (notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications]
        }));

        const user = get().user;
        try {
          const settings = user?.notificationSettings;
          const map: Record<string, boolean | undefined> = {
            DOSE_DUE: settings?.doseReminders,
            MISSED_DOSE: settings?.missedDoseAlerts,
            REFILL_WARNING: settings?.refillWarnings,
            CAREGIVER_ALERT: settings?.missedDoseAlerts
          };
          if (settings?.emailEnabled && map[notification.type]) {
            void sendNotificationEmail(notification, user!).catch(() => {});
          }
        } catch (e) {
          void 0;
        }
      },
      markNotificationRead: async (id) => {
        try {
          await notificationsService.markAsRead(id);
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            )
          }));
        } catch (error: any) {
          toast.error(error.message || 'Failed to mark notification as read');
        }
      },
      clearNotifications: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true }))
      })),
      
      // Caregiver actions
      addCaregiverLink: async (link) => {
        try {
          const result = await caregiverService.create({
            patient_id: link.patientId,
            patient_name: link.patientName
          });
          set((state) => ({
            caregiverLinks: [...state.caregiverLinks, result.link]
          }));
        } catch (error: any) {
          toast.error(error.message || 'Failed to add caregiver link');
          throw error;
        }
      },
      removeCaregiverLink: async (id) => {
        try {
          await caregiverService.delete(id);
          set((state) => ({
            caregiverLinks: state.caregiverLinks.filter((l) => l.id !== id)
          }));
        } catch (error: any) {
          toast.error(error.message || 'Failed to remove caregiver link');
          throw error;
        }
      },
      
      // Prescription actions
      addPrescription: async (prescription) => {
        try {
          const result = await prescriptionsService.create(prescription);
          set((state) => ({ prescriptions: [...state.prescriptions, result.prescription] }));
          
          const user = get().user;
          if (user?.notificationsEnabled) {
            void sendPrescriptionUploadEmail(result.prescription, user).catch(() => {});
          }
        } catch (error: any) {
          toast.error(error.message || 'Failed to add prescription');
          throw error;
        }
      },
      updatePrescription: async (id, updates) => {
        try {
          const result = await prescriptionsService.update(id, updates);
          set((state) => ({
            prescriptions: state.prescriptions.map((p) =>
              p.id === id ? result.prescription : p
            )
          }));
        } catch (error: any) {
          toast.error(error.message || 'Failed to update prescription');
          throw error;
        }
      },

      // Order actions
      addOrder: async (order) => {
        try {
          const result = await ordersService.create(order);
          set((state) => ({ orders: [result.order, ...state.orders] }));
          
          // Auto-increment stock for linked medicines
          const items = order.items || [];
          const meds = get().medicines;
          const updated = meds.map(m => {
            const qty = items.filter(i => i.medicineId === m.id).reduce((sum, i) => sum + i.quantity, 0);
            return qty > 0 ? { ...m, stockCount: m.stockCount + qty } : m;
          });
          set({ medicines: updated });

          const user = get().user;
          const enabled = user?.notificationSettings?.orderNotifications && user?.notificationSettings?.emailEnabled;
          if (enabled) {
            void sendOrderEmail(result.order, user!).catch(() => {});
          }
        } catch (error: any) {
          toast.error(error.message || 'Failed to add order');
          throw error;
        }
      },
      updateOrder: async (id, updates) => {
        try {
          const result = await ordersService.update(id, updates);
          set((state) => ({
            orders: state.orders.map((o) => (o.id === id ? result.order : o))
          }));
        } catch (error: any) {
          toast.error(error.message || 'Failed to update order');
          throw error;
        }
      },
      deleteOrder: async (id) => {
        try {
          await ordersService.delete(id);
          set((state) => ({
            orders: state.orders.filter((o) => o.id !== id)
          }));
        } catch (error: any) {
          toast.error(error.message || 'Failed to delete order');
          throw error;
        }
      },
      
      // Disease Profile actions
      addDiseaseProfile: async (profile) => {
        try {
          const result = await diseaseProfilesService.create(profile);
          set((state) => ({
            diseaseProfiles: [...state.diseaseProfiles, result.profile]
          }));
        } catch (error: any) {
          toast.error(error.message || 'Failed to add disease profile');
          throw error;
        }
      },
      updateDiseaseProfile: async (id, updates) => {
        try {
          const result = await diseaseProfilesService.update(id, updates);
          set((state) => ({
            diseaseProfiles: state.diseaseProfiles.map((p) =>
              p.id === id ? result.profile : p
            )
          }));
        } catch (error: any) {
          toast.error(error.message || 'Failed to update disease profile');
          throw error;
        }
      },
      deleteDiseaseProfile: async (id) => {
        try {
          await diseaseProfilesService.delete(id);
          set((state) => ({
            diseaseProfiles: state.diseaseProfiles.filter((p) => p.id !== id)
          }));
        } catch (error: any) {
          toast.error(error.message || 'Failed to delete disease profile');
          throw error;
        }
      },
      getDiseaseProfile: (id) => {
        return get().diseaseProfiles.find((p) => p.id === id);
      },
      
      // UI actions
      toggleElderlyMode: () => set((state) => {
        const newMode = !state.elderlyMode;
        if (state.user) {
          return {
            elderlyMode: newMode,
            user: { ...state.user, elderlyMode: newMode }
          };
        }
        return { elderlyMode: newMode };
      }),
      
      // Stock management
      decrementStock: async (medicineId, amount) => {
        const medicine = get().medicines.find(m => m.id === medicineId);
        if (!medicine) return;

        const newStock = Math.max(0, medicine.stockCount - amount);
        
        try {
          // Update backend
          await medicinesService.update(medicineId, { stockCount: newStock });
          
          // Update local state
          const updatedMedicines = get().medicines.map(m =>
            m.id === medicineId ? { ...m, stockCount: newStock } : m
          );
          set({ medicines: updatedMedicines });

          // Check for refill warning and notify
          if (newStock <= medicine.refillThreshold && newStock > 0) {
            const notification: Notification = {
              id: generateId(),
              userId: get().user?.id || '',
              type: 'REFILL_WARNING',
              message: `${medicine.name} is running low. Only ${newStock} ${medicine.form}s remaining.`,
              medicineId: medicine.id,
              createdAt: new Date().toISOString(),
              read: false
            };

            set((state) => ({ notifications: [notification, ...state.notifications] }));

            try {
              const user = get().user;
              const enabled = user?.notificationSettings?.refillWarnings && user?.notificationSettings?.emailEnabled;
              if (enabled) {
                void sendNotificationEmail(notification, user!).catch(() => {});
              }
            } catch (e) {
              // ignore email errors
            }
          }
        } catch (error: any) {
          toast.error(error.message || 'Failed to update stock');
        }
      }
    }),
    {
      name: 'medicine-reminder-storage'
    }
  )
);
