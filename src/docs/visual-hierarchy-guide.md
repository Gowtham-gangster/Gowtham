# Visual Hierarchy Guide

This guide explains the visual hierarchy utilities implemented for the UI/UX Enhancement feature.

## Heading Hierarchy (Requirement 10.1)

Consistent heading sizes with proper semantic HTML:

- **H1**: 32px (2rem) - Page titles
- **H2**: 24px (1.5rem) - Section headings
- **H3**: 20px (1.25rem) - Subsection headings
- **H4**: 18px (1.125rem) - Component headings
- **H5**: 16px (1rem) - Small headings
- **H6**: 14px (0.875rem) - Tiny headings

### Usage

```tsx
<h1>Page Title</h1>
<h2>Section Heading</h2>
<h3>Subsection Heading</h3>
<h4>Component Heading</h4>
```

All headings automatically have:
- Bold font weight
- White text color
- Appropriate line height
- Bottom margin for spacing

## Consistent Spacing (Requirement 10.2)

### Section Padding

- `.section-padding` - 32px padding (standard)
- `.section-padding-sm` - 24px padding (compact)
- `.section-padding-lg` - 48px padding (spacious)

### Element Margin

- `.element-margin` - 16px bottom margin (standard)
- `.element-margin-sm` - 8px bottom margin (compact)
- `.element-margin-lg` - 24px bottom margin (spacious)

### Usage

```tsx
<div className="section-padding">
  <h2 className="element-margin">Section Title</h2>
  <p className="element-margin">Content paragraph</p>
</div>
```

## Visual Emphasis (Requirement 10.3)

### Text Emphasis Classes

- `.text-emphasis` - Bold white text
- `.text-emphasis-accent` - Bold primary color text
- `.text-emphasis-secondary` - Bold secondary color text
- `.text-emphasis-success` - Bold success color text
- `.text-emphasis-warning` - Bold warning color text
- `.text-emphasis-error` - Bold error color text

### Critical and Important Text

- `.text-critical` - Extra large bold text with glow effect
- `.text-important` - Large semibold text in primary color

### Usage

```tsx
<p className="text-emphasis">Important information</p>
<p className="text-emphasis-accent">Highlighted with accent color</p>
<p className="text-critical">Critical alert message</p>
```

## Lists and Tables (Requirements 10.4, 10.5)

### List Utilities

- `.list-separated` - Adds borders between list items
- `.list-spaced` - Adds spacing between list items

### Table Utilities

- `.table-striped` - Alternating row colors
- `.table-hover` - Hover effect on rows
- `.table-header` - Styled table headers
- `.table-cell` - Styled table cells

### Usage

```tsx
// Lists
<ul className="list-separated">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>

// Tables
<Table className="table-striped table-hover">
  <TableHeader>
    <TableRow>
      <TableHead className="table-header">Column 1</TableHead>
      <TableHead className="table-header">Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="table-cell">Data 1</TableCell>
      <TableCell className="table-cell">Data 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Examples

### Page Layout with Visual Hierarchy

```tsx
<div className="section-padding">
  <h1 className="element-margin-lg">Dashboard</h1>
  
  <div className="element-margin">
    <h2 className="element-margin">Today's Schedule</h2>
    <p className="text-emphasis-accent">3 doses due today</p>
  </div>
  
  <div className="element-margin">
    <h3 className="element-margin-sm">Medications</h3>
    <ul className="list-spaced">
      <li>Aspirin - 8:00 AM</li>
      <li>Metformin - 12:00 PM</li>
      <li>Lisinopril - 8:00 PM</li>
    </ul>
  </div>
</div>
```

### Table with Visual Hierarchy

```tsx
<div className="section-padding">
  <h2 className="element-margin">Dose History</h2>
  
  <Table className="table-striped table-hover">
    <TableHeader>
      <TableRow>
        <TableHead className="table-header">Date</TableHead>
        <TableHead className="table-header">Medicine</TableHead>
        <TableHead className="table-header">Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell className="table-cell">Jan 1, 2026</TableCell>
        <TableCell className="table-cell">Aspirin</TableCell>
        <TableCell className="table-cell">
          <span className="text-emphasis-success">Taken</span>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

## Best Practices

1. **Use semantic HTML**: Always use the appropriate heading level (h1-h6) based on document structure
2. **Maintain hierarchy**: Don't skip heading levels (e.g., don't go from h1 to h3)
3. **Consistent spacing**: Use the spacing utilities consistently throughout the app
4. **Visual emphasis**: Use emphasis classes sparingly for truly important information
5. **Table styling**: Apply table utilities to all data tables for consistency
6. **Accessibility**: Proper heading hierarchy improves screen reader navigation

## Elderly Mode

All visual hierarchy styles automatically scale up in elderly mode:
- Headings increase by 25%
- Spacing increases proportionally
- Text emphasis remains clear and readable
