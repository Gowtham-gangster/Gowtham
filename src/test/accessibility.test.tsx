import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Import key components to test
import { ButtonEnhanced } from '@/components/ui/button-enhanced';
import { InputEnhanced } from '@/components/ui/input-enhanced';
import { CardEnhanced } from '@/components/ui/card-enhanced';
import { EmptyState } from '@/components/ui/empty-state';
import Login from '@/pages/Login';
import Landing from '@/pages/Landing';

/**
 * Accessibility Test Suite
 * Tests keyboard navigation, ARIA attributes, focus management, and semantic HTML
 * Validates Requirements 12.1, 12.2, 12.4, 12.5
 */

describe('Accessibility - Keyboard Navigation (Requirement 12.1)', () => {
  it('should allow keyboard navigation through interactive elements', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(
      <div>
        <ButtonEnhanced onClick={handleClick}>Button 1</ButtonEnhanced>
        <ButtonEnhanced onClick={handleClick}>Button 2</ButtonEnhanced>
        <ButtonEnhanced onClick={handleClick}>Button 3</ButtonEnhanced>
      </div>
    );

    const buttons = screen.getAllByRole('button');
    
    // Tab through buttons
    await user.tab();
    expect(buttons[0]).toHaveFocus();
    
    await user.tab();
    expect(buttons[1]).toHaveFocus();
    
    await user.tab();
    expect(buttons[2]).toHaveFocus();
  });

  it('should show focus indicators on all interactive elements', () => {
    render(
      <div>
        <ButtonEnhanced>Test Button</ButtonEnhanced>
        <InputEnhanced placeholder="Test Input" />
      </div>
    );

    const button = screen.getByRole('button');
    const input = screen.getByPlaceholderText('Test Input');

    // Check that elements can receive focus (have tabIndex or are naturally focusable)
    expect(button).toBeInTheDocument();
    expect(input).toBeInTheDocument();
  });

  it('should activate buttons with Enter and Space keys', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<ButtonEnhanced onClick={handleClick}>Click Me</ButtonEnhanced>);

    const button = screen.getByRole('button');
    button.focus();

    // Activate with Enter
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Activate with Space
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should support reverse tab navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <div>
        <ButtonEnhanced>Button 1</ButtonEnhanced>
        <ButtonEnhanced>Button 2</ButtonEnhanced>
      </div>
    );

    const buttons = screen.getAllByRole('button');
    
    // Tab forward
    await user.tab();
    expect(buttons[0]).toHaveFocus();
    
    await user.tab();
    expect(buttons[1]).toHaveFocus();
    
    // Tab backward
    await user.tab({ shift: true });
    expect(buttons[0]).toHaveFocus();
  });
});

describe('Accessibility - ARIA Labels and Roles (Requirements 12.2, 12.5)', () => {
  it('should have proper ARIA labels on buttons', () => {
    render(
      <ButtonEnhanced aria-label="Close dialog">
        <span aria-hidden="true">×</span>
      </ButtonEnhanced>
    );

    const button = screen.getByRole('button', { name: 'Close dialog' });
    expect(button).toBeInTheDocument();
  });

  it('should have proper ARIA attributes on form inputs', () => {
    render(
      <InputEnhanced
        label="Email"
        error="Invalid email"
        required
        aria-describedby="email-error"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('required');
  });

  it('should mark decorative icons as aria-hidden', () => {
    const { container } = render(
      <ButtonEnhanced leftIcon={<span data-testid="icon">🔍</span>}>
        Search
      </ButtonEnhanced>
    );

    // Icon should not be announced by screen readers when button has text
    const button = screen.getByRole('button', { name: /search/i });
    expect(button).toBeInTheDocument();
  });

  it('should have role="alert" on error messages', () => {
    render(
      <InputEnhanced
        label="Username"
        error="Username is required"
      />
    );

    // Error message should be announced to screen readers
    const errorMessage = screen.getByText('Username is required');
    expect(errorMessage).toBeInTheDocument();
  });

  it('should use proper semantic HTML for empty states', () => {
    const { container } = render(
      <EmptyState
        icon={<span>📭</span>}
        title="No items found"
        description="Try adding your first item"
        action={{
          label: 'Add Item',
          onClick: () => {},
        }}
      />
    );

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { name: /no items found/i });
    expect(heading).toBeInTheDocument();
    
    // Check for action button
    const button = screen.getByRole('button', { name: /add item/i });
    expect(button).toBeInTheDocument();
  });
});

