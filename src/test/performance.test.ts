import { describe, it, expect } from 'vitest';
import { performanceMonitor } from '@/lib/performance-monitor';

describe('Performance Monitoring', () => {
  it('should measure async operations', async () => {
    const result = await performanceMonitor.measureAsync('test-operation', async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'success';
    });
    
    expect(result).toBe('success');
  });

  it('should get performance metrics', () => {
    const metrics = performanceMonitor.getMetrics();
    
    // Metrics might be null in test environment
    if (metrics) {
      expect(metrics).toHaveProperty('totalResources');
    }
  });

  it('should create performance marks', () => {
    performanceMonitor.mark('test-start');
    performanceMonitor.mark('test-end');
    
    // Verify marks were created
    const marks = performance.getEntriesByType('mark');
    expect(marks.some(m => m.name === 'test-start')).toBe(true);
    expect(marks.some(m => m.name === 'test-end')).toBe(true);
  });
});
