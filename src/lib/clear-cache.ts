/**
 * Utility functions to clear cache and storage data
 */

/**
 * Clear all localStorage data
 */
export const clearLocalStorage = () => {
  try {
    localStorage.clear();
    console.log('✅ localStorage cleared');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Clear all sessionStorage data
 */
export const clearSessionStorage = () => {
  try {
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
  }
};

/**
 * Clear all browser caches (service worker caches)
 */
export const clearBrowserCaches = async () => {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('✅ Browser caches cleared');
    }
  } catch (error) {
    console.error('Error clearing browser caches:', error);
  }
};

/**
 * Clear IndexedDB databases
 */
export const clearIndexedDB = async () => {
  try {
    if ('indexedDB' in window) {
      const databases = await indexedDB.databases();
      await Promise.all(
        databases.map(db => {
          if (db.name) {
            return new Promise((resolve, reject) => {
              const request = indexedDB.deleteDatabase(db.name!);
              request.onsuccess = () => resolve(true);
              request.onerror = () => reject(request.error);
            });
          }
          return Promise.resolve();
        })
      );
      console.log('✅ IndexedDB cleared');
    }
  } catch (error) {
    console.error('Error clearing IndexedDB:', error);
  }
};

/**
 * Clear all cookies
 */
export const clearCookies = () => {
  try {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const [name] = cookie.split('=');
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    console.log('✅ Cookies cleared');
  } catch (error) {
    console.error('Error clearing cookies:', error);
  }
};

/**
 * Clear ALL storage and cache data
 * This is a complete cleanup function
 */
export const clearAllData = async () => {
  console.log('🧹 Starting complete data cleanup...');
  
  clearLocalStorage();
  clearSessionStorage();
  clearCookies();
  await clearBrowserCaches();
  await clearIndexedDB();
  
  console.log('✅ All data cleared successfully!');
  console.log('💡 Tip: Refresh the page to see changes');
};

/**
 * Clear only authentication-related data
 */
export const clearAuthData = () => {
  try {
    // Clear JWT token
    localStorage.removeItem('auth_token');
    
    // Clear session restoration flag
    sessionStorage.removeItem('restore_session');
    
    // Clear Zustand persisted state
    localStorage.removeItem('medicine-reminder-storage');
    
    // Clear old local auth service data (if any)
    localStorage.removeItem('medreminder_credentials');
    localStorage.removeItem('medreminder_current_user');
    
    console.log('✅ Authentication data cleared');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Make functions available in browser console for manual clearing
if (typeof window !== 'undefined') {
  (window as any).clearAllData = clearAllData;
  (window as any).clearAuthData = clearAuthData;
  (window as any).clearLocalStorage = clearLocalStorage;
  (window as any).clearSessionStorage = clearSessionStorage;
  (window as any).clearBrowserCaches = clearBrowserCaches;
  (window as any).clearIndexedDB = clearIndexedDB;
  (window as any).clearCookies = clearCookies;
}
