# Design Document

## Overview

This design addresses the 404 error that occurs when refreshing pages on mobile orientation in the MedReminder application deployed on Vercel. The root cause is the absence of a `vercel.json` configuration file that tells Vercel to serve `index.html` for all client-side routes in this Single Page Application (SPA).

When a user navigates within the app using React Router, the routing happens client-side. However, when they refresh the page or directly access a URL like `/dashboard`, the browser makes a server request to Vercel. Without proper configuration, Vercel looks for a file at that path, doesn't find it, and returns a 404 error.

The solution is to create a `vercel.json` file with rewrite rules that redirect all non-asset requests to `index.html`, allowing React Router to handle the routing client-side.

## Architecture

### Problem Diagnosis

**Current Behavior (Without vercel.json):**
```
User refreshes /dashboard on mobile
    ↓
Browser requests: GET https://app.vercel.app/dashboard
    ↓
Vercel looks for file: dist/dashboard (doesn't exist)
    ↓
Returns: 404 Not Found
```

**Desired Behavior (With vercel.json):**
```
User refreshes /dashboard on mobile
    ↓
Browser requests: GET https://app.vercel.app/dashboard
    ↓
Vercel applies rewrite rule: /dashboard → /index.html
    ↓
Serves: dist/index.html (with React app)
    ↓
React Router reads URL: /dashboard
    ↓
Renders: Dashboard component
```

### Solution Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Vercel Request Handler                      │
│                                                              │
│  Incoming Request: /dashboard                               │
│         ↓                                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Check: Is this a static asset?                       │  │
│  │  (Has file extension: .js, .css, .png, etc.)         │  │
│  └──────────────────────────────────────────────────────┘  │
│         ↓                          ↓                        │
│       YES                         NO                        │
│         ↓                          ↓                        │
│  Serve asset directly      Apply rewrite rule              │
│  (e.g., /assets/main.js)   Serve /index.html              │
│                                    ↓                        │
│                            React Router handles route       │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Vercel Configuration Component

**File**: `vercel.json`

**Purpose**: Configures Vercel to handle SPA routing by rewriting all non-asset requests to index.html

**Configuration**:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**How It Works**:
- `source: "/(.*)"` - Matches all incoming requests
- `destination: "/index.html"` - Rewrites them to serve index.html
- Vercel automatically excludes static assets (files with extensions in /assets, /_next, etc.)
- This allows React Router to handle all routing client-side

**Why This Fixes the Mobile Issue**:
The 404 error on mobile refresh is not actually mobile-specific - it affects all devices. However, it may appear to work on desktop if:
1. Desktop users haven't refreshed deep routes
2. There's browser caching behavior differences
3. Testing methodology differs between devices

The vercel.json configuration ensures consistent behavior across all devices and orientations.

### 2. Existing Application Components (No Changes Needed)

**Files**: `src/App.tsx`, `vite.config.ts`, `package.json`

**Current State**: 
- React Router is properly configured with BrowserRouter
- Vite build configuration is correct
- All routes are defined correctly
- Build process generates proper static assets in `dist/` folder

**Why No Changes Are Needed**:
The application code is working correctly. The issue is purely a server configuration problem on Vercel's side. Once the vercel.json file is added, the existing application will work perfectly on all devices and orientations.

## Data Models

### Vercel Configuration Model

```typescript
interface VercelConfig {
  rewrites?: RewriteRule[];
  redirects?: RedirectRule[];
  headers?: HeaderRule[];
  buildCommand?: string;
  outputDirectory?: string;
  framework?: string;
}

interface RewriteRule {
  source: string;      // URL pattern to match (regex supported)
  destination: string; // Where to rewrite the request
}
```

**For This Fix**:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


Property 1: Route rewriting to index.html
*For any* client-side route path (e.g., /dashboard, /medicines, /settings), when a request is made to that path, the server should return index.html with a 200 status code, not a 404 error
**Validates: Requirements 1.1, 1.3, 3.3, 3.4**

Property 2: Device-agnostic routing behavior
*For any* route path and any device type (mobile, tablet, desktop) or orientation (portrait, landscape), the server should return identical responses for the same route
**Validates: Requirements 1.4, 2.4, 4.4**

Property 3: Static asset serving
*For any* static asset file (JavaScript, CSS, images, fonts, etc.) in the build output, when requested, the server should return the actual asset content directly without rewriting to index.html
**Validates: Requirements 2.3, 5.5**

## Error Handling

### Server-Side Error Handling

**404 Prevention**:
- The vercel.json rewrite rule prevents 404 errors by ensuring all non-asset requests receive index.html
- If index.html is missing from the build, Vercel will return a 500 error (build failure)

**Static Asset 404s**:
- If a static asset is missing, Vercel will correctly return 404
- This is expected behavior and indicates a build or deployment issue

### Client-Side Error Handling

