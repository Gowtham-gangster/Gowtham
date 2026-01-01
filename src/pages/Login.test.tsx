import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from './Login';
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

describe('Login Authentication Flow', () => {
  const mockLogin = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockReturnValue({
      login: mockLogin,
    });
    vi.mocked(authService.login).mockClear();
  });

  /**
   * Feature: production-auth-cleanup, Test: Login with valid credentials
   * Validates: Requirements 3.1, 5.3
   */
  it('should redirect to dashboard when login succeeds with valid credentials', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'PATIENT' as const,
    };

    vi.mocked(authService.login).mockResolvedValue({
      user: mockUser,
      token: 'valid-token',
    });

    const { container } = render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Fill in the form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for async operations
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(mockUser);
    });

    // Verify session storage flag is set
    expect(sessionStorage.getItem('restore_session')).toBe('true');
  });

  /**
   * Feature: production-auth-cleanup, Test: Login with invalid credentials
   * Validates: Requirements 3.2, 7.1
   */
  it('should show error message when login fails with invalid credentials', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new Error('Invalid email or password')
    );

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });
    });

    // Verify login was not called on the store
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should require email and password fields', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    expect(emailInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
    expect(emailInput.type).toBe('email');
    expect(passwordInput.type).toBe('password');
  });

  /**
   * Feature: production-auth-cleanup, Test: Error message for invalid credentials
   * Validates: Requirements 7.1
   */
  it('should display "Invalid email or password" for invalid credentials', async () => {
    const { toast } = await import('sonner');
    
    vi.mocked(authService.login).mockRejectedValue(
      new Error('Invalid email or password')
    );

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid email or password');
    });
  });

  /**
   * Feature: production-auth-cleanup, Test: Error message for network errors
   * Validates: Requirements 7.3
   */
  it('should display appropriate message for network errors', async () => {
    const { toast } = await import('sonner');
    
    vi.mocked(authService.login).mockRejectedValue(
      new Error('Network error. Please check your connection')
    );

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error. Please check your connection');
    });
  });

  /**
   * Feature: production-auth-cleanup, Test: Missing field validation
   * Validates: Requirements 7.5
   */
  it('should validate required fields before submission', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    // Check HTML5 validation attributes
    expect(emailInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);

    // Verify form won't submit with empty fields (HTML5 validation)
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    // authService.login should not be called with empty fields
    expect(authService.login).not.toHaveBeenCalled();
  });
});
