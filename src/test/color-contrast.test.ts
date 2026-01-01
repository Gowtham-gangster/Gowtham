import { describe, it, expect } from 'vitest';
import { designSystem } from '@/styles/design-system';

/**
 * Color Contrast Testing
 * Validates WCAG 2.1 AA compliance for color combinations
 * Requirement 12.3: All colors must meet minimum contrast ratios
 * - Normal text: 4.5:1
 * - Large text (≥18px): 3:1
 * - UI components: 3:1
 */

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// Calculate relative luminance
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio between two colors
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Color Contrast - WCAG 2.1 AA Compliance (Requirement 12.3)', () => {
  const darkBackground = designSystem.colors.background.primary; // #0a0a0f
  const secondaryBackground = designSystem.colors.background.secondary; // #1a1a2e

  describe('Text Contrast Ratios', () => {
    it('should have sufficient contrast for primary text on dark background', () => {
      const ratio = getContrastRatio(
        designSystem.colors.text.primary,
        darkBackground
      );
      
      // Primary text should exceed 4.5:1 for normal text
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Primary text contrast: ${ratio.toFixed(2)}:1`);
    });

    it('should have sufficient contrast for secondary text on dark background', () => {
      const ratio = getContrastRatio(
        designSystem.colors.text.secondary,
        darkBackground
      );
      
      // Secondary text should meet 4.5:1 for normal text
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Secondary text contrast: ${ratio.toFixed(2)}:1`);
    });

    it('should have sufficient contrast for tertiary text on dark background (large text only)', () => {
      const ratio = getContrastRatio(
        designSystem.colors.text.tertiary,
        darkBackground
      );
      
      // Tertiary text should meet 3:1 for large text (≥18px)
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`Tertiary text contrast: ${ratio.toFixed(2)}:1 (large text only)`);
    });
  });

  describe('Status Color Contrast', () => {
    it('should have sufficient contrast for success color', () => {
      const ratio = getContrastRatio(
        designSystem.colors.success,
        darkBackground
      );
      
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Success color contrast: ${ratio.toFixed(2)}:1`);
    });

    it('should have sufficient contrast for warning color', () => {
      const ratio = getContrastRatio(
        designSystem.colors.warning,
        darkBackground
      );
      
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Warning color contrast: ${ratio.toFixed(2)}:1`);
    });

    it('should have sufficient contrast for error color', () => {
      const ratio = getContrastRatio(
        designSystem.colors.error,
        darkBackground
      );
      
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Error color contrast: ${ratio.toFixed(2)}:1`);
    });

    it('should have sufficient contrast for info color', () => {
      const ratio = getContrastRatio(
        designSystem.colors.info,
        darkBackground
      );
      
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Info color contrast: ${ratio.toFixed(2)}:1`);
    });
  });

  describe('Primary Color Contrast', () => {
    it('should have sufficient contrast for cyan accent', () => {
      const ratio = getContrastRatio(
        designSystem.colors.primary.cyan,
        darkBackground
      );
      
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Cyan accent contrast: ${ratio.toFixed(2)}:1`);
    });

    it('should have sufficient contrast for violet accent', () => {
      const ratio = getContrastRatio(
        designSystem.colors.primary.violet,
        darkBackground
      );
      
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`Violet accent contrast: ${ratio.toFixed(2)}:1`);
    });

    it('should have sufficient contrast for magenta accent', () => {
      const ratio = getContrastRatio(
        designSystem.colors.primary.magenta,
        darkBackground
      );
      
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`Magenta accent contrast: ${ratio.toFixed(2)}:1`);
    });
  });

  describe('UI Component Contrast', () => {
    it('should have sufficient contrast for text on secondary background', () => {
      const ratio = getContrastRatio(
        designSystem.colors.text.primary,
        secondaryBackground
      );
      
      // Should meet 4.5:1 for normal text
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Text on secondary background: ${ratio.toFixed(2)}:1`);
    });

    it('should have minimum 3:1 contrast for UI components', () => {
      // Test border colors against backgrounds
      const borderColor = '#8b5cf6'; // violet-600
      const ratio = getContrastRatio(borderColor, darkBackground);
      
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`UI component border contrast: ${ratio.toFixed(2)}:1`);
    });
  });

  describe('Focus Indicator Contrast', () => {
    it('should have high contrast for focus indicators', () => {
      const focusColor = designSystem.colors.primary.cyan;
      const ratio = getContrastRatio(focusColor, darkBackground);
      
      // Focus indicators should have very high contrast
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`Focus indicator contrast: ${ratio.toFixed(2)}:1`);
    });
  });
});

describe('Color Contrast - Elderly Mode Considerations', () => {
  it('should maintain contrast ratios in elderly mode', () => {
    // Elderly mode increases font sizes but doesn't change colors
    // All contrast ratios remain the same, which is good
    const darkBackground = designSystem.colors.background.primary;
    const primaryText = designSystem.colors.text.primary;
    
    const ratio = getContrastRatio(primaryText, darkBackground);
    
    // Should still meet requirements
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

describe('Color Contrast - Edge Cases', () => {
  it('should handle white text on dark backgrounds', () => {
    const ratio = getContrastRatio('#ffffff', '#0a0a0f');
    
    // White on very dark should have excellent contrast
    expect(ratio).toBeGreaterThanOrEqual(15.0);
    console.log(`White on dark background: ${ratio.toFixed(2)}:1`);
  });

  it('should identify insufficient contrast combinations', () => {
    // Test a known poor contrast combination
    const ratio = getContrastRatio('#666666', '#555555');
    
    // This should fail WCAG AA
    expect(ratio).toBeLessThan(4.5);
    console.log(`Poor contrast example: ${ratio.toFixed(2)}:1 (fails WCAG AA)`);
  });
});
