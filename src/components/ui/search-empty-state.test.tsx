import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchEmptyState } from './search-empty-state';

describe('SearchEmptyState', () => {
  it('should display the search query in the message', () => {
    const mockClearSearch = vi.fn();
    render(
      <SearchEmptyState
        searchQuery="aspirin"
        onClearSearch={mockClearSearch}
      />
    );

    expect(screen.getByText(/No results found/i)).toBeInTheDocument();
    expect(screen.getByText(/"aspirin"/i)).toBeInTheDocument();
  });

  it('should call onClearSearch when clear button is clicked', () => {
    const mockClearSearch = vi.fn();
    render(
      <SearchEmptyState
        searchQuery="test"
        onClearSearch={mockClearSearch}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);

    expect(mockClearSearch).toHaveBeenCalledTimes(1);
  });

  it('should display suggestions when provided', () => {
    const mockClearSearch = vi.fn();
    const suggestions = ['Metformin', 'Aspirin', 'Lisinopril'];
    
    render(
      <SearchEmptyState
        searchQuery="test"
        onClearSearch={mockClearSearch}
        suggestions={suggestions}
      />
    );

    expect(screen.getByText(/Try searching for:/i)).toBeInTheDocument();
    suggestions.forEach(suggestion => {
      expect(screen.getByText(suggestion)).toBeInTheDocument();
    });
  });

  it('should not display suggestions section when no suggestions provided', () => {
    const mockClearSearch = vi.fn();
    render(
      <SearchEmptyState
        searchQuery="test"
        onClearSearch={mockClearSearch}
        suggestions={[]}
      />
    );

    expect(screen.queryByText(/Try searching for:/i)).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    const mockClearSearch = vi.fn();
    render(
      <SearchEmptyState
        searchQuery="test"
        onClearSearch={mockClearSearch}
      />
    );

    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });

  it('should display helpful tip text', () => {
    const mockClearSearch = vi.fn();
    render(
      <SearchEmptyState
        searchQuery="test"
        onClearSearch={mockClearSearch}
      />
    );

    expect(screen.getByText(/Try using different keywords or check your spelling/i)).toBeInTheDocument();
  });
});
