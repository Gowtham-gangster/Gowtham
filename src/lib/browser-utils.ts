/**
 * Browser Detection and Compatibility Utilities
 * 
 * Provides utilities for detecting browser capabilities and applying
 * browser-specific fixes and workarounds.
 */

/**
 * Detect if the browser is Safari
 */
export const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

/**
 * Detect if the device is iOS
 */
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Detect if the device is mobile
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Detect if the browser is Firefox
 */
export const isFirefox = (): boolean => {
  return /firefox/i.test(navigator.userAgent);
};

/**
 * Detect if the browser is Chrome
 */
export const isChrome = (): boolean => {
  return /chrome/i.test(navigator.userAgent) && !/edge/i.test(navigator.userAgent);
};

/**
 * Detect if the browser is Edge
 */
export const isEdge = (): boolean => {
  return /edge/i.test(navigator.userAgent);
};

/**
 * Check if backdrop-filter is supported
 */
export const supportsBackdropFilter = (): boolean => {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
    return false;
  }
  
  return (
    CSS.supports('backdrop-filter', 'blur(10px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(10px)')
  );
};

/**
 * Check if touch events are supported
 */
export const supportsTouchEvents = (): boolean => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

/**
 * Get the appropriate CSS prefix for the current browser
 */
export const getCSSPrefix = (): string => {
  if (isFirefox()) return '-moz-';
  if (isSafari() || isIOS()) return '-webkit-';
  if (isChrome()) return '-webkit-';
  if (isEdge()) return '-ms-';
  return '';
};

/**
 * Apply browser-specific CSS class to document
 * This allows for browser-specific styling in CSS
 */
export const applyBrowserClass = (): void => {
  const html = document.documentElement;
  
  if (isSafari()) html.classList.add('browser-safari');
  if (isIOS()) html.classList.add('browser-ios');
  if (isFirefox()) html.classList.add('browser-firefox');
  if (isChrome()) html.classList.add('browser-chrome');
  if (isEdge()) html.classList.add('browser-edge');
  if (isMobile()) html.classList.add('browser-mobile');
  
  if (!supportsBackdropFilter()) {
    html.classList.add('no-backdrop-filter');
  }
};

/**
 * Fix iOS 100vh viewport issue
 * iOS Safari doesn't handle 100vh correctly due to the address bar
 */
export const fixIOSViewportHeight = (): void => {
  if (!isIOS()) return;
  
  const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', setViewportHeight);
};

/**
 * Prevent input zoom on iOS
 * iOS Safari zooms in when input font-size is less than 16px
 */
export const preventIOSInputZoom = (): void => {
  if (!isIOS()) return;
  
  const viewport = document.querySelector('meta[name=viewport]');
  if (viewport) {
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
    );
  }
};

/**
 * Check if smooth scroll is supported
 */
export const supportsSmoothScroll = (): boolean => {
  return 'scrollBehavior' in document.documentElement.style;
};

/**
 * Polyfill for smooth scroll
 */
export const smoothScrollTo = (element: HTMLElement, options?: ScrollToOptions): void => {
  if (supportsSmoothScroll()) {
    element.scrollTo(options || { behavior: 'smooth' });
  } else {
    // Fallback for browsers without smooth scroll
    element.scrollTo(options?.left || 0, options?.top || 0);
  }
};

/**
 * Get browser information
 */
export const getBrowserInfo = () => {
  return {
    isSafari: isSafari(),
    isIOS: isIOS(),
    isMobile: isMobile(),
    isFirefox: isFirefox(),
    isChrome: isChrome(),
    isEdge: isEdge(),
    supportsBackdropFilter: supportsBackdropFilter(),
    supportsTouchEvents: supportsTouchEvents(),
    supportsSmoothScroll: supportsSmoothScroll(),
    userAgent: navigator.userAgent,
  };
};

/**
 * Initialize all browser compatibility fixes
 */
export const initBrowserCompatibility = (): void => {
  applyBrowserClass();
  fixIOSViewportHeight();
  
  // Log browser info in development
  if (import.meta.env.DEV) {
    console.log('Browser Info:', getBrowserInfo());
  }
};
