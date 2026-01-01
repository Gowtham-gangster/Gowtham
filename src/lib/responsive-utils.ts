/**
 * Responsive utility functions and hooks for mobile, tablet, and desktop layouts
 */

import { useEffect, useState } from 'react';

// Breakpoint constants matching Tailwind defaults
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Hook to detect current screen size
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

/**
 * Hook to detect if viewport is mobile (< 768px)
 */
export const useIsMobile = (): boolean => {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`);
};

/**
 * Hook to detect if viewport is tablet (768px - 1024px)
 */
export const useIsTablet = (): boolean => {
  return useMediaQuery(
    `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`
  );
};

/**
 * Hook to detect if viewport is desktop (>= 1024px)
 */
export const useIsDesktop = (): boolean => {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
};

/**
 * Hook to get current viewport type
 */
export const useViewportType = (): 'mobile' | 'tablet' | 'desktop' => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
};

/**
 * Utility to get responsive grid columns based on viewport
 */
export const getResponsiveColumns = (
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3
): string => {
  return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`;
};

/**
 * Utility to ensure minimum touch target size (44px for mobile)
 */
export const getTouchTargetClass = (elderlyMode: boolean = false): string => {
  return elderlyMode ? 'min-w-[48px] min-h-[48px]' : 'min-w-[44px] min-h-[44px]';
};

/**
 * Utility to get responsive padding
 */
export const getResponsivePadding = (
  mobile: string = 'p-4',
  tablet: string = 'md:p-6',
  desktop: string = 'lg:p-8'
): string => {
  return `${mobile} ${tablet} ${desktop}`;
};

/**
 * Utility to get responsive text size
 */
export const getResponsiveTextSize = (
  base: string,
  elderlyMode: boolean = false
): string => {
  const sizeMap: Record<string, string> = {
    'text-xs': elderlyMode ? 'text-sm' : 'text-xs',
    'text-sm': elderlyMode ? 'text-base' : 'text-sm',
    'text-base': elderlyMode ? 'text-lg' : 'text-base',
    'text-lg': elderlyMode ? 'text-xl' : 'text-lg',
    'text-xl': elderlyMode ? 'text-2xl' : 'text-xl',
    'text-2xl': elderlyMode ? 'text-3xl' : 'text-2xl',
    'text-3xl': elderlyMode ? 'text-4xl' : 'text-3xl',
  };
  
  return sizeMap[base] || base;
};
