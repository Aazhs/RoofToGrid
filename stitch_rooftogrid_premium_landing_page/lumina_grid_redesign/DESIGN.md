---
name: Lumina Grid Redesign
colors:
  surface: '#faf9f7'
  surface-dim: '#dadad8'
  surface-bright: '#faf9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeec'
  surface-container-high: '#e9e8e6'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#695d46'
  on-secondary: '#ffffff'
  secondary-container: '#efdec1'
  on-secondary-container: '#6d614a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#121e13'
  on-tertiary-container: '#798877'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#f1e0c3'
  secondary-fixed-dim: '#d5c5a9'
  on-secondary-fixed: '#231a08'
  on-secondary-fixed-variant: '#504530'
  tertiary-fixed: '#d7e7d4'
  tertiary-fixed-dim: '#bbcbb8'
  on-tertiary-fixed: '#121e13'
  on-tertiary-fixed-variant: '#3d4a3c'
  background: '#faf9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e3e2e0'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
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
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max-width: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system embodies an intellectual and premium aesthetic, drawing heavy inspiration from academic publishing and high-end research interfaces. The brand personality is calm, reliable, and deeply focused, prioritizing clarity over decoration. 

The style is **Sophisticated Minimalism**. It avoids the loud signals of traditional tech branding in favor of subtle textures, generous whitespace, and a high-contrast typographic hierarchy. The visual language uses thin, precise lines and a "paper-like" digital surface to evoke a sense of authority and timelessness.

## Colors
The palette shifts away from high-saturation digital tones toward a more organic, "archival" selection. 

- **Primary:** A deep charcoal (#1A1A1A) used for high-density text and primary structural elements.
- **Surface (Neutral):** An off-white/bone (#F9F8F6) serves as the primary canvas, reducing eye strain and providing a premium, paper-like feel.
- **Accent (Sand):** A muted, sophisticated gold/sand (#D4C4A8) is used for secondary interactive states and highlighting curated content.
- **Secondary Accents:** Deep Sage (#4F5D4E) and Burnt Orange (#B35D41) are used sparingly for status indicators, categorization, or gentle call-to-actions.

Use a "tint-stack" approach for backgrounds: `Surface` for the base, and `Secondary (Sand)` at 5-10% opacity for subtle container differentiation.

## Typography
The typography system relies on **Plus Jakarta Sans** for its balanced, contemporary proportions. To achieve the "academic" feel, tracking is increased slightly on body text and significantly on labels.

- **Headlines:** Use a tighter letter-spacing and Medium weights to maintain a crisp, authoritative look.
- **Body Text:** Prioritize legibility with a generous 1.6 line-height.
- **Labels:** Small caps or increased tracking (0.05em) should be used for metadata and utility labels to differentiate them from prose.
- **Hierarchy:** Use weight and tracking rather than size to create distinction where possible.

## Layout & Spacing
The layout follows a **Fluid-Fixed hybrid model**. While the grid stretches, content is housed in a centered container with a maximum width of 1280px to ensure line lengths remain readable for long-form research content.

- **Rhythm:** An 8px linear scale governs all padding and margins.
- **Whitespace:** Use whitespace aggressively to separate logical sections. Avoid "boxed-in" layouts; prefer horizontal rules (`1px` hairlines) over heavy container borders.
- **Desktop:** 12-column grid with 24px gutters and 48px outer margins.
- **Mobile:** 4-column grid with 16px gutters and 16px outer margins.

## Elevation & Depth
In this design system, depth is communicated through **Subtle Tonal Layering** and **Minimal Shadows**.

- **Tiers:** Elements don't "float" high above the surface. Instead, they sit on layers differentiated by slight color shifts (e.g., a card might be pure White `#FFFFFF` against the Off-White `#F9F8F6` background).
- **Shadows:** Use a single, highly diffused "Ambient Shadow" for interactive elements: `0px 4px 20px rgba(0, 0, 0, 0.04)`.
- **Glassmorphism:** Reserved only for persistent navigation bars. Use a `12px` backdrop blur with a `0.5px` white border at 40% opacity to create a "frosted parchment" effect rather than a plastic "tech" look.

## Shapes
The shape language is disciplined and "Soft" (0.25rem / 4px). This subtle rounding takes the edge off the brutalist origins of grid-based design without appearing overly "bubbly" or consumer-grade. 

- **Components:** Standard buttons and input fields use `4px`.
- **Containers:** Large cards or sections use `8px` (`rounded-lg`).
- **Interactive:** Selection states (chips) may use a pill-shape for high contrast against the otherwise rectilinear grid.

## Components
- **Buttons:** Primary buttons use the Charcoal background with White text. Secondary buttons use a `1px` hairline border in Charcoal with no background. No gradients are permitted.
- **Input Fields:** Use a subtle background fill (#F2F0ED) and a bottom-border-only focus state to mimic a formal document or ledger.
- **Chips:** Small, uppercase labels with a light Sand (#D4C4A8) background at 20% opacity.
- **Cards:** Defined by a `1px` border in a light grey-tan (#E5E2DD) rather than a shadow. On hover, apply the ambient shadow and a slight lift.
- **Lists:** Use generous vertical padding (16px) and thin dividers. Iconography should be "Line" style with a 1.5px stroke width.
- **Data Grids:** High-density, utilizing the Charcoal for headers and the Off-White for alternate row striping.