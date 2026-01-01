/**
 * Empty State Examples
 * 
 * This file demonstrates how to use the empty state components
 * implemented in task 14: Add empty states across app
 * 
 * Requirements covered:
 * - 14.1: Empty state with illustration and helpful text
 * - 14.2: Empty state with CTA to add content
 * - 14.3: Onboarding tips for first-time users
 * - 14.4: "No results" message for search
 * - 14.5: Suggest alternative search terms and clear filters option
 */

import { useState } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchEmptyState } from '@/components/ui/search-empty-state';
import { Pill, FileText, Package, Bell, Search } from 'lucide-react';

/**
 * Example 1: Basic Empty State
 * 
 * Use EmptyState for sections with no data
 */
export const BasicEmptyStateExample = () => (
  <EmptyState
    icon={<Pill className="w-8 h-8" />}
    title="No medicines yet"
    description="Start managing your medications by adding your first medicine."
    action={{
      label: "Add Medicine",
      onClick: () => console.log('Add medicine clicked'),
    }}
  />
);

/**
 * Example 2: Empty State Without Action
 * 
 * Sometimes you just need to show a message without an action
 */
export const EmptyStateWithoutActionExample = () => (
  <EmptyState
    icon={<Bell className="w-8 h-8" />}
    title="No notifications"
    description="You're all caught up! We'll notify you when there's something new."
  />
);

/**
 * Example 3: Search Empty State
 * 
 * Use SearchEmptyState when search returns no results
 * Shows the search query, suggestions, and clear button
 */
export const SearchEmptyStateExample = () => {
  const [searchQuery, setSearchQuery] = useState('asprin'); // Intentional typo
  
  return (
    <SearchEmptyState
      searchQuery={searchQuery}
      onClearSearch={() => setSearchQuery('')}
      suggestions={['Aspirin', 'Metformin', 'Lisinopril']}
    />
  );
};

/**
 * Example 4: Search Empty State Without Suggestions
 * 
 * When you don't have suggestions to offer
 */
export const SearchEmptyStateNoSuggestionsExample = () => {
  const [searchQuery, setSearchQuery] = useState('xyz123');
  
  return (
    <SearchEmptyState
      searchQuery={searchQuery}
      onClearSearch={() => setSearchQuery('')}
    />
  );
};

/**
 * Example 5: Multiple Empty States in Different Sections
 * 
 * Different sections can have different empty states
 */
export const MultipleEmptyStatesExample = () => (
  <div className="space-y-8">
    {/* Medicines Section */}
    <div>
      <h2 className="text-xl font-bold mb-4">Medicines</h2>
      <EmptyState
        icon={<Pill className="w-8 h-8" />}
        title="No medicines"
        description="Add your first medicine to get started"
        action={{
          label: "Add Medicine",
          onClick: () => console.log('Add medicine'),
        }}
      />
    </div>
    
    {/* Prescriptions Section */}
    <div>
      <h2 className="text-xl font-bold mb-4">Prescriptions</h2>
      <EmptyState
        icon={<FileText className="w-8 h-8" />}
        title="No prescriptions"
        description="Upload a prescription to automatically extract medication details"
        action={{
          label: "Upload Prescription",
          onClick: () => console.log('Upload prescription'),
        }}
      />
    </div>
    
    {/* Orders Section */}
    <div>
      <h2 className="text-xl font-bold mb-4">Orders</h2>
      <EmptyState
        icon={<Package className="w-8 h-8" />}
        title="No orders"
        description="Track your medication orders and deliveries"
        action={{
          label: "Create Order",
          onClick: () => console.log('Create order'),
        }}
      />
    </div>
  </div>
);

/**
 * Example 6: Real-World Search Implementation
 * 
 * How to use SearchEmptyState in a real component with filtering
 */
export const RealWorldSearchExample = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data
  const allItems = [
    { id: 1, name: 'Aspirin' },
    { id: 2, name: 'Metformin' },
    { id: 3, name: 'Lisinopril' },
  ];
  
  // Filter items based on search
  const filteredItems = allItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Generate suggestions from all items (excluding current search)
  const suggestions = allItems
    .filter(item => !item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 3)
    .map(item => item.name);
  
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        />
      </div>
      
      {/* Results or Empty State */}
      {allItems.length === 0 ? (
        // No data at all - show basic empty state
        <EmptyState
          icon={<Pill className="w-8 h-8" />}
          title="No items"
          description="Add your first item to get started"
        />
      ) : filteredItems.length === 0 && searchQuery ? (
        // Search returned no results - show search empty state
        <SearchEmptyState
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
          suggestions={suggestions}
        />
      ) : (
        // Show results
        <div className="space-y-2">
          {filteredItems.map(item => (
            <div key={item.id} className="p-4 bg-gray-800 rounded-lg">
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Usage Guidelines:
 * 
 * 1. Use EmptyState for:
 *    - Empty lists (no medicines, no prescriptions, etc.)
 *    - Sections with no data
 *    - Onboarding screens
 * 
 * 2. Use SearchEmptyState for:
 *    - Search results with no matches
 *    - Filtered lists with no results
 *    - Any scenario where user input produces no results
 * 
 * 3. Best Practices:
 *    - Always provide helpful, actionable text
 *    - Include suggestions when possible
 *    - Make it easy to recover (clear search, add first item, etc.)
 *    - Use appropriate icons that match the context
 *    - Keep descriptions concise but informative
 * 
 * 4. Accessibility:
 *    - Both components include proper ARIA attributes
 *    - role="status" with aria-live="polite" for screen readers
 *    - Descriptive button labels
 *    - Proper heading hierarchy
 */

