import { describe, it, expect } from 'vitest';
import { designSystem } from './design-system';

describe('Design System Configuration', () => {
  describe('Colors', () => {
    it('should have primary color palette', () => {
      expect(designSystem.colors.primary.cyan).toBe('#00f5ff');
      expect(designSystem.colors.primary.violet).toBe('#8b5cf6');
      expect(designSystem.colors.primary.magenta).toBe('#ec4899');
    });

    it('should have status colors', () => {
      expect(designSystem.colors.success).toBe('#10b981');
      expect(designSystem.colors.warning).toBe('#f59e0b');
      expect(designSystem.colors.error).toBe('#ef4444');
      expect(designSystem.colors.info).toBe('#3b82f6');
    });

    it('should have background colors', () => {
      expect(designSystem.colors.background.primary).toBe('#0a0a0f');
      expect(designSystem.colors.background.secondary).toBe('#1a1a2e');
      expect(designSystem.colors.background.tertiary).toBe('#16213e');
    });

    it('should have text colors', () => {
      expect(designSystem.colors.text.primary).toBe('#ffffff');
      expect(designSystem.colors.text.secondary).toBe('#a0a0b0');
      expect(designSystem.colors.text.tertiary).toBe('#6b7280');
    });
  });

  describe('Typography', () => {
    it('should have font families', () => {
      expect(designSystem.typography.fontFamily.sans).toBe('Inter, system-ui, sans-serif');
      expect(designSystem.typography.fontFamily.mono).toBe('JetBrains Mono, monospace');
    });

    it('should have font sizes', () => {
      expect(designSystem.typography.fontSize.xs).toBe('0.75rem');
      expect(designSystem.typography.fontSize.base).toBe('1rem');
      expect(designSystem.typography.fontSize['3xl']).toBe('2rem');
    });

    it('should have font weights', () => {
      expect(designSystem.typography.fontWeight.normal).toBe(400);
      expect(designSystem.typography.fontWeight.medium).toBe(500);
      expect(designSystem.typography.fontWeight.semibold).toBe(600);
      expect(designSystem.typography.fontWeight.bold).toBe(700);
    });

    it('should have line heights', () => {
      expect(designSystem.typography.lineHeight.tight).toBe(1.25);
      expect(designSystem.typography.lineHeight.normal).toBe(1.5);
      expect(designSystem.typography.lineHeight.relaxed).toBe(1.75);
    });
  });

  describe('Spacing', () => {
    it('should have spacing scale', () => {
      expect(designSystem.spacing.xs).toBe('0.25rem');
      expect(designSystem.spacing.sm).toBe('0.5rem');
      expect(designSystem.spacing.md).toBe('1rem');
      expect(designSystem.spacing.lg).toBe('1.5rem');
      expect(designSystem.spacing.xl).toBe('2rem');
      expect(designSystem.spacing['2xl']).toBe('3rem');
      expect(designSystem.spacing['3xl']).toBe('4rem');
    });
  });

  describe('Border Radius', () => {
    it('should have border radius values', () => {
      expect(designSystem.borderRadius.sm).toBe('0.25rem');
      expect(designSystem.borderRadius.md).toBe('0.5rem');
      expect(designSystem.borderRadius.lg).toBe('0.75rem');
      expect(designSystem.borderRadius.xl).toBe('1rem');
      expect(designSystem.borderRadius.full).toBe('9999px');
    });
  });

  describe('Shadows', () => {
    it('should have shadow values', () => {
      expect(designSystem.shadows.sm).toBeDefined();
      expect(designSystem.shadows.md).toBeDefined();
      expect(designSystem.shadows.lg).toBeDefined();
      expect(designSystem.shadows.glow).toContain('rgba(139, 92, 246, 0.5)');
      expect(designSystem.shadows.glowCyan).toContain('rgba(0, 245, 255, 0.5)');
      expect(designSystem.shadows.glowMagenta).toContain('rgba(236, 72, 153, 0.5)');
    });
  });

  describe('Breakpoints', () => {
    it('should have breakpoint values', () => {
      expect(designSystem.breakpoints.sm).toBe('640px');
      expect(designSystem.breakpoints.md).toBe('768px');
      expect(designSystem.breakpoints.lg).toBe('1024px');
      expect(designSystem.breakpoints.xl).toBe('1280px');
      expect(designSystem.breakpoints['2xl']).toBe('1536px');
    });
  });

  describe('Animations', () => {
    it('should have animation durations', () => {
      expect(designSystem.animations.duration.fast).toBe('150ms');
      expect(designSystem.animations.duration.normal).toBe('200ms');
      expect(designSystem.animations.duration.slow).toBe('300ms');
    });

    it('should have easing functions', () => {
      expect(designSystem.animations.easing.easeIn).toBe('cubic-bezier(0.4, 0, 1, 1)');
      expect(designSystem.animations.easing.easeOut).toBe('cubic-bezier(0, 0, 0.2, 1)');
      expect(designSystem.animations.easing.easeInOut).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
    });
  });
});
