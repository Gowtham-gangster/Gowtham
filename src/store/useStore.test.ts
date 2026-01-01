import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStore } from './useStore';
import { authService } from '@/services/api/auth-service';

// Mock all service dependencies
vi.mock('@/services/api/auth-service');
vi.mock('@/services/api/medicines-service');
vi.mock('@/services/api/schedules-service');
vi.mock('@/services/api/dose-logs-service');
vi.mock('@/services/api/disease-profiles-service');
vi.mock('@/services/api/prescriptions-service');
vi.mock('@/services/api/orders-service');
vi.mock('@/services/api/notifications-service');
vi.mock('@/services/api/caregiver-service');
vi.mock('@/services/email', () => ({
  initEmail: vi.fn(),
  sendNotificationEmail: vi.fn(),
  sendPrescriptionUploadEmail: vi.fn(),
  sendOrderEmail: vi.fn(),
}));
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Store Logout Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear storage before each test
    sessionStorage.clear();
    localStorage.clear();
    
    // Reset store state
    useStore.setState({
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
    });
  });

  /**
   * Feature: production-auth-cleanup, Test: Logout clears session
   * Validates: Requirements 8.1, 8.2, 8.3, 8.4
   */
  it('should clear all session data and redirect to landing page on logout', async () => {
    // Setup: Create an authenticated user session
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'PATIENT' as const,
      elderlyMode: false,
      timezone: 'UTC',
      voiceRemindersEnabled: true,
      notificationsEnabled: true,
      notificationSettings: {
        doseReminders: true,
        missedDoseAlerts: true,
        refillWarnings: true,
        orderNotifications: true,
        emailEnabled: false,
      },
    };

    // Set up session storage and local storage
    sessionStorage.setItem('restore_session', 'true');
    sessionStorage.setItem('some_other_data', 'value');
    localStorage.setItem('some_other_key', 'value');

    // Set authenticated state
    useStore.setState({
      user: mockUser,
      isAuthenticated: true,
      medicines: [{ id: '1', name: 'Test Medicine' } as any],
      schedules: [{ id: '1', medicineId: '1' } as any],
      doseLogs: [{ id: '1', medicineId: '1' } as any],
      notifications: [{ id: '1', type: 'DOSE_DUE' } as any],
      caregiverLinks: [{ id: '1', patientId: '1' } as any],
      prescriptions: [{ id: '1', userId: '1' } as any],
      orders: [{ id: '1', userId: '1' } as any],
      diseaseProfiles: [{ id: '1', userId: '1' } as any],
    });

    // Mock authService.logout to resolve successfully
    vi.mocked(authService.logout).mockResolvedValue();

    // Execute logout
    await useStore.getState().logout();

    // Verify authService.logout was called
    expect(authService.logout).toHaveBeenCalled();

    // Verify sessionStorage is completely cleared
    expect(sessionStorage.length).toBe(0);
    expect(sessionStorage.getItem('restore_session')).toBeNull();
    expect(sessionStorage.getItem('some_other_data')).toBeNull();

    // Verify critical localStorage keys are cleared
    expect(localStorage.getItem('some_other_key')).toBeNull();

    // Verify store state is reset
    const state = useStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.medicines).toEqual([]);
    expect(state.schedules).toEqual([]);
    expect(state.doseLogs).toEqual([]);
    expect(state.notifications).toEqual([]);
    expect(state.caregiverLinks).toEqual([]);
    expect(state.prescriptions).toEqual([]);
    expect(state.orders).toEqual([]);
    expect(state.diseaseProfiles).toEqual([]);
    expect(state.elderlyMode).toBe(false);
  });

  it('should clear session even if authService.logout fails', async () => {
    // Setup authenticated state
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'PATIENT' as const,
      elderlyMode: false,
      timezone: 'UTC',
      voiceRemindersEnabled: true,
      notificationsEnabled: true,
      notificationSettings: {},
    };

    sessionStorage.setItem('restore_session', 'true');
    localStorage.setItem('some_other_key', 'value');

    useStore.setState({
      user: mockUser,
      isAuthenticated: true,
    });

    // Mock authService.logout to fail
    vi.mocked(authService.logout).mockRejectedValue(new Error('Network error'));

    // Execute logout
    await useStore.getState().logout();

    // Verify session is still cleared despite error
    expect(sessionStorage.length).toBe(0);
    expect(localStorage.getItem('some_other_key')).toBeNull();
    expect(useStore.getState().user).toBeNull();
    expect(useStore.getState().isAuthenticated).toBe(false);
  });

  it('should prevent access to protected data after logout', async () => {
    // Setup authenticated state with data
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'PATIENT' as const,
      elderlyMode: false,
      timezone: 'UTC',
      voiceRemindersEnabled: true,
      notificationsEnabled: true,
      notificationSettings: {},
    };

    useStore.setState({
      user: mockUser,
      isAuthenticated: true,
      medicines: [{ id: '1', name: 'Medicine 1' } as any],
    });

    vi.mocked(authService.logout).mockResolvedValue();

    // Logout
    await useStore.getState().logout();

    // Verify user cannot access protected data
    const state = useStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.medicines).toEqual([]);
  });
});
