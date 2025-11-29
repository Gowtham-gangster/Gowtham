/**
 * Local Authentication Service
 * Stores credentials in localStorage for quick access without email verification
 */

import type { User } from '@/types';

interface StoredCredential {
  email: string;
  password: string;
  profile: User;
  createdAt: string;
}

const STORAGE_KEY = 'medreminder_credentials';
const CURRENT_USER_KEY = 'medreminder_current_user';

class LocalAuthService {
  /**
   * Get all stored credentials
   */
  private getStoredCredentials(): StoredCredential[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save credentials to storage
   */
  private saveCredentials(credentials: StoredCredential[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Sign up - store new credentials
   */
  async signUp(data: {
    email: string;
    password: string;
    name: string;
    role?: 'PATIENT' | 'CAREGIVER';
    age?: number;
    phone?: string;
  }): Promise<User> {
    const credentials = this.getStoredCredentials();

    // Check if email already exists
    const existing = credentials.find(c => c.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    // Create user profile
    const profile: User = {
      id: this.generateId(),
      name: data.name,
      email: data.email,
      role: data.role || 'PATIENT',
      elderlyMode: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      caregiverInviteCode: data.role === 'PATIENT' 
        ? Math.random().toString(36).substring(2, 10).toUpperCase()
        : undefined,
      voiceRemindersEnabled: true,
      notificationsEnabled: true,
      notificationSettings: {
        doseReminders: true,
        missedDoseAlerts: true,
        refillWarnings: true,
        orderNotifications: true,
        emailEnabled: false,
      },
      age: data.age,
      phone: data.phone,
      createdAt: new Date().toISOString(),
    };

    // Store credentials
    const newCredential: StoredCredential = {
      email: data.email,
      password: data.password, // In production, this should be hashed
      profile,
      createdAt: new Date().toISOString(),
    };

    credentials.push(newCredential);
    this.saveCredentials(credentials);

    // Auto-login
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));

    return profile;
  }

  /**
   * Sign in - verify credentials
   */
  async signIn(email: string, password: string): Promise<User> {
    const credentials = this.getStoredCredentials();

    const credential = credentials.find(
      c => c.email.toLowerCase() === email.toLowerCase() && c.password === password
    );

    if (!credential) {
      throw new Error('Invalid email or password');
    }

    // Store current user
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(credential.profile));

    return credential.profile;
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Get all registered emails (for autocomplete)
   */
  getRegisteredEmails(): string[] {
    const credentials = this.getStoredCredentials();
    return credentials.map(c => c.email);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const credentials = this.getStoredCredentials();
    const currentUser = this.getCurrentUser();

    if (!currentUser || currentUser.id !== userId) {
      throw new Error('Not authorized');
    }

    // Find and update credential
    const credentialIndex = credentials.findIndex(c => c.profile.id === userId);
    if (credentialIndex === -1) {
      throw new Error('User not found');
    }

    const updatedProfile = {
      ...credentials[credentialIndex].profile,
      ...updates,
    };

    credentials[credentialIndex].profile = updatedProfile;
    this.saveCredentials(credentials);

    // Update current user
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedProfile));

    return updatedProfile;
  }

  /**
   * Delete account
   */
  async deleteAccount(userId: string): Promise<void> {
    const credentials = this.getStoredCredentials();
    const filtered = credentials.filter(c => c.profile.id !== userId);
    this.saveCredentials(filtered);
    this.signOut();
  }

  /**
   * Clear all data (for testing)
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export const localAuthService = new LocalAuthService();
