# Cache Clearing Guide

This guide explains how to clear cached and stored data in the MedReminder Pro application.

## Automatic Cleanup (One-Time)

The application includes a one-time cleanup function that runs on first load. To enable it:

1. Open `src/App.tsx`
2. Find the `performCleanup` function
3. Uncomment the line: `// performCleanup();`
4. Save and reload the application
5. The cleanup will run once and reload the page
6. Comment out the line again to prevent repeated cleanups

## Manual Cleanup via Browser Console

The application exposes several functions in the browser console for manual cache clearing:

### Clear All Data (Complete Cleanup)
```javascript
clearAllData()
```
This clears:
- localStorage
- sessionStorage
- Browser caches
- IndexedDB
- Cookies

### Clear Only Authentication Data
```javascript
clearAuthData()
```
This clears:
- JWT token
- Session restoration flag
- Zustand persisted state

### Clear Specific Storage Types
```javascript
clearLocalStorage()      // Clear localStorage only
clearSessionStorage()    // Clear sessionStorage only
clearBrowserCaches()     // Clear service worker caches
clearIndexedDB()         // Clear IndexedDB databases
clearCookies()           // Clear all cookies
```

## Manual Cleanup via Browser DevTools

### Method 1: Application Tab (Chrome/Edge)
1. Open DevTools (F12)
2. Go to "Application" tab
3. Under "Storage" section:
   - Click "Clear site data"
   - Or manually clear:
     - Local Storage
     - Session Storage
     - IndexedDB
     - Cookies
     - Cache Storage

### Method 2: Clear Browsing Data
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select:
   - Cached images and files
   - Cookies and other site data
3. Choose "All time" for time range
4. Click "Clear data"

## What Gets Cleared

### localStorage
- `auth_token` - JWT authentication token
- `medicine-reminder-storage` - Zustand persisted state (user data, medicines, schedules, etc.)

### sessionStorage
- `restore_session` - Session restoration flag
- `cleanup_done` - One-time cleanup flag
- `cache_cleared` - Cache clearing flag

### Browser Caches
- Service worker caches
- HTTP cache
- Image cache

### IndexedDB
- Any IndexedDB databases created by the app

### Cookies
- All cookies set by the application

## After Clearing Cache

1. **Refresh the page** to see changes
2. **You will be logged out** (if you were logged in)
3. **All local data will be lost** (medicines, schedules, etc.)
4. **You'll need to log in again** to access the application

## Troubleshooting

### Cache Not Clearing
- Try hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Close all browser tabs with the app open
- Clear browser data manually via DevTools
- Try in incognito/private mode

### Data Still Persisting
- Check if service workers are active (Application > Service Workers)
- Unregister service workers if present
- Clear all site data via Application tab
- Restart the browser

## Development Notes

### Disable Auto-Cleanup
The auto-cleanup is commented out by default. To keep it disabled:
- Keep the `performCleanup()` line commented in `src/App.tsx`

### Enable Auto-Cleanup for Testing
To test the cleanup functionality:
1. Uncomment `performCleanup()` in `src/App.tsx`
2. Reload the app
3. Check console for cleanup messages
4. Comment it out again after testing

### Custom Cleanup Logic
You can modify the cleanup functions in `src/lib/clear-cache.ts` to:
- Preserve specific data
- Add custom cleanup logic
- Log cleanup operations
- Handle errors differently

## Security Note

Clearing cache and storage will:
- ✅ Log you out of the application
- ✅ Remove all locally stored data
- ✅ Clear authentication tokens
- ✅ Reset the application to initial state

This is useful for:
- Testing fresh installations
- Debugging authentication issues
- Removing old/corrupted data
- Privacy and security cleanup
