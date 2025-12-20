# Asset Production Guide for Interactive Isometric Pixel Portfolio

## Table of Contents

1. [Introduction](#introduction)
2. [Pixel Art Guidelines and Grid Specifications](#pixel-art-guidelines-and-grid-specifications)
3. [Asset List with Priorities](#asset-list-with-priorities)
4. [Animation Frame Breakdown](#animation-frame-breakdown)
5. [Sound Design Recommendations](#sound-design-recommendations)
6. [Naming Conventions](#naming-conventions)
7. [Conclusion](#conclusion)

## Introduction

This Asset Production Guide provides a comprehensive overview for creating assets for the Interactive Isometric Pixel Portfolio project. The project is an interactive website resembling an isometric pixel art office environment, allowing users to explore professional work in a game-like manner. Assets include pixel art sprites, animations, sounds, and UI elements, all adhering to a retro aesthetic inspired by classic RPGs like Chrono Trigger and Diablo.

Rationale: A detailed guide ensures consistency in asset creation, maintaining the nostalgic pixel art style while optimizing for web performance and user engagement.

Alternative Approaches:
- Outsourced asset creation: Pros - Professional quality, faster turnaround; Cons - Higher cost, less control over style.
- Procedural generation: Pros - Infinite variety, low storage; Cons - Less artistic control, may not match retro feel.

## Pixel Art Guidelines and Grid Specifications

### Grid Specifications
- **Base Unit**: 16 pixels per tile or sprite (e.g., 16x16 for small objects, 32x32 for characters).
- **Isometric Projection**: Use a 2:1 ratio for depth (e.g., tiles are 16x8 pixels in screen space for isometric view).
- **Resolution**: Design for 1080p displays, with scaling for higher resolutions to maintain pixel-perfect appearance.
- **Color Depth**: 256 colors or less per palette, using indexed color modes to evoke retro limitations.

Visual Reference: Imagine a grid overlay on isometric tiles, with 16-pixel squares aligned to the diamond-shaped isometric projection, ensuring sprites fit cleanly without anti-aliasing.

Rationale: The 16-pixel grid balances detail with retro authenticity, allowing for scalable assets that render crisply in WebGL.

Alternative Approaches:
- 32-pixel grid: Pros - More detailed sprites; Cons - Increased file sizes, less retro.
- Vector-based grid: Pros - Scalable without pixelation; Cons - Modern look, harder to achieve isometric depth.

### Pixel Art Guidelines
- **Style**: Sharp, aliased pixels with no anti-aliasing. Use dithering for gradients.
- **Shading**: Simple flat shading with highlights and shadows to convey depth in isometric view.
- **Outlines**: Thin 1-pixel black outlines for object definition.
- **Transparency**: Use alpha channels sparingly; prefer solid colors for performance.
- **Tools**: Recommended: Aseprite or GraphicsGale for pixel-perfect editing.

Rationale: These guidelines preserve the pixel art aesthetic, ensuring assets integrate seamlessly into the Three.js-rendered isometric environment.

Alternative Approaches:
- Smooth shading: Pros - Realistic depth; Cons - Breaks retro immersion.
- No outlines: Pros - Minimalist; Cons - Poor definition in low-res.

## Asset List with Priorities

Assets are categorized by zone (e.g., Lobby, Project Room) and prioritized as MVP (essential for core functionality) or Nice-to-Have (enhancements for polish).

### Lobby Zone
- **Floor Tiles** (MVP): 16x16 isometric tiles for carpet/wood. Variants: clean, worn.
- **Walls** (MVP): 16x32 wall segments with windows/doors.
- **Furniture**: Desk (MVP), Chair (MVP), Lamp (Nice-to-Have).
- **Decor**: Plants (Nice-to-Have), Posters (Nice-to-Have).

### Project Room Zone
- **Desks** (MVP): Interactive desks with clutter. Variants: empty, with items.
- **Bookshelves** (MVP): Filled with books/code icons.
- **Monitors/Screens** (MVP): Displaying project previews.
- **Tech Items** (Nice-to-Have): Keyboards, mice, coffee mugs.

### About Room Zone
- **Personal Items** (MVP): Photo frames, awards.
- **Seating** (MVP): Sofa, armchair.
- **Ambient Objects** (Nice-to-Have): Clocks, paintings.

### Contact Room Zone
- **Forms/Inputs** (MVP): Pixel art UI for contact form.
- **Mailboxes** (Nice-to-Have): Decorative elements.

### Shared/Global Assets
- **Player Character** (MVP): Isometric sprite for user avatar.
- **UI Elements** (MVP): Buttons, modals, tooltips in pixel style.
- **Easter Eggs** (Nice-to-Have): Hidden sprites like secret items.
- **Backgrounds** (MVP): Sky/window views.

Visual Reference: A tiled isometric office layout with labeled zones, showing desks as interactive hotspots and ambient plants for detail.

Rationale: Prioritizing MVP assets ensures a playable core experience, with nice-to-haves adding depth without delaying launch.

Alternative Approaches:
- All assets as MVP: Pros - Complete from start; Cons - Overwhelms production timeline.
- Minimal assets: Pros - Faster development; Cons - Bland environment.

## Animation Frame Breakdown

Animations use frame-based sprites at 8-12 FPS for smooth retro motion. Each animation cycle is 4-8 frames.

### Character States
- **Idle**: 1 frame (standing still).
- **Walking**: 4 frames (left, right, up, down directions). Cycle: step1, step2, step1, idle.
- **Interacting**: 2 frames (reach out, return).

### Object States
- **Desk Hover**: 2 frames (glow on, glow off).
- **Lamp Flicker**: 3 frames (on, dim, on).
- **Window Zoom**: 4 frames (zoom in sequence).
- **Bookshelf Reveal**: 4 frames (books slide out).

Visual Reference: Sprite sheets showing character walking cycle with directional arrows, and desk hover with glowing outline.

Rationale: Frame-based animations evoke classic games, keeping file sizes small and performance high.

Alternative Approaches:
- CSS animations: Pros - Easy integration; Cons - Less pixel-perfect, modern feel.
- Real-time 3D: Pros - Dynamic; Cons - Resource intensive.

## Sound Design Recommendations

Sounds enhance immersion with retro effects. Use short, looped clips.

### File Formats
- **Primary**: OGG for web compatibility (smaller size).
- **Fallback**: MP3 for broader support.
- **Avoid**: WAV due to large sizes.

### Recommendations
- **Footsteps**: Soft taps for walking (looped).
- **Interactions**: Click sounds for buttons/desks.
- **Ambient**: Office hum, keyboard typing (subtle loops).
- **Easter Eggs**: Fun chimes or surprises.

Rationale: Compressed formats reduce load times, fitting the web-based nature.

Alternative Approaches:
- No sound: Pros - Accessible, no bandwidth; Cons - Less immersive.
- High-fidelity audio: Pros - Rich; Cons - Large files, not retro.

## Naming Conventions

Consistent naming aids organization and integration.

### Files and Sprites
- Format: `category_object_state_variant.png` (e.g., `sprite_desk_idle_clean.png`).
- Animations: `anim_object_action_frame.png` (e.g., `anim_character_walk_01.png`).
- Sounds: `sound_category_action.ogg` (e.g., `sound_ui_click.ogg`).

### Directories
- `/assets/sprites/zones/` for zone-specific.
- `/assets/animations/` for frames.
- `/assets/sounds/` for audio.

Rationale: Clear naming prevents confusion in asset loading and maintenance.

Alternative Approaches:
- Random names: Pros - Quick; Cons - Hard to manage.
- UUIDs: Pros - Unique; Cons - Unreadable.

## Conclusion

This guide outlines all necessary assets for the Interactive Isometric Pixel Portfolio, ensuring a cohesive, engaging experience. Key sections include guidelines, prioritized lists, animations, sounds, and conventions, with rationales for decisions and alternatives for flexibility.

No open questions; the guide is complete based on project context.