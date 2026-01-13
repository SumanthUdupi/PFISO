# Visual Design Requirements

## 1. Aesthetic Direction: "Tactile Digital"
The visual goal is to blend the charm of low-poly geometry (like *Roblox* or *Crossy Road*) with high-fidelity "toy-like" materials (like *Link's Awakening Remake*). Objects should feel like they can be touched—vinyl, matte plastic, and soft fabric.

## 2. Color Specifications
All colors must be derived from the following palette. Arbitrary hex codes are forbidden.

### Primary Palette
-   **Midnight Blue (Background/Suit):** `#2c3e50` (Pantone 534 C)
-   **Warm Cream (UI Background/Skin Base):** `#fffbf0`
-   **Electric Cyan (Highlights/Interaction):** `#00ffff` or `#26a69a` (Teal variant)

### Secondary & Semantic
-   **Alert/Danger:** `#e74c3c`
-   **Success/Safe:** `#2ecc71`
-   **Gold/Premium:** `#f1c40f`

## 3. Lighting & Atmosphere
-   **Key Light:** Warm Sun (3500K), top-left, casting soft shadows. Intensity: 1.2.
-   **Fill Light:** Cool Blue (9000K), ambient/hemisphere. Intensity: 0.4.
-   **Rim Light:** Sharp back-light to separate character. Intensity 2.0.
-   **Environment:** Studio HDRI mapped to roughness channels only (not visible background).

## 4. Typography
-   **Headings/UI Accents:** `Press Start 2P` (Pixel Font) - Use sparingly for buttons/titles.
-   **Body Text:** `Inter` or `Roboto` (Sans-serif) - Mandatory for long-form reading (Bio, Projects). `VT323` is acceptable for terminal-style text but not general reading.

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
