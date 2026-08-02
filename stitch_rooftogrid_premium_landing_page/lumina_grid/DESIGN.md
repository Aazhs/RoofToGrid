---
name: Lumina Grid
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#d8c3ad'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#a08e7a'
  outline-variant: '#534434'
  surface-tint: '#ffb95f'
  primary: '#ffc174'
  on-primary: '#472a00'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#855300'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffc08e'
  on-tertiary: '#4d2600'
  tertiary-container: '#ff9837'
  on-tertiary-container: '#6a3700'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  stats-num:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base-unit: 8px
  container-padding: 24px
  gutter: 16px
  section-gap: 64px
---

## Brand & Style

This design system embodies the transition from raw solar energy to intelligent grid management. The aesthetic is **Modern SaaS with Glassmorphism**, heavily inspired by high-end fintech and aerospace interfaces. It balances the industrial nature of solar hardware with the sophisticated fluidity of modern software.

The emotional response should be one of high-tech reliability, environmental optimism, and premium efficiency. By utilizing deep space-inspired backgrounds contrasted with vibrant solar-kinetic accents, the UI feels both grounded and futuristic. Visual depth is achieved through layered translucency, subtle glow effects, and precision-engineered typography.

## Colors

The palette is designed for high-contrast legibility in a dark environment. 

- **Primary (Solar Amber):** Used for primary calls-to-action, active states, and critical energy generation data. It should often be applied as a gradient from `#F59E0B` to `#D97706`.
- **Secondary (Electric Green):** Reserved exclusively for positive financial metrics, savings, and "system healthy" indicators.
- **Base (Rich Navy):** The foundation of the UI. Avoid pure black; use `#0F172A` to maintain a premium, "ink" feel.
- **Glass Borders:** Use white or primary colors with very low opacity (8–12%) to define card edges without breaking the visual flow.

## Typography

The typographic hierarchy prioritizes clarity and a technical edge. **Plus Jakarta Sans** provides a friendly yet geometric authority for headlines, while **Inter** ensures maximum readability for dense data sets and technical descriptions.

- **Headlines:** Should use tighter letter-spacing to feel "locked-in" and professional.
- **Stats:** Numbers are the heroes of the platform. Use the `stats-num` style for energy output and financial totals, ensuring they have enough breathing room.
- **Contrast:** Use white (`#F8FAFC`) for primary information and muted slate (`#94A3B8`) for secondary descriptions to create a natural eye-path.

## Layout & Spacing

The layout follows a **Fluid Grid** system designed to maximize the visibility of dashboard widgets and data visualizations.

- **Desktop:** 12-column grid with 24px gutters. Use wide margins (up to 80px) to maintain a centered, cinematic feel for the main dashboard.
- **Mobile:** 4-column grid with 16px margins. Elements should stack vertically, with cards utilizing the full width.
- **Rhythm:** All spacing (padding, margins, gaps) must be multiples of 8px to maintain a rigid, engineered feel. Use generous vertical spacing between sections to prevent the dark theme from feeling cramped.

## Elevation & Depth

Depth is conveyed through **Glassmorphism** rather than traditional drop shadows.

1.  **Background:** The base layer is a deep navy gradient.
2.  **Surface (Cards):** Semi-transparent layers (`rgba(30, 41, 59, 0.7)`) with a `backdrop-filter: blur(12px)`.
3.  **Stroke:** Every card must have a 1px border. Use a top-down linear gradient border (from `white` at 15% opacity to `white` at 5% opacity) to simulate a light source from above.
4.  **Glows:** For high-priority elements like "System Active" or "Primary CTA," use an outer `box-shadow` with a high blur (32px+) and low opacity (20%) using the primary amber or secondary green colors.

## Shapes

The design uses a **Rounded** language to soften the technical data and make the platform feel more accessible to homeowners.

- **Standard Cards:** Use `rounded-lg` (1rem).
- **Interactive Elements:** Buttons and input fields should use `rounded-xl` (1.5rem) or `rounded-full` to create a tactile, pill-like appearance.
- **Icons:** Should be encased in circular or heavily rounded containers with a subtle glass background.

## Components

### Buttons
Primary buttons use a linear gradient from `#F59E0B` to `#D97706`. On hover, they should exhibit a subtle "solar glow" (box-shadow) and a 1.02x scale transform. Text should be bold and dark (`#0F172A`) for maximum contrast against the gold.

### Glass Cards
Cards are the primary container. They must feature a `backdrop-filter: blur(16px)` and a subtle 1px border. For featured cards (e.g., "Total Savings"), use a secondary green glow in the bottom-right corner of the card's inner shadow.

### Form Inputs
Inputs are dark and recessed. Use `background: rgba(15, 23, 42, 0.5)` with a 1px border. On focus, the border transitions to Primary Amber with a 4px soft outer glow.

### Status Indicators
Use a "pulse" animation for active energy generation. A small circle of `#10B981` with a secondary, expanding ring at 30% opacity creates a sense of live, real-time monitoring.

### Data Visualization
Charts should use thick, rounded lines. Area charts should have a vertical gradient fill that fades from the brand color (Amber or Green) to 0% opacity as it hits the X-axis.