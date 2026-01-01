# Accessibility Testing Checklist
## Quick Reference for Developers

Use this checklist when adding new features or components to ensure accessibility compliance.

---

## ✅ Keyboard Navigation

### Basic Requirements
- [ ] All interactive elements are reachable via Tab key
- [ ] Tab order follows logical visual flow
- [ ] Shift+Tab works for reverse navigation
- [ ] Enter key activates buttons and links
- [ ] Space key activates buttons and toggles checkboxes
- [ ] Escape key closes modals and dropdowns
- [ ] Arrow keys work in radio groups, selects, and menus
- [ ] No keyboard traps (can always tab out)

### Focus Indicators
- [ ] All focusable elements have visible focus indicators
- [ ] Focus indicators have high contrast (minimum 3:1)
- [ ] Focus indicators are not hidden by CSS
- [ ] Custom components maintain focus visibility

### Skip Navigation
- [ ] Skip to main content link is present
- [ ] Skip link is visible on keyboard focus
- [ ] Skip link works correctly

---

## ✅ ARIA Labels and Roles

### Semantic HTML
- [ ] Use proper heading hierarchy (h1, h2, h3, etc.)
- [ ] Use semantic elements (nav, main, article, section, footer)
- [ ] Use button elements for buttons (not divs)
- [ ] Use a elements for links
- [ ] Use proper list markup (ul, ol, li)

### ARIA Attributes
- [ ] Icon-only buttons have aria-label
- [ ] Form inputs have associated labels
- [ ] Error messages use role="alert"
- [ ] Loading states use aria-live="polite"
- [ ] Decorative icons have aria-hidden="true"
- [ ] Required fields have aria-required="true"
- [ ] Invalid fields have aria-invalid="true"
- [ ] Expandable elements have aria-expanded
- [ ] Controlled elements have aria-controls

### Dynamic Content
- [ ] Loading states are announced
- [ ] Success/error messages are announced
- [ ] Content updates are announced appropriately
- [ ] Use aria-live for dynamic regions

---

## ✅ Color Contrast

### Text Contrast
- [ ] Normal text (< 18px): Minimum 4.5:1 contrast ratio
- [ ] Large text (≥ 18px): Minimum 3:1 contrast ratio
- [ ] Bold text (≥ 14px): Minimum 3:1 contrast ratio

### UI Components
- [ ] Buttons: Minimum 3:1 contrast ratio
- [ ] Form borders: Minimum 3:1 contrast ratio
- [ ] Focus indicators: Minimum 3:1 contrast ratio
- [ ] Icons: Minimum 3:1 contrast ratio

### Testing Tools
- Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Run automated tests: `npm test -- src/test/color-contrast.test.ts --run`

---

## ✅ Forms

### Labels and Instructions
- [ ] All inputs have visible labels
- [ ] Labels are properly associated (for/id or wrapping)
- [ ] Required fields are marked visually and semantically
- [ ] Placeholder text is not used as labels
- [ ] Helper text provides clear instructions

### Error Handling
- [ ] Errors are displayed inline below fields
- [ ] Errors use role="alert" for screen readers
- [ ] Error messages are specific and helpful
- [ ] Fields with errors have aria-invalid="true"
- [ ] Error summary is shown at top of form
- [ ] Errors are announced to screen readers

### Validation
- [ ] Client-side validation provides immediate feedback
- [ ] Validation doesn't prevent form submission unnecessarily
- [ ] Success states are clearly indicated
- [ ] Loading states disable submit button

---

## ✅ Images and Icons

### Alt Text
- [ ] Meaningful images have descriptive alt text
- [ ] Decorative images have empty alt="" attribute
- [ ] Complex images have detailed descriptions
- [ ] Alt text is concise but descriptive

### Icons
- [ ] Icons with text labels are marked aria-hidden="true"
- [ ] Icon-only buttons have aria-label
- [ ] Icon meaning is clear from context or label
- [ ] Icons don't rely solely on color

---

## ✅ Touch Targets

