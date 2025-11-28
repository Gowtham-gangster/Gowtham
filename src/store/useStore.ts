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
      login: (user) => set({ user, isAuthenticated: true, elderlyMode: user.elderlyMode }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        medicines: [],
        schedules: [],
        doseLogs: [],
        notifications: [],
        caregiverLinks: [],
        prescriptions: [],
        orders: [],
        diseaseProfiles: []
      }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      // Medicine actions
      addMedicine: (medicine) => set((state) => ({
        medicines: [...state.medicines, medicine]
      })),
      updateMedicine: (id, updates) => set((state) => ({
        medicines: state.medicines.map((m) => 
          m.id === id ? { ...m, ...updates } : m
        )
      })),
      deleteMedicine: (id) => set((state) => ({
        medicines: state.medicines.filter((m) => m.id !== id),
        schedules: state.schedules.filter((s) => s.medicineId !== id)
      })),
      
      // Schedule actions
      addSchedule: (schedule) => set((state) => ({
        schedules: [...state.schedules, schedule]
      })),
      updateSchedule: (id, updates) => set((state) => ({
        schedules: state.schedules.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        )
      })),
      deleteSchedule: (id) => set((state) => ({
        schedules: state.schedules.filter((s) => s.id !== id)
      })),
      
      // Dose log actions
      addDoseLog: (log) => set((state) => ({
        doseLogs: [...state.doseLogs, log]
      })),
      updateDoseLog: (id, updates) => set((state) => ({
        doseLogs: state.doseLogs.map((l) =>
          l.id === id ? { ...l, ...updates } : l
        )
      })),
      logDose: (medicineId, scheduledTime, status, notes) => {
        const log: DoseLog = {
          id: generateId(),
          odcUserId: get().user?.id || '',
          medicineId,
          scheduledTime,
          takenTime: status === 'TAKEN' ? new Date().toISOString() : undefined,
          status,
          notes
        };
        set((state) => ({
          doseLogs: [...state.doseLogs, log]
        }));
        
        // Decrement stock if taken
        if (status === 'TAKEN') {
          const schedule = get().schedules.find(s => s.medicineId === medicineId);
          if (schedule) {
            get().decrementStock(medicineId, schedule.dosageAmount);
          }
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
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        )
      })),
      clearNotifications: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true }))
      })),
      
      // Caregiver actions
      addCaregiverLink: (link) => set((state) => ({
        caregiverLinks: [...state.caregiverLinks, link]
      })),
      removeCaregiverLink: (id) => set((state) => ({
        caregiverLinks: state.caregiverLinks.filter((l) => l.id !== id)
      })),
      
      // Prescription actions
      addPrescription: (prescription) => {
        set((state) => ({ prescriptions: [...state.prescriptions, prescription] }));
        try {
          const user = get().user;
          if (user?.notificationsEnabled) {
            void sendPrescriptionUploadEmail(prescription, user).catch(() => {});
          }
        } catch (e) {
          // ignore
        }
      },
      updatePrescription: (id, updates) => set((state) => ({
        prescriptions: state.prescriptions.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        )
      })),

      // Order actions
      addOrder: (order) => {
        set((state) => ({ orders: [order, ...state.orders] }));
        // Auto-increment stock for linked medicines
        const items = order.items || [];
        const meds = get().medicines;
        const updated = meds.map(m => {
          const qty = items.filter(i => i.medicineId === m.id).reduce((sum, i) => sum + i.quantity, 0);
          return qty > 0 ? { ...m, stockCount: m.stockCount + qty } : m;
        });
        set({ medicines: updated });

        try {
          const user = get().user;
          const enabled = user?.notificationSettings?.orderNotifications && user?.notificationSettings?.emailEnabled;
          if (enabled) {
            void sendOrderEmail(order, user!).catch(() => {});
          }
        } catch (e) {
          // ignore email errors
        }
      },
      updateOrder: (id, updates) => set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? { ...o, ...updates } : o))
      })),
      deleteOrder: (id) => set((state) => ({
        orders: state.orders.filter((o) => o.id !== id)
      })),
      
      // Disease Profile actions
      addDiseaseProfile: (profile) => set((state) => ({
        diseaseProfiles: [...state.diseaseProfiles, profile]
      })),
      updateDiseaseProfile: (id, updates) => set((state) => ({
        diseaseProfiles: state.diseaseProfiles.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        )
      })),
      deleteDiseaseProfile: (id) => set((state) => ({
        diseaseProfiles: state.diseaseProfiles.filter((p) => p.id !== id)
      })),
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
      decrementStock: (medicineId, amount) => {
        const medicine = get().medicines.find(m => m.id === medicineId);
        if (!medicine) return;

        const newStock = Math.max(0, medicine.stockCount - amount);
        const updatedMedicines = get().medicines.map(m =>
          m.id === medicineId ? { ...m, stockCount: newStock } : m
        );

        // apply state update
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
      }
    }),
    {
      name: 'medicine-reminder-storage'
    }
  )
);
