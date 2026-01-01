# Responsive Design Guide

This document outlines the responsive design implementation for MedReminder Pro.

## Breakpoints

The application uses Tailwind CSS default breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: >= 1024px

## Layout Components

### Mobile (< 768px)
- **Navigation**: Bottom navigation bar with 5 main items
- **Layout**: Single-column layouts throughout
- **Touch Targets**: Minimum 44px (48px in elderly mode)
- **Sidebar**: Hidden, replaced by mobile menu overlay
- **Grid Layouts**: 1 column for most content

### Tablet (768px - 1024px)
- **Navigation**: Collapsible sidebar (icon-only or full)
- **Layout**: Two-column grids where appropriate
- **Touch Targets**: Minimum 44px (48px in elderly mode)
- **Sidebar**: Collapsible with toggle button
- **Grid Layouts**: 2 columns for cards, stats, and content

### Desktop (>= 1024px)
- **Navigation**: Full sidebar with icons and labels
- **Layout**: Three-column grids for optimal space usage
- **Sidebar**: Always visible with full labels
- **Grid Layouts**: 3-4 columns for cards and content

## Component Responsive Patterns

### Dashboard
- **Quick Stats**: 2 columns on mobile/tablet, 4 columns on desktop
- **Action Cards**: 1 column on mobile, 2 on tablet, 4 on desktop
- **Onboarding Tips**: 1 column on mobile, 3 on tablet/desktop

### History Table
- **Mobile**: Card-based layout with stacked information
- **Tablet/Desktop**: Full table view with all columns

### Settings
- **Profile Section**: Stacks vertically on mobile, horizontal on tablet/desktop
- **Invite Code**: Full-width button on mobile, inline on tablet/desktop

### Landing Page
- **Hero Section**: Responsive text sizes (4xl → 5xl → 6xl → 7xl)
- **Feature Grid**: 1 column on mobile, 2 on tablet, 3 on desktop
- **CTA Buttons**: Stack vertically on mobile, horizontal on tablet/desktop

## Responsive Utilities

The `src/lib/responsive-utils.ts` file provides hooks and utilities:

```typescript
// Hooks
useIsMobile()      // Returns true if < 768px
useIsTablet()      // Returns true if 768px - 1024px
useIsDesktop()     // Returns true if >= 1024px
useViewportType()  // Returns 'mobile' | 'tablet' | 'desktop'

// Utilities
getTouchTargetClass(elderlyMode)  // Returns min touch target classes
getResponsivePadding()             // Returns responsive padding classes
getResponsiveTextSize()            // Returns responsive text size classes
```

## Best Practices

1. **Always test on all three breakpoints** when implementing new features
2. **Use Tailwind responsive prefixes** (sm:, md:, lg:) consistently
3. **Ensure touch targets** are at least 44px on mobile/tablet
4. **Stack content vertically** on mobile, use grids on tablet/desktop
5. **Hide non-essential content** on mobile to reduce clutter
6. **Use card-based layouts** on mobile instead of tables
7. **Test with elderly mode** enabled to ensure proper scaling

## Testing Checklist

- [ ] Mobile (375px, 414px) - iPhone sizes
- [ ] Tablet (768px, 1024px) - iPad sizes
- [ ] Desktop (1280px, 1920px) - Common desktop sizes
- [ ] Elderly mode on all breakpoints
- [ ] Touch target sizes (minimum 44px)
- [ ] Content doesn't overflow or get cut off
- [ ] Navigation works smoothly on all sizes
- [ ] Forms are usable on mobile
- [ ] Tables/lists are readable on mobile
