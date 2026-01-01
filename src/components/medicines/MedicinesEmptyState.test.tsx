import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MedicinesEmptyState } from './MedicinesEmptyState';
import '@testing-library/jest-dom/vitest';

// Mock the store
vi.mock('@/store/useStore', () => ({
  useStore: () => ({
    elderlyMode: false,
  }),
}));

describe('MedicinesEmptyState', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <MedicinesEmptyState />
      </BrowserRouter>
    );
  };

  it('should render the main empty state message', () => {
    renderComponent();
    
    expect(screen.getByText('No medicines yet')).toBeInTheDocument();
    expect(screen.getByText(/Start managing your medications/)).toBeInTheDocument();
  });

  it('should render the add medicine button', () => {
    renderComponent();
    
    const addButton = screen.getByRole('button', { name: /Add Your First Medicine/i });
    expect(addButton).toBeInTheDocument();
  });

  it('should render all three onboarding tips', () => {
    renderComponent();
    
    expect(screen.getByText('Never Miss a Dose')).toBeInTheDocument();
    expect(screen.getByText('Smart Notifications')).toBeInTheDocument();
    expect(screen.getByText('Track Your History')).toBeInTheDocument();
  });

  it('should render the pro tip section', () => {
    renderComponent();
    
    expect(screen.getByText(/Pro Tip:/)).toBeInTheDocument();
    expect(screen.getByText(/You can also add medicines by uploading a prescription photo or using voice input/)).toBeInTheDocument();
  });

  it('should render the section title', () => {
    renderComponent();
    
    expect(screen.getByText('What you can do with MedReminder Pro')).toBeInTheDocument();
  });
});
