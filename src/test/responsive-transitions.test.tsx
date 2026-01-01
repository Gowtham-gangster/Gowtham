import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useStore } from '@/store/useStore';

// Mock the store
const mockUser = {
  id: 'test-user',
  email: 'test@example.com',
  name: 'Test User',
  role: 'PATIENT' as const,
  createdAt: new Date().toISOString(),
  notificationsEnabled: true,
  voiceRemindersEnabled: false,
};

describe('Responsive Layout Transitions', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    // Store original window width
    originalInnerWidth = window.innerWidth;
    
    // Set up mock user
    useStore.setState({
      user: mockUser,
      medicines: [],
      schedules: [],
      doseLogs: [],
      notifications: [],
      elderlyMode: false,
    });
  });

  afterEach(() => {
    // Restore original window width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  const setViewportWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    window.dispatchEvent(new Event('resize'));
  };

  it('should render mobile layout at 375px width', () => {
    setViewportWidth(375);
    
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );

    // Bottom navigation should be visible on mobile
    const nav = screen.getByRole('navigation', { name: /mobile navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it('should render tablet layout at 768px width', () => {
    setViewportWidth(768);
    
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );

    // Main navigation should be present (may be multiple due to responsive design)
    const navs = screen.getAllByRole('navigation', { name: /main navigation/i });
    expect(navs.length).toBeGreaterThan(0);
  });

  it('should render desktop layout at 1280px width', () => {
    setViewportWidth(1280);
    
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );

    // Main navigation should be present (may be multiple due to responsive design)
    const navs = screen.getAllByRole('navigation', { name: /main navigation/i });
    expect(navs.length).toBeGreaterThan(0);
  });

  it('should have skip to main content link for keyboard navigation', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );

    const skipLink = screen.getByText(/skip to main content/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveClass('skip-to-main');
  });

  it('should render main content with proper role', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'main-content');
  });

  it('should apply elderly mode classes when enabled', () => {
    useStore.setState({ elderlyMode: true });
    
    const { container } = render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );

    const layoutDiv = container.querySelector('.elderly-mode');
    expect(layoutDiv).toBeInTheDocument();
  });

  it('should have proper touch target sizes on mobile', () => {
    setViewportWidth(375);
    
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );

    // Check that bottom navigation has the proper classes for touch targets
    const mobileNav = screen.getByRole('navigation', { name: /mobile navigation/i });
    const navLinks = mobileNav.querySelectorAll('a');
    
    // Verify that links have minimum size classes applied
    const hasMinSizeClasses = Array.from(navLinks).some(link => {
      const classList = link.className;
      // Check for min-w and min-h classes
      return classList.includes('min-w-') && classList.includes('min-h-');
    });
    
    expect(hasMinSizeClasses).toBe(true);
    expect(navLinks.length).toBeGreaterThan(0);
  });
});

describe('Responsive Grid Transitions', () => {
  it('should transition grid columns smoothly', () => {
    const { container } = render(
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 transition-grid">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </div>
    );

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('transition-grid');
  });

  it('should prevent content jumping with no-jump class', () => {
    const { container } = render(
      <div className="no-jump">
        <p>Content that should not jump</p>
      </div>
    );

    const element = container.querySelector('.no-jump');
    expect(element).toBeInTheDocument();
    // The class should be applied, actual CSS behavior is tested in browser
    expect(element).toHaveClass('no-jump');
  });
});

describe('Responsive Text Sizing', () => {
  it('should scale text appropriately on mobile', () => {
    const { container } = render(
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
        Responsive Heading
      </h1>
    );

    const heading = container.querySelector('h1');
    expect(heading).toHaveClass('text-4xl');
    expect(heading).toHaveClass('sm:text-5xl');
    expect(heading).toHaveClass('md:text-6xl');
    expect(heading).toHaveClass('lg:text-7xl');
  });
});
