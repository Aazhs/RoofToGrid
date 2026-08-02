---
name: Nocturnal Intellect
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#cfc5bb'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#988f86'
  outline-variant: '#4c463e'
  surface-tint: '#d3c4b2'
  primary: '#f1e1ce'
  on-primary: '#382f22'
  primary-container: '#d4c5b3'
  on-primary-container: '#5c5143'
  inverse-primary: '#685d4e'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#e5e3e2'
  on-tertiary: '#303030'
  tertiary-container: '#c9c7c7'
  on-tertiary-container: '#535353'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f0e0cd'
  primary-fixed-dim: '#d3c4b2'
  on-primary-fixed: '#221a0f'
  on-primary-fixed-variant: '#4f4538'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  max-width: 1280px
---

## Brand & Style

This design system embodies an Anthropic-inspired aesthetic: minimalist, intellectual, and profoundly sophisticated. It prioritizes clarity of thought over visual noise, utilizing a "Dark UI" philosophy that focuses on deep charcoal surfaces rather than absolute blacks to maintain a sense of air and depth.

The style is **Modern Minimalism** with a technical edge. It avoids the neon glows typical of dark modes, opting instead for a "printed-on-dark-paper" feel. The emotional response is one of calm authority, precision, and high-end craftsmanship. High-quality whitespace (or "darkspace") is the primary tool for grouping, while thin, purposeful lines provide the structure.

## Colors

The palette is rooted in low-light ergonomics and intellectual sobriety.

- **Surface:** The foundation is a deep charcoal (#0B0B0B), providing a soft, non-reflective base that reduces eye strain.
- **Surface Container:** Secondary areas use #1A1A1A to create subtle shifts in depth without relying on shadows.
- **Accent:** A muted sand tone (#D4C5B3) is used sparingly for primary actions and highlights, offering a natural, sophisticated contrast to the cool charcoal.
- **Typography:** Headlines are rendered in an off-white (#E5E5E5) to maintain high legibility, while body text uses a muted gray (#999999) to establish a clear visual hierarchy.
- **Borders:** Structural lines are extremely subtle (#2A2A2A), intended to be felt rather than seen.

## Typography

The typography leverages **Plus Jakarta Sans** for its modern, clean proportions. To achieve the "intellectual" vibe, generous tracking is applied to body text and labels, creating an expansive, breathable reading experience.

- **Headlines:** Use a tighter tracking and medium weight to appear grounded and authoritative.
- **Body Text:** Optimized for long-form reading with a 1.6 line-height and slight positive letter spacing.
- **Labels:** Small caps or increased tracking (8%) should be used for metadata and utility labels to provide a technical, diagrammatic quality.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop, transitioning to a fluid model for mobile devices. It utilizes a 12-column grid with generous margins to reinforce the premium, editorial feel.

- **Desktop:** 12 columns, 24px gutters, and a minimum of 64px side margins. The content is capped at 1280px to ensure line lengths remain readable.
- **Mobile:** 4 columns, 16px gutters, and 16px margins. 
- **Rhythm:** All vertical spacing must be a multiple of 4px. Use larger gaps (64px, 80px, 120px) between major sections to emphasize the minimalist aesthetic and separate distinct ideas.

## Elevation & Depth

In this dark-mode system, depth is communicated through **Tonal Layers** rather than traditional shadows.

1.  **Base Layer (#0B0B0B):** The main background.
2.  **Raised Layer (#1A1A1A):** Used for cards, navigation bars, and modals.
3.  **Outline Definition:** Instead of shadows, use a 1px solid border (#2A2A2A) to define the edges of raised elements. 

If a shadow is absolutely necessary for a floating element (like a dropdown), use a large, 0% blur, ultra-low opacity black shadow to maintain the "flat" technical appearance. Avoid glows or vibrant blurs at all costs.

## Shapes

The shape language is **Soft (0.25rem)**. This provides a subtle modern touch without appearing overly "bubbly" or consumer-grade. It strikes a balance between the clinical precision of sharp corners and the friendliness of rounded corners.

- **Buttons & Inputs:** 4px (0.25rem) corner radius.
- **Cards & Containers:** 8px (0.5rem) corner radius.
- **Selection Indicators:** Small 2px radius or sharp edges to denote a more technical feel.

## Components

### Buttons
- **Primary:** Background #D4C5B3, Text #0B0B0B. No border. High contrast, immediate focus.
- **Secondary:** Transparent background, Border 1px #2A2A2A, Text #E5E5E5.
- **Ghost:** Transparent background, Text #999999.

### Input Fields
- **Default:** Background #1A1A1A, Border 1px #2A2A2A, Text #E5E5E5.
- **Focus:** Border 1px #D4C5B3. No outer glow.

### Cards
- **Base:** Background #1A1A1A, Border 1px #2A2A2A. 
- **Header:** Use `label-sm` for card categories to maintain the technical hierarchy.

### Chips & Tags
- **Default:** Background #2A2A2A, Text #999999, 4px radius. 
- **Active:** Background #D4C5B3, Text #0B0B0B.

### Lists
- Separate list items with a 1px #2A2A2A horizontal line. Provide 16px of vertical padding to each item to ensure the "intellectual" whitespace is preserved.

### Technical Elements
- Use monospaced numbers (if available in the font) or `label-sm` for data points and timestamps to enhance the sophisticated, tool-like nature of the interface.