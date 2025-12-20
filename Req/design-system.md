# Design System Document for Interactive Isometric Pixel Portfolio

## Table of Contents

1. [Introduction](#introduction)
2. [Pixel Art Specifications](#pixel-art-specifications)
3. [Color Palettes](#color-palettes)
4. [Typography Hierarchy](#typography-hierarchy)
5. [UI Element Designs](#ui-element-designs)
6. [Animation Style Guide](#animation-style-guide)
7. [Asset Dimensions](#asset-dimensions)
8. [Accessibility Considerations](#accessibility-considerations)
9. [Conclusion](#conclusion)

## Introduction

This design system document outlines the visual and interactive guidelines for the Interactive Isometric Pixel Portfolio project. The project is an interactive portfolio website designed as an isometric pixel art office environment, allowing users to explore professional work in a game-like manner. The design system ensures consistency, nostalgia, and usability across all elements.

Rationale: The pixel art style evokes classic video games, making the portfolio engaging and memorable. It differentiates from standard web portfolios by immersing users in an explorable world.

Alternative Approaches:
- Vector-based graphics: Pros - Scalable, modern look; Cons - Less nostalgic, harder to achieve retro feel.
- 3D models: Pros - Immersive; Cons - Higher performance requirements, complexity in pixel art integration.

## Pixel Art Specifications

### Pixel Density
- Base unit: 16 pixels per tile or sprite.
- Resolution: Designed for 1080p displays, scaling up for higher resolutions while maintaining pixel-perfect appearance.

### Influences
- Classic RPGs such as Chrono Trigger, Final Fantasy VI, and isometric games like Diablo.
- Emphasis on isometric projection for depth and exploration.

Rationale: 16-pixel density balances detail with retro authenticity. Influences draw from beloved games to create familiarity and fun.

Alternative Approaches:
- 32-pixel density: Pros - More detailed sprites; Cons - Less retro, increased file sizes.
- 8-pixel density: Pros - Ultra-retro; Cons - Limited detail, readability issues.

## Color Palettes

### Light Mode
- Background: #F0F0F0 (Light gray for clean base)
- Primary: #4A90E2 (Blue for interactive elements)
- Secondary: #7ED321 (Green for accents)
- Text: #333333 (Dark gray for readability)
- Accent: #D0021B (Red for highlights)

### Dark Mode
- Background: #1A1A1A (Dark gray for low-light viewing)
- Primary: #5AC8FA (Light blue for visibility)
- Secondary: #F5A623 (Orange for warmth)
- Text: #FFFFFF (White for contrast)
- Accent: #FF6B6B (Coral for energy)

Rationale: Limited palettes mimic pixel art constraints, ensuring high contrast and thematic consistency. Hex codes allow precise implementation.

Alternative Approaches:
- Full RGB spectrum: Pros - Unlimited colors; Cons - Risk of inconsistency, less retro.
- Monochrome: Pros - Simple; Cons - Less engaging, poor differentiation.

## Typography Hierarchy

- **H1 (Headings)**: Pixel font (e.g., Press Start 2P), 24px, bold, uppercase.
- **H2 (Subheadings)**: Pixel font, 18px, bold.
- **Body Text**: Pixel font, 12px, regular.
- **Captions**: Pixel font, 10px, italic.

Rationale: Pixel fonts reinforce the retro theme and maintain readability in a game-like interface.

Alternative Approaches:
- Sans-serif fonts (e.g., Arial): Pros - High readability; Cons - Breaks immersion.
- Serif fonts: Pros - Elegant; Cons - Incompatible with pixel art.

## UI Element Designs

- **Buttons**: Isometric cube shapes with engraved text, hover effect adds shadow for depth.
- **Menus**: Pixel art frames with scrollable lists, icons as 16x16 sprites.
- **Tooltips**: Floating pixel boxes with arrow pointers.
- **Navigation**: Isometric arrows or portals for movement.

Visual References: Buttons appear as small cubes tilted in isometric view, with text carved into the face. Menus are framed like old game windows with pixel borders.

Rationale: Isometric designs integrate with the environment, enhancing the game-like exploration.

Alternative Approaches:
- Flat 2D buttons: Pros - Simple to implement; Cons - Less immersive.
- 3D rendered elements: Pros - Realistic; Cons - Performance heavy, style mismatch.

## Animation Style Guide

- **Style**: Frame-based sprite animations at 8-12 FPS for smooth retro motion.
- **Examples**:
  - Character walking: 4-frame cycle (left, right, up, down).
  - UI hover: Subtle glow effect using palette shifts.
  - Transitions: Fade-in/out with pixel dissolve.

Rationale: Frame-based animations preserve pixel art integrity and evoke classic games.

Alternative Approaches:
- CSS keyframe animations: Pros - Easy integration; Cons - May look modern, less pixel-perfect.
- Real-time 3D animations: Pros - Dynamic; Cons - Complexity, resource intensive.

## Asset Dimensions

- **Sprites**: 16x16 pixels for small objects, 32x32 for characters.
- **Icons**: 16x16 pixels.
- **Backgrounds**: Tiled 16x16 patterns.
- **UI Assets**: Consistent with sprite sizes.

Rationale: Standardized dimensions ensure scalability and consistency in the isometric grid.

Alternative Approaches:
- Variable sizes: Pros - Flexibility; Cons - Inconsistent scaling, harder alignment.
- Vector assets: Pros - Infinite scaling; Cons - Less retro.

## Accessibility Considerations

- **Color Contrast**: All text meets 4.5:1 ratio (WCAG AA).
- **Keyboard Navigation**: Full support for tabbing and shortcuts.
- **Screen Readers**: Alt text for all images, semantic HTML.
- **Motion Sensitivity**: Option to reduce animations.
- **Font Sizing**: Minimum 12px for readability.

Rationale: Ensures inclusivity, allowing all users to navigate the portfolio effectively.

Alternative Approaches:
- Basic compliance (WCAG A): Pros - Minimal effort; Cons - Limited accessibility.
- Advanced (WCAG AAA): Pros - Superior access; Cons - More complex implementation.

## Conclusion

This design system provides a cohesive framework for the Interactive Isometric Pixel Portfolio, blending retro aesthetics with modern usability. It guides all visual and interactive elements to create an engaging, accessible experience.