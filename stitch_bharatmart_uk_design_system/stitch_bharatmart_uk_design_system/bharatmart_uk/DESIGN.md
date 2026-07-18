---
name: BharatMart UK
colors:
  surface: '#fff8f0'
  surface-dim: '#dfd9d0'
  surface-bright: '#fff8f0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f3ea'
  surface-container: '#f4ede4'
  surface-container-high: '#eee7de'
  surface-container-highest: '#e8e2d9'
  on-surface: '#1e1b16'
  on-surface-variant: '#514534'
  inverse-surface: '#33302a'
  inverse-on-surface: '#f7f0e7'
  outline: '#837561'
  outline-variant: '#d6c4ad'
  surface-tint: '#7f5700'
  primary: '#7f5700'
  on-primary: '#ffffff'
  primary-container: '#e8a317'
  on-primary-container: '#5b3d00'
  inverse-primary: '#ffba3e'
  secondary: '#a83635'
  on-secondary: '#ffffff'
  secondary-container: '#ff7670'
  on-secondary-container: '#720b12'
  tertiary: '#2e6a39'
  on-tertiary: '#ffffff'
  tertiary-container: '#80bf85'
  on-tertiary-container: '#0e4e21'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdeae'
  primary-fixed-dim: '#ffba3e'
  on-primary-fixed: '#281900'
  on-primary-fixed-variant: '#604100'
  secondary-fixed: '#ffdad7'
  secondary-fixed-dim: '#ffb3ae'
  on-secondary-fixed: '#410004'
  on-secondary-fixed-variant: '#881e20'
  tertiary-fixed: '#b1f2b4'
  tertiary-fixed-dim: '#96d69a'
  on-tertiary-fixed: '#002108'
  on-tertiary-fixed-variant: '#135224'
  background: '#fff8f0'
  on-background: '#1e1b16'
  surface-variant: '#e8e2d9'
typography:
  display-xl:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max: 1280px
---

## Brand & Style

The design system is built to bridge the gap between a traditional Indian high-street market and a premium UK e-commerce experience. The personality is **community-rooted yet professional**, avoiding the visual clutter of typical "discount" marketplaces in favor of a curated, inviting atmosphere.

The design style utilizes **Modern Minimalist** principles with a **Tactile** warmth. It emphasizes high legibility and spaciousness to ensure the diverse product catalog—ranging from heavy groceries to intricate fashion—feels organized and high-end. The emotional goal is to evoke a sense of home and reliability, making the digital shopping experience feel as personal and trustworthy as a local merchant interaction.

## Colors

The palette is inspired by traditional Indian aesthetics but applied with a contemporary European sensibility.

- **Primary Saffron Gold (#E8A317):** Used for primary actions, rating stars, and high-level branding. It provides warmth and visibility.
- **Warm Maroon (#9B2C2C):** Used for secondary accents, category headers, and price points. It adds a layer of heritage and sophistication.
- **Deep Green (#2F6B3A):** Reserved specifically for organic/fresh labels and "Add to Cart" conversion actions to signal growth and vitality.
- **Cream Background (#FFF8EF):** Replaces harsh white to reduce eye strain and provide a "paper-like" premium texture that feels more inviting than standard corporate platforms.
- **Charcoal Text (#2A2A2A):** Ensures WCAG AA compliance and sharp legibility against the cream backdrop.

## Typography

Typography balances character with utility. **Montserrat** is used for headings to provide a friendly, rounded geometric structure that feels modern and approachable. **Inter** is used for all UI elements, product descriptions, and metadata to ensure high readability even at small sizes in dense multi-vendor listings.

For mobile layouts, headline sizes scale down to prevent excessive line-breaking, while body text remains at 16px to ensure accessibility for all age groups within the community. Bold weights are used sparingly for price points and merchant names to create a clear information hierarchy.

## Layout & Spacing

The layout follows a **Fluid Grid** system based on an 8px rhythmic scale. 

- **Desktop:** A 12-column grid with 24px gutters. Content is centered within a 1280px max-width container.
- **Tablet:** An 8-column grid with 16px gutters and margins.
- **Mobile:** A 4-column grid with 16px margins. 

Spacing between product cards should be consistent at 16px to maintain a "marketplace" feel without looking cluttered. Vertical section spacing (e.g., between "Featured Merchants" and "Fresh Arrivals") should be generous (48px - 64px) to allow the UI to breathe.

## Elevation & Depth

This design system uses **Tonal Layers** combined with **Ambient Shadows** to create a sense of physical space.

- **Level 0 (Floor):** Cream background (#FFF8EF).
- **Level 1 (Cards/Search):** Pure White (#FFFFFF) surfaces with a subtle shadow (0px 4px 12px, 4% opacity Charcoal).
- **Level 2 (Hover/Modals):** Pure White with a more defined shadow (0px 8px 24px, 8% opacity Maroon-tinted Charcoal).

Shadows should be soft and diffused. Sharp, heavy shadows are avoided to maintain the premium "high-street" aesthetic. Subtle Maroon or Saffron tints in the shadow (1-2%) can be used to add warmth to elevated surfaces.

## Shapes

The shape language is consistently **Rounded**, using a 10px (0.625rem) base radius for standard elements like cards, buttons, and input fields. This specific radius softens the UI, making it feel more approachable and family-friendly compared to sharp corporate grids.

- **Primary Buttons:** 10px radius.
- **Product Cards:** 10px radius, ensuring images inside also follow the corner radius.
- **Tags/Chips:** Fully pill-shaped (rounded-xl) to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Saffron Gold background, Charcoal text. Use for high-intent actions.
- **Secondary:** Maroon border with Maroon text. Use for merchant-related actions.
- **Add to Cart:** Deep Green background with White text. High contrast is vital here.

### Product Cards
- **Structure:** 1:1 Aspect ratio image (pure white background preferred), Product Name (Inter Bold), Price (Maroon), and a small "Sold by [Merchant Name]" attribution in Label-MD styling.
- **Interactions:** Subtle lift (elevation increase) on hover.

### Sticky Header
- A fixed white bar with the Saffron logo, a wide centered search bar with 10px rounded corners, and user icons (Cart, Account) in Charcoal.

### Merchant Store Cards
- Includes the merchant's logo in a circular frame, a short bio, and a "Follow Store" secondary button.

### Floating WhatsApp Button
- Positioned 24px from the bottom-right. Circular, Deep Green (#2F6B3A) background with a white WhatsApp icon and a subtle 12% shadow to ensure it floats above all other content.

### Inputs & Forms
- Input fields use the Cream background with a 1px border (#E2D1B9) that turns Saffron on focus. Labels are always positioned above the input.