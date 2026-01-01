/**
 * Performance monitoring utilities for tracking app performance
 */

export const performanceMonitor = {
  /**
   * Measure component render time
   */
  measureRender: (componentName: string, callback: () => void) => {
    const start = performance.now();
    callback();
    const end = performance.now();
    const duration = end - start;
    
    if (duration > 16) { // More than one frame (60fps)
      console.warn(`[Performance] ${componentName} took ${duration.toFixed(2)}ms to render`);
    }
  },

  /**
   * Measure async operation time
   */
  measureAsync: async <T>(operationName: string, operation: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await operation();
      const end = performance.now();
      const duration = end - start;
      
      if (duration > 1000) { // More than 1 second
        console.warn(`[Performance] ${operationName} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;
      console.error(`[Performance] ${operationName} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  },

  /**
   * Get current performance metrics
   */
  getMetrics: () => {
    if (!performance.getEntriesByType) {
      return null;
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    return {
      // Page load metrics
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
      loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
      
      // Paint metrics
      firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime,
      firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
      
      // Resource timing
      totalResources: performance.getEntriesByType('resource').length,
    };
  },

  /**
   * Log performance metrics to console
   */
  logMetrics: () => {
    const metrics = performanceMonitor.getMetrics();
    if (metrics) {
      console.table(metrics);
    }
  },

  /**
   * Mark a custom performance point
   */
  mark: (name: string) => {
    performance.mark(name);
  },

  /**
   * Measure between two marks
   */
  measure: (name: string, startMark: string, endMark: string) => {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
    } catch (error) {
      console.error(`[Performance] Failed to measure ${name}`, error);
    }
  },
};

/**
 * React hook for measuring component mount time
 */
export const usePerformanceMonitor = (componentName: string) => {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    const mountTime = performance.now();
    
    return () => {
      const unmountTime = performance.now();
      const duration = unmountTime - mountTime;
      
      if (duration > 100) {
        console.warn(`[Performance] ${componentName} was mounted for ${duration.toFixed(2)}ms`);
      }
    };
  }
  
  return () => {};
};
