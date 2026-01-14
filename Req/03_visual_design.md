# Visual Design Requirements

## 1. Aesthetic Direction: "Warm & Cozy"
The visual goal is to create an earthy, comfortable, and welcoming environment ("Autumn Evening" theme). The aesthetic should feel like a warm embrace rather than clinical or stark. It replaces the previous "Tactile Digital" look with rich, inviting tones, avoiding cold colors, bright whites, and sterile shades.

## 2. Color Specifications
All colors must be derived from the following palette. Arbitrary hex codes are forbidden.

### Primary Palette
-   **Dark Coffee Brown (Text/Accents):** `#4a3728`
-   **Warm Cosmic Latte (UI Background):** `#fcf4e8`
-   **Rich Burnt Orange (Highlights/Interaction):** `#e67e22`

### Background / Sky Palette
-   **Warm Dark Charcoal (Zenith):** `#2d2424`
-   **Terracotta (Horizon):** `#d88c5a`
-   **Deep Warm Brown (Abyss):** `#1e1616`

### Secondary & Semantic
-   **Alert/Danger:** `#e74c3c` (Standard Red)
-   **Success/Safe:** `#2ecc71` (Standard Green)
-   **Gold/Premium:** `#f1c40f` (Standard Gold)

## 3. Lighting & Atmosphere
-   **Key Light:** Warm Sun (3500K), casting soft shadows. Color: `#FFD580` (Warm Orange).
-   **Fill Light:** Warm/Pink ambient. Color: `#FFF3E0` (Ground) / `#FCE4EC` (Sky).
-   **Environment:** Warm sunset gradient. No harsh cool blues.

## 4. Typography
-   **Headings/UI Accents:** `Press Start 2P` (Pixel Font) - Use sparingly for buttons/titles.
-   **Body Text:** `VT323` (Monospace Pixel) - Used for primary body text to maintain retro consistency.
-   **Readable Text:** `Inter` or `Roboto` - Fallback for small mobile text if needed.

## 5. Animation Curves
All non-physics animations must use the following cubic-bezier curves:
-   **Standard Ease-Out (Enter):** `cubic-bezier(0.2, 0.8, 0.2, 1)`
-   **Standard Ease-In (Exit):** `cubic-bezier(0.6, 0.05, 0.8, 0.2)`
-   **Bouncy/Playful:** `spring(mass: 1, stiffness: 180, damping: 12)`

## 6. Iconography
-   **Style:** Filled, rounded corners. Material Symbols Rounded is a good reference.
-   **Stroke:** If strokes are used, they must be consistent (e.g., 2px).

## 7. Layout Grids
-   **Desktop:** 12-column grid, 24px gutter. Max-width 1200px.
-   **Mobile:** 4-column grid, 16px gutter. 16px safe-area padding.
