/**
 * Tests for elderly mode utility functions
 */

import { describe, it, expect } from 'vitest';
import { elderlyIconSize, elderlySize, elderlyModeClasses } from './utils';

describe('Elderly Mode Utilities', () => {
  describe('elderlyIconSize', () => {
    it('should return base size when elderly mode is disabled', () => {
      expect(elderlyIconSize(20, false)).toBe(20);
      expect(elderlyIconSize(24, false)).toBe(24);
    });

    it('should return 30% larger size when elderly mode is enabled', () => {
      expect(elderlyIconSize(20, true)).toBe(26); // 20 * 1.3 = 26
      expect(elderlyIconSize(24, true)).toBe(31); // 24 * 1.3 = 31.2, rounded to 31
    });

    it('should use default size of 20 when not specified', () => {
      expect(elderlyIconSize()).toBe(20);
      expect(elderlyIconSize(undefined, true)).toBe(26);
    });
  });

  describe('elderlySize', () => {
    it('should return base class when elderly mode is disabled', () => {
      expect(elderlySize('text-base', 'text-lg', false)).toBe('text-base');
      expect(elderlySize('h-10', 'h-14', false)).toBe('h-10');
    });

    it('should return elderly class when elderly mode is enabled', () => {
      expect(elderlySize('text-base', 'text-lg', true)).toBe('text-lg');
      expect(elderlySize('h-10', 'h-14', true)).toBe('h-14');
    });
  });

  describe('elderlyModeClasses', () => {
    it('should return base classes when elderly mode is disabled', () => {
      const baseClasses = 'text-base p-4 h-10';
      expect(elderlyModeClasses(baseClasses, false)).toBe(baseClasses);
    });

    it('should scale up font sizes when elderly mode is enabled', () => {
      expect(elderlyModeClasses('text-xs', true)).toBe('text-sm');
      expect(elderlyModeClasses('text-sm', true)).toBe('text-base');
      expect(elderlyModeClasses('text-base', true)).toBe('text-lg');
      expect(elderlyModeClasses('text-lg', true)).toBe('text-xl');
    });

    it('should scale up spacing when elderly mode is enabled', () => {
      expect(elderlyModeClasses('p-2', true)).toBe('p-3');
      expect(elderlyModeClasses('p-4', true)).toBe('p-6');
      expect(elderlyModeClasses('py-2', true)).toBe('py-3');
    });

    it('should scale up heights when elderly mode is enabled', () => {
      expect(elderlyModeClasses('h-10', true)).toBe('h-14');
      expect(elderlyModeClasses('h-12', true)).toBe('h-16');
    });

    it('should handle multiple classes correctly', () => {
      const result = elderlyModeClasses('text-base p-4 h-10', true);
      expect(result).toContain('text-lg');
      expect(result).toContain('p-6');
      expect(result).toContain('h-14');
    });

    it('should preserve unmapped classes', () => {
      const result = elderlyModeClasses('text-base custom-class', true);
      expect(result).toContain('text-lg');
      expect(result).toContain('custom-class');
    });
  });
});