### Size Requirements
- [ ] All interactive elements: Minimum 44px × 44px
- [ ] Elderly mode: Minimum 48px × 48px
- [ ] Buttons have adequate padding
- [ ] Links have adequate spacing

### Spacing
- [ ] Adequate space between interactive elements
- [ ] No overlapping touch targets
- [ ] Mobile-friendly spacing on small screens

---

## ✅ Responsive Design

### Breakpoints
- [ ] Mobile (< 768px): Single column, bottom nav
- [ ] Tablet (768px - 1024px): Two columns, collapsible sidebar
- [ ] Desktop (> 1024px): Three columns, full sidebar

### Zoom and Scaling
- [ ] Content readable at 200% zoom
- [ ] No horizontal scrolling at mobile sizes
- [ ] Text doesn't overflow containers
- [ ] Images scale appropriately

---

## ✅ Screen Reader Support

### Content Structure
- [ ] Headings create logical outline
- [ ] Landmarks identify page regions
- [ ] Lists are properly marked up
- [ ] Tables have proper headers

### Announcements
- [ ] Page title is descriptive
- [ ] Dynamic content changes are announced
- [ ] Loading states are announced
- [ ] Error messages are announced
- [ ] Success messages are announced

### Testing
- [ ] Test with NVDA (Windows)
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with TalkBack (Android)
- [ ] Verify all content is readable
- [ ] Verify navigation is logical

---

## ✅ Elderly Mode

### Font Sizes
- [ ] Base font increased from 16px to 20px
- [ ] Headings scale proportionally
- [ ] Line height increased by 1.5x
- [ ] Text remains readable

### Interactive Elements
- [ ] Buttons increased from 40px to 56px height
- [ ] Touch targets minimum 48px × 48px
- [ ] Icons increased by 30%
- [ ] Spacing increased appropriately

### Persistence
- [ ] Preference saved to localStorage
- [ ] Applied across all pages
- [ ] Toggle easily accessible
- [ ] Default state is normal mode

---

## ✅ Modals and Dialogs

### Focus Management
- [ ] Focus moves to modal when opened
- [ ] Focus is trapped within modal
- [ ] Tab cycles through modal elements
- [ ] Focus returns to trigger when closed

### Keyboard Support
- [ ] Escape key closes modal
- [ ] Enter key activates primary action
- [ ] Tab key navigates modal elements

### ARIA Attributes
- [ ] role="dialog" on modal container
- [ ] aria-modal="true" on modal
- [ ] aria-labelledby points to title
- [ ] aria-describedby points to description

---

## ✅ Loading States

### Visual Feedback
- [ ] Loading spinner or skeleton visible
- [ ] Submit buttons show loading state
- [ ] Buttons disabled during loading
- [ ] Loading text is descriptive

### Screen Reader Support
- [ ] Loading states use aria-live="polite"
- [ ] Loading text is announced
- [ ] Completion is announced
- [ ] Errors are announced

---

## 🔧 Testing Commands

### Run All Accessibility Tests
```bash
npm test -- src/test/accessibility.test.tsx --run
```

### Run Color Contrast Tests
```bash
npm test -- src/test/color-contrast.test.ts --run
```

### Run Keyboard Navigation Tests
```bash
npm test -- src/test/keyboard-navigation.test.tsx --run
```

### Run All Tests
```bash
npm test --run
```

---

## 📚 Resources

### Internal Documentation
- `/src/docs/accessibility-guidelines.md` - Complete guidelines
- `/src/styles/color-contrast-audit.md` - Color contrast details
- `/.kiro/specs/ui-ux-enhancement/ACCESSIBILITY_AUDIT_REPORT.md` - Latest audit

### External Resources
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Keyboard Accessibility](https://webaim.org/techniques/keyboard/)

---

## 🎯 Quick Tips

1. **Test with keyboard only** - Unplug your mouse and navigate
2. **Use browser dev tools** - Check accessibility tree
3. **Run automated tests** - Catch issues early
4. **Test with real users** - Get feedback from people with disabilities
5. **Document decisions** - Explain accessibility choices in code comments

---

**Remember:** Accessibility is not a one-time task. It's an ongoing commitment to inclusive design.
