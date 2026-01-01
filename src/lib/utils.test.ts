import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  cn,
  isMobile,
  isTablet,
  isDesktop,
  getDeviceType,
  responsiveClasses,
  elderlyModeClasses,
  focusRing,
  glowEffect,
} from './utils';

describe('Design System Utilities', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-base', 'text-white', 'bg-primary');
      expect(result).toContain('text-white');
      expect(result).toContain('bg-primary');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
    });

    it('should resolve Tailwind conflicts', () => {
      const result = cn('p-2', 'p-4');
      expect(result).toBe('p-4');
    });
  });

  describe('Responsive helpers', () => {
    beforeEach(() => {
      // Reset window mock
      vi.stubGlobal('window', { innerWidth: 1024 });
    });

    it('should detect mobile viewport', () => {
      vi.stubGlobal('window', { innerWidth: 375 });
      expect(isMobile()).toBe(true);
      expect(isTablet()).toBe(false);
      expect(isDesktop()).toBe(false);
    });

    it('should detect tablet viewport', () => {
      vi.stubGlobal('window', { innerWidth: 768 });
      expect(isMobile()).toBe(false);
      expect(isTablet()).toBe(true);
      expect(isDesktop()).toBe(false);
    });

    it('should detect desktop viewport', () => {
      vi.stubGlobal('window', { innerWidth: 1280 });
      expect(isMobile()).toBe(false);
      expect(isTablet()).toBe(false);
      expect(isDesktop()).toBe(true);
    });

    it('should return correct device type', () => {
      vi.stubGlobal('window', { innerWidth: 375 });
      expect(getDeviceType()).toBe('mobile');

      vi.stubGlobal('window', { innerWidth: 768 });
      expect(getDeviceType()).toBe('tablet');

      vi.stubGlobal('window', { innerWidth: 1280 });
      expect(getDeviceType()).toBe('desktop');
    });

    it('should apply responsive classes based on device type', () => {
      vi.stubGlobal('window', { innerWidth: 375 });
      const result = responsiveClasses({
        mobile: 'text-sm',
        tablet: 'text-base',
        desktop: 'text-lg',
      });
      expect(result).toContain('text-sm');
    });
  });

  describe('elderlyModeClasses', () => {
    it('should return base classes when elderly mode is disabled', () => {
      const result = elderlyModeClasses('text-base p-4', false);
      expect(result).toBe('text-base p-4');
    });

    it('should increase font sizes in elderly mode', () => {
      const result = elderlyModeClasses('text-base', true);
      expect(result).not.toContain('text-base');
      expect(result).toContain('text-lg');
    });

    it('should increase spacing in elderly mode', () => {
      const result = elderlyModeClasses('p-4', true);
      expect(result).not.toContain('p-4');
      expect(result).toContain('p-6');
    });

    it('should handle multiple size adjustments', () => {
      const result = elderlyModeClasses('text-sm p-2 py-3', true);
      expect(result).not.toContain('text-sm');
      expect(result).toContain('text-base');
      expect(result).not.toContain('p-2');
      expect(result).toContain('p-3');
      expect(result).toContain('py-4');
    });
  });

  describe('focusRing', () => {
    it('should generate violet focus ring by default', () => {
      const result = focusRing();
      expect(result).toContain('focus:ring-neon-violet');
      expect(result).toContain('focus:border-neon-violet');
    });

    it('should generate cyan focus ring', () => {
      const result = focusRing('cyan');
      expect(result).toContain('focus:ring-neon-cyan');
      expect(result).toContain('focus:border-neon-cyan');
    });

    it('should generate magenta focus ring', () => {
      const result = focusRing('magenta');
      expect(result).toContain('focus:ring-neon-magenta');
      expect(result).toContain('focus:border-neon-magenta');
    });
  });

  describe('glowEffect', () => {
    it('should generate violet glow by default', () => {
      const result = glowEffect();
      expect(result).toBe('shadow-glow');
    });

    it('should generate cyan glow', () => {
      const result = glowEffect('cyan');
      expect(result).toBe('shadow-glow-cyan');
    });

    it('should generate magenta glow', () => {
      const result = glowEffect('magenta');
      expect(result).toBe('shadow-glow-magenta');
    });
  });
});
