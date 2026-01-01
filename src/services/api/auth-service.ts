import api from '../../lib/api-client';

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role?: 'PATIENT' | 'CAREGIVER';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'CAREGIVER';
  caregiverInviteCode?: string;
  elderlyMode?: boolean;
  timezone?: string;
  voiceRemindersEnabled?: boolean;
  notificationsEnabled?: boolean;
  notificationSettings?: any;
  age?: number;
  phone?: string;
  address?: string;
  emergencyContact?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: ApiUser;
  token: string;
}

// Convert API user to full User type with defaults
const normalizeUser = (apiUser: ApiUser): ApiUser => {
  return {
    ...apiUser,
    elderlyMode: apiUser.elderlyMode ?? false,
    timezone: apiUser.timezone ?? 'UTC',
    voiceRemindersEnabled: apiUser.voiceRemindersEnabled ?? true,
    notificationsEnabled: apiUser.notificationsEnabled ?? true,
    notificationSettings: apiUser.notificationSettings ?? {
      doseReminders: true,
      missedDoseAlerts: true,
      refillWarnings: true,
      orderNotifications: true,
      emailEnabled: false
    }
  };
};

export const authService = {
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/signup', data);
    api.setAuthToken(response.token);
    return {
      ...response,
      user: normalizeUser(response.user)
    };
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    api.setAuthToken(response.token);
    return {
      ...response,
      user: normalizeUser(response.user)
    };
  },

  async logout(): Promise<void> {
    await api.post('/api/auth/logout');
    api.clearAuthToken();
  },

  async getCurrentUser(): Promise<{ user: ApiUser }> {
    const response = await api.get<{ user: ApiUser }>('/api/auth/me');
    return {
      user: normalizeUser(response.user)
    };
  },
};
