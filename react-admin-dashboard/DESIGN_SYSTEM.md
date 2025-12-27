# OneBus Admin Dashboard - Design System

## Overview

The OneBus Admin Dashboard features a modern, clean design system built with warm red-based tones, rounded typography, and contemporary UI elements. The design emphasizes energy, confidence, and engagement while maintaining excellent readability and accessibility.

## Design Principles

### 1. **Modern & Clean**
- Minimalist approach with focus on content
- Generous white space and consistent spacing
- Clean lines and rounded elements

### 2. **Warm & Energetic**
- Red-based color palette conveying energy and confidence
- Warm gradients and subtle color transitions
- Engaging visual hierarchy

### 3. **Accessible & Inclusive**
- High contrast ratios for readability
- Keyboard navigation support
- Screen reader compatibility
- Reduced motion support

### 4. **Responsive & Adaptive**
- Mobile-first design approach
- Flexible layouts that work on all screen sizes
- Touch-friendly interaction targets

## Color Palette

### Primary Colors (Red-based)
```css
--color-primary-50: #fef2f2
--color-primary-100: #fee2e2
--color-primary-200: #fecaca
--color-primary-300: #fca5a5
--color-primary-400: #f87171
--color-primary-500: #ef4444  /* Main red */
--color-primary-600: #dc2626
--color-primary-700: #b91c1c
--color-primary-800: #991b1b
--color-primary-900: #7f1d1d
```

### Secondary Colors (Warm Orange)
```css
--color-secondary-50: #fff7ed
--color-secondary-100: #ffedd5
--color-secondary-200: #fed7aa
--color-secondary-300: #fdba74
--color-secondary-400: #fb923c
--color-secondary-500: #f97316  /* Warm orange */
--color-secondary-600: #ea580c
--color-secondary-700: #c2410c
--color-secondary-800: #9a3412
--color-secondary-900: #7c2d12
```

### Neutral Colors
```css
--color-neutral-50: #fafafa
--color-neutral-100: #f5f5f5
--color-neutral-200: #e5e5e5
--color-neutral-300: #d4d4d4
--color-neutral-400: #a3a3a3
--color-neutral-500: #737373
--color-neutral-600: #525252
--color-neutral-700: #404040
--color-neutral-800: #262626
--color-neutral-900: #171717
```

## Typography

### Font Family
- **Primary**: Inter (modern, rounded sans-serif)
- **Fallback**: SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto

### Type Scale
- **H1**: 2.5rem (40px) - Bold, -0.02em letter-spacing
- **H2**: 2rem (32px) - SemiBold, -0.01em letter-spacing
- **H3**: 1.75rem (28px) - SemiBold, -0.01em letter-spacing
- **H4**: 1.5rem (24px) - SemiBold
- **H5**: 1.25rem (20px) - SemiBold
- **H6**: 1.125rem (18px) - SemiBold
- **Body1**: 1rem (16px) - Regular, 1.6 line-height
- **Body2**: 0.875rem (14px) - Regular, 1.5 line-height
- **Caption**: 0.75rem (12px) - Regular, 1.4 line-height

### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **SemiBold**: 600
- **Bold**: 700
- **ExtraBold**: 800

## Spacing System

### Design Tokens
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-xxl: 48px
```

### Usage Guidelines
- Use consistent spacing multiples of 4px
- Apply generous padding for touch targets (minimum 44px)
- Maintain consistent margins between sections

## Border Radius

### Radius Scale
```css
--radius-sm: 8px    /* Small elements */
--radius-md: 12px   /* Default buttons, inputs */
--radius-lg: 16px   /* Cards, containers */
--radius-xl: 20px   /* Large containers */
--radius-round: 50px /* Pills, avatars */
```

## Shadows & Elevation

### Shadow System
```css
--shadow-soft: 0 2px 8px rgba(220, 0, 78, 0.08)
--shadow-medium: 0 4px 16px rgba(220, 0, 78, 0.12)
--shadow-strong: 0 8px 32px rgba(220, 0, 78, 0.16)
```

### Usage
- **Soft**: Subtle elevation for cards
- **Medium**: Interactive elements on hover
- **Strong**: Modals, dropdowns, important elements

## Animation & Transitions

### Timing Functions
```css
--transition-fast: 0.15s ease-in-out
--transition-medium: 0.25s ease-in-out
--transition-slow: 0.35s ease-in-out
```

### Animation Principles
- Use smooth, natural transitions
- Respect user's motion preferences
- Provide visual feedback for interactions

## Component Library

### Core Components

#### 1. **ModernButton**
```tsx
<ModernButton variant="primary" icon={<Icon />}>
  Button Text
</ModernButton>
```

**Variants:**
- `primary` - Main action button with gradient
- `secondary` - Secondary actions
- `outline` - Outlined style
- `ghost` - Minimal style
- `gradient` - Special gradient effect

#### 2. **ModernCard**
```tsx
<ModernCard title="Card Title" variant="default">
  Card content
</ModernCard>
```

**Variants:**
- `default` - Standard card
- `gradient` - Subtle gradient background
- `glass` - Glass morphism effect
- `elevated` - Enhanced shadow

#### 3. **StatsCard**
```tsx
<StatsCard
  title="Total Users"
  value="1,234"
  icon={<UsersIcon />}
  change={12}
  changeLabel="vs last month"
/>
```

#### 4. **ThemeToggle**
```tsx
<ThemeToggle variant="icon" size="medium" />
```

**Variants:**
- `icon` - Icon button
- `switch` - Toggle switch
- `menu` - Menu item format

## Dark Mode Support

### Implementation
The design system includes comprehensive dark mode support with:
- Automatic system preference detection
- Manual theme switching
- Persistent user preference storage
- Smooth transitions between themes

### Dark Theme Colors
- **Background**: #0f0f0f (primary), #1a1a1a (secondary)
- **Text**: #fafafa (primary), #d4d4d4 (secondary)
- **Borders**: #262626

## Accessibility Features

### WCAG Compliance
- **AA Level** contrast ratios maintained
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Reduced motion support

### Interactive Elements
- Minimum 44px touch targets
- Clear focus indicators
- Descriptive ARIA labels
- Semantic HTML structure

## Usage Guidelines

### Do's
✅ Use consistent spacing from the design tokens
✅ Apply rounded corners to all interactive elements
✅ Maintain visual hierarchy with typography scale
✅ Use warm colors for primary actions
✅ Provide hover and focus states
✅ Test with both light and dark themes

### Don'ts
❌ Mix different border radius values arbitrarily
❌ Use colors outside the defined palette
❌ Ignore accessibility requirements
❌ Create inconsistent spacing patterns
❌ Forget to test responsive behavior

## Implementation

### Getting Started
1. Import the theme provider in your app root
2. Wrap your application with `ThemeProvider`
3. Use the provided components and design tokens
4. Test across different screen sizes and themes

### Example Usage
```tsx
import { ThemeProvider } from './contexts/ThemeContext';
import { ModernButton, ModernCard } from './components/ui';

function App() {
  return (
    <ThemeProvider>
      <ModernCard title="Welcome">
        <ModernButton variant="primary">
          Get Started
        </ModernButton>
      </ModernCard>
    </ThemeProvider>
  );
}
```

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: CSS Grid, Flexbox, CSS Custom Properties, backdrop-filter

## Performance Considerations

- Optimized font loading with `font-display: swap`
- Efficient CSS custom properties
- Minimal JavaScript for theme switching
- Optimized animations with `transform` and `opacity`

---

For questions or contributions to the design system, please contact the development team.