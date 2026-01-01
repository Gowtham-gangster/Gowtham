import { describe, it, expect } from 'vitest';
import { 
  BREAKPOINTS, 
  getResponsiveColumns, 
  getTouchTargetClass, 
  getResponsivePadding,
  getResponsiveTextSize 
} from './responsive-utils';

describe('Responsive Utilities', () => {
  describe('BREAKPOINTS', () => {
    it('should have correct breakpoint values', () => {
      expect(BREAKPOINTS.sm).toBe(640);
      expect(BREAKPOINTS.md).toBe(768);
      expect(BREAKPOINTS.lg).toBe(1024);
      expect(BREAKPOINTS.xl).toBe(1280);
      expect(BREAKPOINTS['2xl']).toBe(1536);
    });
  });

  describe('getResponsiveColumns', () => {
    it('should return default column classes', () => {
      const result = getResponsiveColumns();
      expect(result).toBe('grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
    });

    it('should return custom column classes', () => {
      const result = getResponsiveColumns(1, 2, 4);
      expect(result).toBe('grid-cols-1 md:grid-cols-2 lg:grid-cols-4');
    });
  });

  describe('getTouchTargetClass', () => {
    it('should return 44px minimum for normal mode', () => {
      const result = getTouchTargetClass(false);
      expect(result).toBe('min-w-[44px] min-h-[44px]');
    });

    it('should return 48px minimum for elderly mode', () => {
      const result = getTouchTargetClass(true);
      expect(result).toBe('min-w-[48px] min-h-[48px]');
    });
  });

  describe('getResponsivePadding', () => {
    it('should return default responsive padding', () => {
      const result = getResponsivePadding();
      expect(result).toBe('p-4 md:p-6 lg:p-8');
    });

    it('should return custom responsive padding', () => {
      const result = getResponsivePadding('p-2', 'md:p-4', 'lg:p-6');
      expect(result).toBe('p-2 md:p-4 lg:p-6');
    });
  });

  describe('getResponsiveTextSize', () => {
    it('should return same size for normal mode', () => {
      expect(getResponsiveTextSize('text-base', false)).toBe('text-base');
      expect(getResponsiveTextSize('text-lg', false)).toBe('text-lg');
      expect(getResponsiveTextSize('text-xl', false)).toBe('text-xl');
    });

    it('should return larger size for elderly mode', () => {
      expect(getResponsiveTextSize('text-xs', true)).toBe('text-sm');
      expect(getResponsiveTextSize('text-sm', true)).toBe('text-base');
      expect(getResponsiveTextSize('text-base', true)).toBe('text-lg');
      expect(getResponsiveTextSize('text-lg', true)).toBe('text-xl');
      expect(getResponsiveTextSize('text-xl', true)).toBe('text-2xl');
      expect(getResponsiveTextSize('text-2xl', true)).toBe('text-3xl');
      expect(getResponsiveTextSize('text-3xl', true)).toBe('text-4xl');
    });

    it('should return original size if not in map', () => {
      expect(getResponsiveTextSize('text-custom', false)).toBe('text-custom');
      expect(getResponsiveTextSize('text-custom', true)).toBe('text-custom');
    });
  });
});
