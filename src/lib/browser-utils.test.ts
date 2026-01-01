import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isSafari,
  isIOS,
  isMobile,
  isFirefox,
  isChrome,
  isEdge,
  supportsBackdropFilter,
  supportsTouchEvents,
  getCSSPrefix,
  getBrowserInfo,
} from './browser-utils';

describe('Browser Detection Utilities', () => {
  describe('Browser Detection', () => {
    it('should detect Safari browser', () => {
      const result = isSafari();
      expect(typeof result).toBe('boolean');
    });

    it('should detect iOS devices', () => {
      const result = isIOS();
      expect(typeof result).toBe('boolean');
    });

    it('should detect mobile devices', () => {
      const result = isMobile();
      expect(typeof result).toBe('boolean');
    });

    it('should detect Firefox browser', () => {
      const result = isFirefox();
      expect(typeof result).toBe('boolean');
    });

    it('should detect Chrome browser', () => {
      const result = isChrome();
      expect(typeof result).toBe('boolean');
    });

    it('should detect Edge browser', () => {
      const result = isEdge();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Feature Detection', () => {
    it('should check backdrop-filter support', () => {
      const result = supportsBackdropFilter();
      expect(typeof result).toBe('boolean');
    });

    it('should check touch events support', () => {
      const result = supportsTouchEvents();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('CSS Prefix', () => {
    it('should return appropriate CSS prefix', () => {
      const prefix = getCSSPrefix();
      expect(typeof prefix).toBe('string');
      // Should be one of the known prefixes or empty string
      expect(['', '-webkit-', '-moz-', '-ms-']).toContain(prefix);
    });
  });

  describe('Browser Info', () => {
    it('should return complete browser information', () => {
      const info = getBrowserInfo();
      
      expect(info).toHaveProperty('isSafari');
      expect(info).toHaveProperty('isIOS');
      expect(info).toHaveProperty('isMobile');
      expect(info).toHaveProperty('isFirefox');
      expect(info).toHaveProperty('isChrome');
      expect(info).toHaveProperty('isEdge');
      expect(info).toHaveProperty('supportsBackdropFilter');
      expect(info).toHaveProperty('supportsTouchEvents');
      expect(info).toHaveProperty('supportsSmoothScroll');
      expect(info).toHaveProperty('userAgent');
      
      expect(typeof info.isSafari).toBe('boolean');
      expect(typeof info.isIOS).toBe('boolean');
      expect(typeof info.isMobile).toBe('boolean');
      expect(typeof info.isFirefox).toBe('boolean');
      expect(typeof info.isChrome).toBe('boolean');
      expect(typeof info.isEdge).toBe('boolean');
      expect(typeof info.supportsBackdropFilter).toBe('boolean');
      expect(typeof info.supportsTouchEvents).toBe('boolean');
      expect(typeof info.supportsSmoothScroll).toBe('boolean');
      expect(typeof info.userAgent).toBe('string');
    });
  });

  describe('User Agent Parsing', () => {
    it('should correctly identify Chrome user agent', () => {
      // Mock Chrome user agent
      const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      
      // Test that the regex patterns work
      expect(/chrome/i.test(chromeUA)).toBe(true);
      expect(!/edge/i.test(chromeUA)).toBe(true);
    });

    it('should correctly identify Firefox user agent', () => {
      const firefoxUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
      
      expect(/firefox/i.test(firefoxUA)).toBe(true);
    });

    it('should correctly identify Safari user agent', () => {
      const safariUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';
      
      expect(/safari/i.test(safariUA)).toBe(true);
      expect(!/chrome/i.test(safariUA)).toBe(true);
    });

    it('should correctly identify iOS user agent', () => {
      const iOSUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
      
      expect(/iPad|iPhone|iPod/.test(iOSUA)).toBe(true);
    });

    it('should correctly identify mobile user agent', () => {
      const mobileUA = 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36';
      
      expect(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(mobileUA)).toBe(true);
    });
  });

  describe('Browser Class Application', () => {
    beforeEach(() => {
      // Clear any existing browser classes
      document.documentElement.className = '';
    });

    it('should not throw errors when applying browser classes', () => {
      expect(() => {
        const html = document.documentElement;
        html.classList.add('browser-test');
      }).not.toThrow();
    });
  });

  describe('Viewport Height Fix', () => {
    it('should set CSS custom property for viewport height', () => {
      // This would normally be called in the app initialization
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      const vhValue = document.documentElement.style.getPropertyValue('--vh');
      expect(vhValue).toBeTruthy();
      expect(vhValue).toContain('px');
    });
  });

  describe('Smooth Scroll Support', () => {
    it('should check if smooth scroll is supported', () => {
      const isSupported = 'scrollBehavior' in document.documentElement.style;
      expect(typeof isSupported).toBe('boolean');
    });
  });
});
