/**
 * Animation utility classes and helpers
 * Requirements: 13.2 - Hover and interaction animations
 */

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation duration based on user preference
 */
export const getAnimationDuration = (normalDuration: number) => {
  return prefersReducedMotion() ? 0 : normalDuration;
};

/**
 * Common animation class names for hover effects
 */
export const hoverAnimations = {
  // Scale up slightly on hover
  scale: 'hover:scale-105 transition-transform duration-200',
  
  // Scale down on press
  press: 'active:scale-95 transition-transform duration-100',
  
  // Lift effect (scale + translate) - uses transform for better performance
  lift: 'hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 will-change-transform',
  
  // Glow effect
  glow: 'hover:shadow-glow transition-shadow duration-300',
  
  // Brightness increase
  brighten: 'hover:brightness-110 transition-all duration-200',
  
  // Opacity change - uses opacity for better performance
  fade: 'hover:opacity-80 transition-opacity duration-200 will-change-opacity',
  
  // Combined scale and glow
  scaleGlow: 'hover:scale-105 hover:shadow-glow transition-all duration-300 will-change-transform',
  
  // Rotate slightly
  rotate: 'hover:rotate-2 transition-transform duration-200',
} as const;

/**
 * Pulsing animation classes for urgent items
 */
export const pulseAnimations = {
  // Soft pulse (opacity)
  soft: 'animate-pulse-soft',
  
  // Glow pulse (shadow)
  glow: 'animate-pulse-glow',
  
  // Border pulse
  border: 'animate-pulse-border',
  
  // Gentle bounce
  bounce: 'animate-bounce-gentle',
  
  // Float effect
  float: 'animate-float',
} as const;

/**
 * Entry animation classes
 */
export const entryAnimations = {
  // Fade in
  fadeIn: 'animate-fade-in',
  
  // Slide up
  slideUp: 'animate-slide-up',
  
  // Slide in from right
  slideInRight: 'animate-slide-in-right',
} as const;

/**
 * Helper function to combine animation classes
 */
export const combineAnimations = (...animations: string[]) => {
  return animations.filter(Boolean).join(' ');
};

/**
 * Helper to add staggered animation delay
 */
export const getStaggerDelay = (index: number, baseDelay: number = 50) => {
  return {
    animationDelay: `${index * baseDelay}ms`,
  };
};

/**
 * Framer Motion variants for common animations
 */
export const motionVariants = {
  // Fade in/out
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  // Slide up
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  
  // Scale
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  
  // Slide from right
  slideRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  
  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
} as const;

/**
 * Transition configurations optimized for performance
 */
export const transitions = {
  fast: { 
    duration: getAnimationDuration(0.15), 
    ease: [0.4, 0, 1, 1] 
  },
  normal: { 
    duration: getAnimationDuration(0.2), 
    ease: [0.4, 0, 0.2, 1] 
  },
  slow: { 
    duration: getAnimationDuration(0.3), 
    ease: [0.4, 0, 0.2, 1] 
  },
  spring: { 
    type: 'spring' as const, 
    stiffness: 300, 
    damping: 30 
  },
} as const;

/**
 * Performance-optimized animation config for Framer Motion
 */
export const optimizedAnimationConfig = {
  // Use GPU-accelerated properties only
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: transitions.fast,
  // Reduce layout thrashing
  layout: false,
  // Use transform instead of position
  layoutId: undefined,
};
