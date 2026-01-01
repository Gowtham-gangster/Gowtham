import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names using clsx and tailwind-merge
 * Handles conditional classes and resolves Tailwind conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Responsive helper utilities
 */

/**
 * Check if viewport matches a specific breakpoint
 * @param breakpoint - The breakpoint to check ('sm' | 'md' | 'lg' | 'xl' | '2xl')
 * @returns boolean indicating if viewport is at or above the breakpoint
 */
export function isBreakpoint(breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'): boolean {
  if (typeof window === 'undefined') return false;
  
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };
  
  return window.innerWidth >= breakpoints[breakpoint];
}

/**
 * Check if device is mobile (< 768px)
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/**
 * Check if device is tablet (768px - 1024px)
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

/**
 * Check if device is desktop (>= 1024px)
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
}

/**
 * Get current device type
 * @returns 'mobile' | 'tablet' | 'desktop'
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
}

/**
 * Apply classes conditionally based on device type
 * @param classes - Object with device-specific classes
 * @returns Merged class string
 */
export function responsiveClasses(classes: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  default?: string;
}): string {
  const deviceType = getDeviceType();
  const deviceClass = classes[deviceType] || '';
  const defaultClass = classes.default || '';
  
  return cn(defaultClass, deviceClass);
}

/**
 * Format class names for elderly mode
 * Increases font sizes and spacing when elderly mode is active
 * @param baseClasses - Base class names
 * @param isElderlyMode - Whether elderly mode is active
 * @returns Merged class string with elderly mode adjustments
 */
export function elderlyModeClasses(baseClasses: string, isElderlyMode: boolean): string {
  if (!isElderlyMode) return baseClasses;
  
  // Map of base sizes to elderly mode sizes
  const fontSizeMap: Record<string, string> = {
    'text-xs': 'text-sm',
    'text-sm': 'text-base',
    'text-base': 'text-lg',
    'text-lg': 'text-xl',
    'text-xl': 'text-2xl',
    'text-2xl': 'text-3xl',
    'text-3xl': 'text-4xl',
  };
  
  const spacingMap: Record<string, string> = {
    'p-2': 'p-3',
    'p-3': 'p-4',
    'p-4': 'p-6',
    'py-2': 'py-3',
    'py-3': 'py-4',
    'px-3': 'px-4',
    'px-4': 'px-6',
    'h-10': 'h-14',
    'h-12': 'h-16',
  };
  
  // Split classes and replace each one individually to avoid cascading replacements
  const classes = baseClasses.split(' ');
  const adjustedClasses = classes.map(cls => {
    // Check font size map
    if (fontSizeMap[cls]) {
      return fontSizeMap[cls];
    }
    // Check spacing map
    if (spacingMap[cls]) {
      return spacingMap[cls];
    }
    // Return unchanged if no mapping found
    return cls;
  });
  
  return adjustedClasses.join(' ');
}

/**
 * Generate focus ring classes for accessibility
 * @param color - The color of the focus ring (default: 'violet')
 * @returns Focus ring class string
 */
export function focusRing(color: 'violet' | 'cyan' | 'magenta' = 'violet'): string {
  const colorMap = {
    violet: 'focus:ring-neon-violet focus:border-neon-violet',
    cyan: 'focus:ring-neon-cyan focus:border-neon-cyan',
    magenta: 'focus:ring-neon-magenta focus:border-neon-magenta',
  };
  
  return cn(
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary',
    colorMap[color]
  );
}

/**
 * Generate glow effect classes
 * @param color - The color of the glow effect
 * @param intensity - The intensity of the glow ('sm' | 'md' | 'lg')
 * @returns Glow effect class string
 */
export function glowEffect(
  color: 'violet' | 'cyan' | 'magenta' = 'violet',
  intensity: 'sm' | 'md' | 'lg' = 'md'
): string {
  const colorMap = {
    violet: 'shadow-glow',
    cyan: 'shadow-glow-cyan',
    magenta: 'shadow-glow-magenta',
  };
  
  return colorMap[color];
}

/**
 * Helper function to get icon size for elderly mode
 * @param baseSize - The base icon size (default: 20)
 * @param elderlyMode - Whether elderly mode is active
 * @returns The appropriate icon size (30% larger in elderly mode)
 */
export function elderlyIconSize(baseSize: number = 20, elderlyMode: boolean = false): number {
  return elderlyMode ? Math.round(baseSize * 1.3) : baseSize;
}

/**
 * Helper function to apply elderly mode responsive sizing to class names
 * @param baseClass - The base size class (e.g., 'text-base', 'h-10')
 * @param elderlyClass - The elderly mode size class (e.g., 'text-lg', 'h-12')
 * @param elderlyMode - Whether elderly mode is active
 * @returns The appropriate size class
 */
export function elderlySize(baseClass: string, elderlyClass: string, elderlyMode: boolean): string {
  return elderlyMode ? elderlyClass : baseClass;
}