**React Router Handling**:
- Once index.html loads, React Router takes over
- Unknown routes are handled by the catch-all `<Route path="*" element={<NotFound />} />`
- This provides a user-friendly 404 page for invalid routes

**Authentication Redirects**:
- Protected routes redirect to /login if user is not authenticated
- This happens client-side after the app loads

## Testing Strategy

### Manual Testing Approach

**Pre-Deployment Testing**:
1. Create vercel.json file locally
2. Build the application: `npm run build`
3. Test locally using `npm run preview` (Vite's preview server)
4. Verify routes work on refresh

**Post-Deployment Testing**:
1. Deploy to Vercel
2. Test all routes on mobile device:
   - Navigate to route using in-app navigation
   - Refresh the page
   - Verify no 404 error
3. Test all routes on desktop
4. Test with direct URL access (deep linking)
5. Test browser back/forward navigation

### Automated Testing

**Configuration Validation**:
- Unit test to verify vercel.json exists
- Unit test to verify vercel.json contains correct rewrite rule structure
- JSON schema validation

**Integration Testing**:
- E2E tests that navigate to routes and refresh
- Tests that verify static assets load correctly
- Tests that verify React Router handles unknown routes

### Test Cases

**Route Refresh Tests** (Examples to validate Property 1):
- Refresh / (landing page)
- Refresh /login
- Refresh /signup
- Refresh /dashboard
- Refresh /medicines
- Refresh /medicines/new
- Refresh /medicines/:id/edit (with actual ID)
- Refresh /history
- Refresh /settings
- Refresh /prescriptions
- Refresh /prescriptions/upload
- Refresh /caregiver
- Refresh /orders
- Refresh /orders-store
- Refresh /video-consultation
- Refresh /prescription-voice
- Refresh /integrations
- Refresh /chronic-diseases

**Static Asset Tests** (Examples to validate Property 3):
- Request /assets/index-[hash].js
- Request /assets/index-[hash].css
- Request /pdf-worker/pdf.worker.min.mjs
- Request any image files in /assets

**Device Consistency Tests** (Examples to validate Property 2):
- Test same route on iOS Safari mobile
- Test same route on Android Chrome mobile
- Test same route on desktop Chrome
- Compare responses - should be identical

## Implementation Notes

### Why This Is a Simple Fix

The fix requires only creating a single file (`vercel.json`) with 5 lines of JSON. No application code changes are needed because:

1. **React Router is already configured correctly** - BrowserRouter is set up properly
2. **Build process is working** - Vite generates correct static assets
3. **Routes are defined correctly** - All routes exist in App.tsx
4. **The issue is purely server configuration** - Vercel needs to know this is an SPA

### Vercel's Automatic Behavior

Vercel automatically:
- Detects Vite framework from package.json
- Runs `npm run build` command
- Serves files from `dist/` directory
- Excludes static assets from rewrites (files with extensions)
- Applies rewrites only to "clean" URLs (no file extension)

### Alternative Solutions (Not Recommended)

**Using redirects instead of rewrites**:
```json
{
  "redirects": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
This would work but changes the URL in the browser, breaking deep linking.

**Using HashRouter instead of BrowserRouter**:
This would work without server configuration but results in ugly URLs like `/#/dashboard` and breaks SEO.

**Using Vercel's framework detection**:
Vercel should auto-detect Vite, but explicit configuration is more reliable and self-documenting.

## Deployment Process

### Steps to Deploy Fix

1. **Create vercel.json** in project root
2. **Commit and push** to repository
3. **Vercel auto-deploys** (if connected to Git)
4. **Verify deployment** by testing routes on mobile

### Rollback Plan

If the fix causes issues:
1. Delete vercel.json
2. Commit and push
3. Vercel will redeploy without the configuration

### Monitoring

After deployment, monitor:
- Vercel deployment logs for any errors
- Application error tracking for client-side errors
- User reports of 404 errors (should be zero)

## Performance Considerations

### Impact on Performance

**Positive**:
- No performance impact - rewrites happen at CDN edge
- Vercel's rewrite engine is highly optimized
- Static assets still served directly from CDN

**Neutral**:
- Rewrite adds negligible latency (<1ms)
- No additional server processing required

### Caching

- Static assets remain cached with long TTLs
- index.html typically has short TTL (for updates)
- Rewrite rules don't affect caching behavior

## Security Considerations

### Security Impact

**No Security Concerns**:
- Rewrite rule doesn't expose any new endpoints
- Static assets remain protected by Vercel's security
- No sensitive data in configuration

**Optional Security Headers**:
Can add security headers to vercel.json:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

## Maintenance

### Long-Term Maintenance

**No Ongoing Maintenance Required**:
- vercel.json is a one-time configuration
- No updates needed unless routing strategy changes
- Works with all future application updates

### Documentation

Should document:
- Why vercel.json exists (SPA routing)
- What happens if it's removed (404 errors on refresh)
- How to test routing after deployment
