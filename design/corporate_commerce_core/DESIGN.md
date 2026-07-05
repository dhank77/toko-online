---
name: Corporate Commerce Core
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#444653'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#323537'
  on-tertiary: '#ffffff'
  tertiary-container: '#484c4e'
  on-tertiary-container: '#b9bcbe'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is engineered for a dual-audience environment, balancing the high-trust requirements of business administration with the frictionless, inviting nature of modern retail. The brand personality is **composed, authoritative, and exceptionally efficient**. 

The chosen style is a **refined Corporate Minimalism**. It leverages generous whitespace to reduce cognitive load and high-quality typography to ensure legibility across dense data tables and expansive product galleries. The aesthetic avoids unnecessary decoration, instead using subtle depth and precise alignment to signal security and professionalism. The emotional goal is to make the user feel empowered and safe, whether they are making a high-value purchase or managing global inventory.

## Colors

The palette is anchored by **Professional Blue**, used for primary actions, navigational headers, and brand-critical touchpoints to instill a sense of institutional stability. **Trustworthy Teal** serves as the secondary accent, specifically utilized for success states, conversion-oriented "Add to Cart" buttons, and financial indicators to promote a sense of growth and safety.

The background ecosystem relies on a tiered neutral scale. Surfaces use a crisp white, while the tertiary background color (Off-White/Slate) provides subtle contrast for container backgrounds and section dividers, ensuring the UI feels layered without being heavy.

## Typography

The design system utilizes **Inter** exclusively to achieve a systematic, highly legible look that scales from complex data grids to marketing hero sections. 

The type hierarchy is defined by tight tracking on headlines to maintain a modern, "compacted" professional feel, while body copy utilizes standard leading to ensure comfortable reading during long-form sessions. Labels use a slightly heavier weight and occasional uppercase styling to provide clear signposting within the interface.

## Layout & Spacing

This design system follows a **12-column fluid grid** for desktop, transitioning to a **4-column grid** for mobile. The layout philosophy emphasizes "breatheable density"—while information is packed efficiently for administrators, margins and gutters are generous to maintain a clean appearance.

- **Desktop (1280px+):** 12 columns, 24px gutters, 40px+ page margins.
- **Tablet (768px - 1279px):** 8 columns, 16px gutters, 24px page margins.
- **Mobile (Up to 767px):** 4 columns, 16px gutters, 16px page margins.

Vertical rhythm is strictly managed in multiples of 8px (the spacing "base" of 4px used in pairs), ensuring consistent alignment of components and text blocks.

## Elevation & Depth

To maintain a professional and clean aesthetic, this design system uses **Ambient Shadows** rather than harsh borders or deep skeuomorphism. 

Depth is communicated through three levels:
1. **Flat (Level 0):** Used for the main background.
2. **Raised (Level 1):** Small cards and standard inputs. Uses a soft, low-opacity shadow (e.g., `0 2px 4px rgba(30, 64, 175, 0.05)`).
3. **Elevated (Level 2):** Overlays, dropdowns, and active modals. These feature a more diffused shadow with a slight Professional Blue tint to maintain brand cohesion within the depth (e.g., `0 10px 15px rgba(30, 64, 175, 0.1)`).

The system avoids heavy outlines, preferring subtle 1px borders in a very light grey-blue to define structure when shadows are not appropriate.

## Shapes

The design system utilizes a **Rounded** shape language to soften the corporate nature of the platform and make it feel more approachable for retail shoppers. 

The base unit for component corners is **12px** (represented as `rounded-lg` in many frameworks). This radius is applied to primary buttons, input fields, and product cards. Smaller elements like checkboxes or tags utilize a **4px** radius, while purely decorative icons or search bars may occasionally use pill-shaped (fully rounded) ends to signify specific interactive zones.

## Components

- **Buttons:** Primary buttons use a solid Professional Blue or Trustworthy Teal fill with white text and 12px rounded corners. Hover states should involve a subtle darkening of the hex code. Ghost buttons use a 1px border and 600-weight text.
- **Inputs:** Text fields feature a 1px light slate border, 12px rounding, and a 16px horizontal padding. On focus, the border color shifts to Professional Blue with a soft 2px outer glow.
- **Cards:** Product and data cards use a white background, a Level 1 ambient shadow, and no border. They include 16px or 24px of internal padding.
- **Chips/Tags:** Used for categories or status indicators. Success tags use a light teal background with dark teal text; neutral tags use light slate.
- **Lists & Tables:** Data rows are separated by 1px light slate dividers. In admin views, rows feature a subtle hover highlight using the tertiary background color.
- **Checkboxes & Radios:** These should be slightly larger than standard (18px) to increase touch-friendliness, using the primary color for the checked state.
- **Admin Sidebar:** A vertical navigation component using a slightly darker version of the tertiary background to create a clear "workspace" distinction from the content area.