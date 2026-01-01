import * as React from "react";
import { ButtonEnhanced } from "./button-enhanced";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchEmptyStateProps {
  searchQuery: string;
  onClearSearch: () => void;
  suggestions?: string[];
  className?: string;
}

/**
 * SearchEmptyState - Display when search returns no results
 * Shows "no results" message, suggests alternative search terms, and provides option to clear filters
 * 
 * Validates: Requirements 14.4, 14.5
 */
export const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({
  searchQuery,
  onClearSearch,
  suggestions = [],
  className,
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <div 
        className="w-16 h-16 rounded-full bg-gray-700/20 flex items-center justify-center mb-4 text-gray-400"
        aria-hidden="true"
      >
        <Search className="w-8 h-8" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-white mb-2">
        No results found
      </h3>

      {/* Description with search query */}
      <p className="text-gray-400 mb-6 max-w-md">
        We couldn't find any matches for{" "}
        <span className="text-white font-medium">"{searchQuery}"</span>
      </p>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6 max-w-md">
          <p className="text-sm text-gray-400 mb-3">Try searching for:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  // This would typically trigger a new search with the suggestion
                  // For now, we'll just clear and let the parent handle it
                  onClearSearch();
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm",
                  "bg-violet-600/20 text-violet-400",
                  "border border-violet-600/30",
                  "hover:bg-violet-600/30 hover:border-violet-600/50",
                  "transition-all duration-200"
                )}
                aria-label={`Search for ${suggestion}`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear search button */}
      <ButtonEnhanced 
        onClick={onClearSearch}
        variant="outline"
        leftIcon={<X className="w-5 h-5" />}
        aria-label="Clear search"
      >
        Clear Search
      </ButtonEnhanced>

      {/* Additional help text */}
      <p className="text-sm text-gray-500 mt-6 max-w-md">
        💡 <strong className="text-gray-400">Tip:</strong> Try using different keywords or check your spelling
      </p>
    </div>
  );
};

SearchEmptyState.displayName = "SearchEmptyState";