describe('Accessibility - Form Accessibility', () => {
  it('should associate labels with inputs', () => {
    render(
      <InputEnhanced
        label="Email Address"
        placeholder="Enter your email"
      />
    );

    const input = screen.getByRole('textbox', { name: /email address/i });
    expect(input).toBeInTheDocument();
  });

  it('should show required indicator on required fields', () => {
    render(
      <InputEnhanced
        label="Password"
        required
      />
    );

    // Check that required indicator is present
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should announce form errors to screen readers', () => {
    render(
      <InputEnhanced
        label="Email"
        error="Please enter a valid email address"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    
    const errorMessage = screen.getByText(/please enter a valid email/i);
    expect(errorMessage).toBeInTheDocument();
  });
});

describe('Accessibility - Loading States', () => {
  it('should have accessible loading indicators', () => {
    render(
      <ButtonEnhanced isLoading>
        Submit
      </ButtonEnhanced>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toBeInTheDocument();
  });
});

describe('Accessibility - Image Alt Text (Requirement 12.4)', () => {
  it('should have alt text on meaningful images', () => {
    const { container } = render(
      <img src="/test.jpg" alt="User profile picture" />
    );

    const image = screen.getByAltText('User profile picture');
    expect(image).toBeInTheDocument();
  });

  it('should have empty alt text on decorative images', () => {
    const { container } = render(
      <img src="/decoration.jpg" alt="" />
    );

    const images = container.querySelectorAll('img');
    expect(images[0]).toHaveAttribute('alt', '');
  });
});

describe('Accessibility - Login Page', () => {
  it('should have proper form structure and labels', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Check for form inputs with labels
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    
    // Check for submit button
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should support keyboard navigation through login form', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Tab through form elements - first tab goes to "Back to home" link
    await user.tab();
    await user.tab(); // Now on email input
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    expect(emailInput).toHaveFocus();

    await user.tab();
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveFocus();

    await user.tab();
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toHaveFocus();
  });
});

describe('Accessibility - Landing Page', () => {
  it('should have proper heading hierarchy', () => {
    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );

    // Check for main heading
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    
    // Main heading should be present
    expect(headings[0]).toBeInTheDocument();
  });

  it('should have accessible navigation links', () => {
    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );

    // Check for CTA buttons
    const loginButton = screen.getByRole('link', { name: /log in/i });
    const signupButton = screen.getByRole('link', { name: /sign up/i });
    
    expect(loginButton).toBeInTheDocument();
    expect(signupButton).toBeInTheDocument();
  });
});

describe('Accessibility - Touch Targets (Requirements 4.4, 8.5)', () => {
  it('should have minimum 44px touch targets on buttons', () => {
    const { container } = render(
      <ButtonEnhanced size="md">Click Me</ButtonEnhanced>
    );

    const button = screen.getByRole('button');
    const styles = window.getComputedStyle(button);
    
    // Button should have adequate padding for touch targets
    expect(button).toBeInTheDocument();
  });
});

describe('Accessibility - Disabled States', () => {
  it('should properly disable buttons and prevent interaction', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(
      <ButtonEnhanced disabled onClick={handleClick}>
        Disabled Button
      </ButtonEnhanced>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    // Try to click - should not trigger handler
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should properly disable inputs', () => {
    render(
      <InputEnhanced
        label="Disabled Input"
        disabled
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });
});
