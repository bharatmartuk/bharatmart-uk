---
name: BharatMart Operations Console
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#44474e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#75777f'
  outline-variant: '#c5c6cf'
  surface-tint: '#4e5e81'
  primary: '#031635'
  on-primary: '#ffffff'
  primary-container: '#1a2b4b'
  on-primary-container: '#8293b8'
  inverse-primary: '#b6c6ef'
  secondary: '#b22b1d'
  on-secondary: '#ffffff'
  secondary-container: '#fe624e'
  on-secondary-container: '#650000'
  tertiary: '#231400'
  on-tertiary: '#ffffff'
  tertiary-container: '#3e2700'
  on-tertiary-container: '#b08d5b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#b6c6ef'
  on-primary-fixed: '#081b3a'
  on-primary-fixed-variant: '#364768'
  secondary-fixed: '#ffdad4'
  secondary-fixed-dim: '#ffb4a8'
  on-secondary-fixed: '#410000'
  on-secondary-fixed-variant: '#8f0f07'
  tertiary-fixed: '#ffddb1'
  tertiary-fixed-dim: '#e8c08a'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#5d4217'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  status-pending: '#f59e0b'
  status-success: '#10b981'
  status-error: '#ef4444'
  sidebar-navy: '#1a2b4b'
  action-maroon: '#800000'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
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
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  table-header:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 12px
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
  container-padding: 24px
  table-cell-padding: 8px 12px
  gutter: 16px
  sidebar-width: 260px
---

## Brand & Style

The design system is engineered for **BharatMart Admin**, an internal operations hub for marketplace management. The brand personality is **authoritative, professional, and efficient**. Unlike the consumer-facing platform which evokes a warm, festive marketplace feel, this system prioritizes clarity and high-velocity decision-making.

The design style is **Corporate / Modern (Enterprise SaaS)**. It utilizes a structured information hierarchy, heavy emphasis on data density, and a utilitarian aesthetic. It maintains brand continuity through surgical use of BharatMart Maroon but differentiates the administrative environment with a deep Navy workspace, signaling a "control center" context to the staff.

## Colors

The palette is designed to reduce eye strain during long shifts while providing clear semantic signaling.

- **Primary (Deep Navy):** Used for structural elements like sidebars, global headers, and navigation. This creates a distinct "Admin Mode" visual frame.
- **Secondary (BharatMart Maroon):** Reserved exclusively for primary call-to-action buttons (e.g., "Approve Merchant," "Publish Listing") to maintain a link to the core brand identity.
- **Status Colors:** Amber and Green are utilized for high-contrast status badges in data tables. 
- **Surface Neutrals:** A range of cool grays (Slate) is used for backgrounds and borders to keep the UI feeling "clean" and focused on the content.

## Typography

This design system uses a dual-font strategy to balance character with utility.

- **Montserrat** is the display typeface, providing a confident and sturdy feel for page headers, section titles, and stat card values.
- **Inter** is the functional workhorse, selected for its exceptional legibility in high-density data tables and small-scale interface labels. 
- **Data Density:** Use `body-sm` and `table-header` for the majority of the data grid content to maximize the information visible on a single screen.
- **Hierarchy:** All labels for status badges should use `label-caps` for immediate recognition.

## Layout & Spacing

The layout follows a **Fixed-Fluid hybrid grid** model. 

- **Sidebar:** A fixed 260px sidebar on the left containing the primary navigation.
- **Main Content:** A fluid area that expands to fill the remaining width, using a 12-column system for dashboard widgets and a full-width approach for data tables.
- **Rhythm:** An 8px grid system is used for general layout, but the internal spacing of data tables is reduced to a 4px baseline to support "High-Density" views required for operational audits.
- **Breakpoints:**
  - **Desktop (1440px+):** Full visibility of all table columns.
  - **Tablet (1024px):** Sidebar collapses to icons only; tables enable horizontal scrolling.

## Elevation & Depth

This system avoids heavy shadows to maintain a clean, professional "flat" appearance. 

- **Tonal Layers:** Depth is primarily communicated through background color shifts. The main canvas uses a light gray (`#f8fafc`), while card surfaces use pure white (`#ffffff`).
- **Low-Contrast Outlines:** Instead of shadows, use 1px borders in a soft gray (`#e2e8f0`) to define containers, stat cards, and table boundaries.
- **Active States:** Subtle 2px bottom borders in Primary Navy are used to indicate active tabs or navigation items.
- **Modals:** Use a soft, 16px blur ambient shadow with 10% opacity for the only true "elevated" elements in the system.

## Shapes

The shape language is **Soft (0.25rem)**, emphasizing a modern but disciplined enterprise look.

- **Standard Elements:** Input fields, buttons, and cards use a 4px corner radius.
- **Status Badges:** Use a slightly higher radius (8px) or a pill-shape to distinguish them from interactive buttons.
- **Images:** Merchant logos or product thumbnails in tables should maintain a 4px radius to match the UI language.

## Components

- **High-Density Tables:** Alternating row stripes (zebra striping) using a very faint gray. Headers remain sticky at the top. Use condensed vertical padding (8px) for maximum rows per fold.
- **Status Badges:** Small, uppercase text on a light tinted background of the status color (e.g., Green text on a 10% opacity Green background).
- **Primary Buttons:** Solid BharatMart Maroon with white text. Hover state should be a slightly darker shade of Maroon.
- **Stat Cards:** Large Montserrat display numbers for "KPIs" (e.g., Total Sales, Pending Approvals) with a small trend indicator (percentage increase/decrease) in the corner.
- **Input Fields:** Minimalist style with a 1px gray border that turns Navy on focus. Label is positioned above the field in `body-sm` bold.
- **Side Navigation:** Deep Navy background with white icons. Active items feature a vertical Maroon "pill" indicator on the left edge.