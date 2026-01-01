import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SkeletonLoader - Animated placeholder for loading content
 */
export interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SkeletonLoader = React.forwardRef<HTMLDivElement, SkeletonLoaderProps>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref}
      className={cn('animate-pulse bg-gray-700 rounded', className)}
      role="status"
      aria-label="Loading content"
      aria-live="polite"
      {...props}
    />
  )
);

SkeletonLoader.displayName = "SkeletonLoader";

/**
 * SpinnerLoader - Animated spinner with size variants
 */
export interface SpinnerLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const SpinnerLoader: React.FC<SpinnerLoaderProps> = ({ 
  size = 'md',
  className,
  label = 'Loading'
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <Loader2 
      className={cn('animate-spin text-violet-500', sizes[size], className)}
      role="status"
      aria-label={label}
    />
  );
};

SpinnerLoader.displayName = "SpinnerLoader";

/**
 * PageLoader - Full-page loading indicator
 */
export const PageLoader: React.FC = () => (
  <div 
    className="min-h-screen flex items-center justify-center bg-background-primary"
    role="status"
    aria-live="polite"
    aria-label="Loading page"
  >
    <div className="text-center">
      <SpinnerLoader size="lg" label="Loading page content" />
      <p className="mt-4 text-gray-400" aria-hidden="true">Loading...</p>
    </div>
  </div>
);

PageLoader.displayName = "PageLoader";

/**
 * ContentLoader - Section loading with skeleton placeholders
 */
export interface ContentLoaderProps {
  lines?: number;
  className?: string;
}

export const ContentLoader: React.FC<ContentLoaderProps> = ({ 
  lines = 4,
  className 
}) => (
  <div 
    className={cn("space-y-4", className)}
    role="status"
    aria-live="polite"
    aria-label="Loading content"
  >
    <SkeletonLoader className="h-8 w-1/3" aria-label="Loading title" />
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonLoader 
        key={index}
        className={cn(
          "h-4",
          index === 0 && "w-full",
          index === 1 && "w-5/6",
          index === 2 && "w-4/6",
          index >= 3 && "w-3/4"
        )}
        aria-label={`Loading line ${index + 1}`}
      />
    ))}
  </div>
);

ContentLoader.displayName = "ContentLoader";

/**
 * CardSkeleton - Skeleton loader for card components
 * Requirements: 13.5 - Skeleton loaders that match content structure
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("glass backdrop-blur-md bg-background-secondary/50 border border-white/10 rounded-xl p-6", className)}>
    <div className="flex items-start gap-4">
      <SkeletonLoader className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <SkeletonLoader className="h-6 w-3/4" />
        <SkeletonLoader className="h-4 w-1/2" />
        <SkeletonLoader className="h-4 w-full" />
      </div>
    </div>
  </div>
);

CardSkeleton.displayName = "CardSkeleton";

/**
 * MedicineCardSkeleton - Skeleton loader specifically for medicine cards
 * Requirements: 13.5 - Match medicine card structure
 */
export const MedicineCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("glass backdrop-blur-md bg-background-secondary/50 border border-white/10 rounded-xl p-4", className)}>
    <div className="flex items-start gap-4">
      {/* Pill icon skeleton */}
      <SkeletonLoader className="w-14 h-14 rounded-full flex-shrink-0" />
      
      <div className="flex-1 space-y-3">
        {/* Medicine name */}
        <SkeletonLoader className="h-6 w-2/3" />
        
        {/* Dosage info */}
        <div className="flex items-center gap-2">
          <SkeletonLoader className="h-4 w-4 rounded" />
          <SkeletonLoader className="h-4 w-24" />
        </div>
        
        {/* Next dose */}
        <div className="flex items-center gap-2 p-2 bg-background-tertiary/50 rounded-lg">
          <SkeletonLoader className="h-4 w-4 rounded" />
          <SkeletonLoader className="h-4 w-32" />
        </div>
        
        {/* Stock level */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <SkeletonLoader className="h-4 w-4 rounded" />
            <SkeletonLoader className="h-4 w-20" />
          </div>
          <SkeletonLoader className="h-2 w-full rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

MedicineCardSkeleton.displayName = "MedicineCardSkeleton";

/**
 * TableSkeleton - Skeleton loader for table rows
 * Requirements: 13.5 - Match table structure
 */
export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5, 
  columns = 4,
  className 
}) => (
  <div className={cn("space-y-3", className)}>
    {/* Header */}
    <div className="flex gap-4 pb-3 border-b border-gray-700">
      {Array.from({ length: columns }).map((_, index) => (
        <SkeletonLoader key={`header-${index}`} className="h-4 w-24" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex gap-4 py-3">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonLoader 
            key={`cell-${rowIndex}-${colIndex}`} 
            className={cn(
              "h-4",
              colIndex === 0 && "w-32",
              colIndex === 1 && "w-24",
              colIndex === 2 && "w-20",
              colIndex === 3 && "w-16"
            )}
          />
        ))}
      </div>
    ))}
  </div>
);

TableSkeleton.displayName = "TableSkeleton";

/**
 * FormSkeleton - Skeleton loader for form fields
 * Requirements: 13.5 - Match form structure
 */
export interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({ 
  fields = 4,
  className 
}) => (
  <div className={cn("space-y-6", className)}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <SkeletonLoader className="h-4 w-24" />
        <SkeletonLoader className="h-12 w-full rounded-lg" />
      </div>
    ))}
    <SkeletonLoader className="h-12 w-32 rounded-lg" />
  </div>
);

FormSkeleton.displayName = "FormSkeleton";

/**
 * DashboardSkeleton - Skeleton loader for dashboard layout
 * Requirements: 13.5 - Match dashboard structure
 */
export const DashboardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-6", className)}>
    {/* Greeting */}
    <SkeletonLoader className="h-8 w-64" />
    
    {/* Quick stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
    
    {/* Today's schedule */}
    <div className="space-y-4">
      <SkeletonLoader className="h-6 w-48" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <MedicineCardSkeleton key={index} />
        ))}
      </div>
    </div>
  </div>
);

DashboardSkeleton.displayName = "DashboardSkeleton";

/**
 * ListSkeleton - Generic list skeleton with items
 * Requirements: 13.5 - Match list structure
 */
export interface ListSkeletonProps {
  items?: number;
  showHeader?: boolean;
  className?: string;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ 
  items = 5,
  showHeader = true,
  className 
}) => (
  <div className={cn("space-y-4", className)}>
    {showHeader && <SkeletonLoader className="h-8 w-48" />}
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 p-4 glass rounded-lg">
          <SkeletonLoader className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader className="h-5 w-3/4" />
            <SkeletonLoader className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

ListSkeleton.displayName = "ListSkeleton";
