import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Signup } from './Signup';
import { authService } from '@/services/api/auth-service';
import { useStore } from '@/store/useStore';

// Mock dependencies
vi.mock('@/services/api/auth-service');
vi.mock('@/store/useStore');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Signup Authentication Flow', () => {
  const mockLogin = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockReturnValue({
      login: mockLogin,
    });
    vi.mocked(authService.signup).mockClear();
  });

  /**
   * Feature: production-auth-cleanup, Test: Signup with valid data
   * Validates: Requirements 6.3, 6.4
   */
  it('should create account and redirect to dashboard when signup succeeds', async () => {
    const mockUser = {
      id: '1',
      name: 'New User',
      email: 'newuser@example.com',
      role: 'PATIENT' as const,
    };

    vi.mocked(authService.signup).mockResolvedValue({
      user: mockUser,
      token: 'new-token',
    });

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    // Fill in the form
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'New User' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for async operations
    await waitFor(() => {
      expect(authService.signup).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'PATIENT',
      });
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(mockUser);
    });

    // Verify session storage flag is set
    expect(sessionStorage.getItem('restore_session')).toBe('true');
  });

  /**
   * Feature: production-auth-cleanup, Test: Signup with existing email
   * Validates: Requirements 7.2
   */
  it('should show error message when signup fails with existing email', async () => {
    vi.mocked(authService.signup).mockRejectedValue(
      new Error('An account with this email already exists')
    );

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'Existing User' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.signup).toHaveBeenCalledWith({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
        role: 'PATIENT',
      });
    });

    // Verify login was not called on the store
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should validate password length before submission', async () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '12345' } }); // Too short
    fireEvent.click(submitButton);

    // Should not call signup with short password
    await waitFor(() => {
      expect(authService.signup).not.toHaveBeenCalled();
    });
  });

  it('should require all form fields', () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    expect(nameInput.required).toBe(true);
    expect(emailInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
    expect(emailInput.type).toBe('email');
    expect(passwordInput.type).toBe('password');
    // Note: minLength validation is now handled in JavaScript, not HTML attribute
  });

  it('should allow role selection between PATIENT and CAREGIVER', () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    // Check that both role buttons exist by looking for their text content
    const patientText = screen.getByText(/I manage my own medications/i);
    const caregiverText = screen.getByText(/I help others with their meds/i);

    expect(patientText).toBeDefined();
    expect(caregiverText).toBeDefined();
  });

  /**
   * Feature: production-auth-cleanup, Test: Error message for existing email
   * Validates: Requirements 7.2
   */
  it('should display "An account with this email already exists" for existing email', async () => {
    const { toast } = await import('sonner');
    
    vi.mocked(authService.signup).mockRejectedValue(
      new Error('An account with this email already exists')
    );

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('An account with this email already exists');
    });
  });

  /**
   * Feature: production-auth-cleanup, Test: Error message for weak password
   * Validates: Requirements 7.4
   */
  it('should display "Password must be at least 6 characters" for weak password', async () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '12345' } }); // Too short
    fireEvent.click(submitButton);

    // Should show inline error message instead of toast
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeDefined();
    });
  });

  /**
   * Feature: production-auth-cleanup, Test: Error message for network errors
   * Validates: Requirements 7.3
   */
  it('should display appropriate message for network errors', async () => {
    const { toast } = await import('sonner');
    
    vi.mocked(authService.signup).mockRejectedValue(
      new Error('Network error. Please check your connection')
    );

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error. Please check your connection');
    });
  });

  /**
   * Feature: production-auth-cleanup, Test: Missing field validation - name
   * Validates: Requirements 7.5
   */
  it('should display error for missing name field', async () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Set values - name is whitespace only
    fireEvent.change(nameInput, { target: { value: '   ' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Should show inline error message instead of toast
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeDefined();
    });
  });

  /**
   * Feature: production-auth-cleanup, Test: Missing field validation - email
   * Validates: Requirements 7.5
   */
  it('should display error for invalid email format', async () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const form = nameInput.closest('form') as HTMLFormElement;

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    // Use invalid email format that passes HTML5 but fails our regex
    fireEvent.change(emailInput, { target: { value: 'test@' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit form directly
    fireEvent.submit(form);

    // Should show inline error message for invalid email
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeDefined();
    });
  });
});
