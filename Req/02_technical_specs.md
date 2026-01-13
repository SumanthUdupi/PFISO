# Technical Requirements Specification

## 1. Functional Requirements

### FR-01: Character Movement System
-   **Input:** System MUST support both WASD/Arrow Keys and Point-to-Click navigation.
-   **Pathfinding:** Character MUST NOT clip through `Walls` or `Decor`. Simple radius-based collision or Raycast constraint is required.
-   **State:** System MUST track states: `Idle`, `Walk`, `Run`, `Interact`.

### FR-02: Camera Control
-   **Zoom:** Camera MUST smoothly interpolate zoom levels when switching between Desktop (Zoom 40) and Mobile (Zoom 55) based on resize events.
-   **Follow:** Camera MUST follow the player with a slight delay (damped spring) to avoid motion sickness.
-   **Occlusion:** Camera MUST NOT be blocked by walls. If a wall is between camera and player, the wall material MUST fade to transparent.

### FR-03: Interaction System
-   **Feedback:** Interactable objects MUST display a "pip" or highlight outline when hovered (Desktop) or nearby (Mobile).
-   **Trigger:** Interaction MUST trigger a specific Modal based on object ID.
-   **Transition:** Camera MUST focus on the specific object (e.g., "Strategy Board") before opening the modal.

## 2. Non-Functional Requirements

### NFR-01: Performance
-   **Frame Rate:** Application MUST run at a stable 60 FPS on mid-tier devices (iPhone 12+, GTX 1060+).
-   **Load Time:** Initial "Time to Interactive" (TTI) MUST be under 2.0 seconds on 4G networks.
-   **Memory:** Heap usage MUST NOT exceed 200MB during extended play sessions. Proper disposal of Geometries/Textures on unmount is mandatory.

### NFR-02: Accessibility
-   **Screen Readers:** Canvas MUST have a fallback DOM sibling with `role="application"` describing current scene state ("Player is near Projects board").
-   **Controls:** All interactions MUST be mapped to keyboard (Enter/Space to interact, Tab to cycle targets).
-   **Motion:** A "Reduce Motion" toggle MUST disable camera damping and heavy transition effects.

## 3. Technical Constraints

-   **Engine:** React Three Fiber (Three.js)
-   **Language:** TypeScript (Strict mode enabled)
-   **Styling:** CSS Modules or Tailwind (if requested) - currently Vanilla CSS variables.
-   **Physics:** Simple Raycast/Box math (No heavy rigid body engine like Cannon.js unless necessary for minigames).

## 4. Asset Specifications

### Models
-   **Format:** GLB (Draco Compression enabled).
-   **Poly Count:** Max 10k tris per character. Max 50k tris for static environment.
-   **Materials:** Standard Metallic-Roughness workflow.

### Textures
-   **Format:** WebP or KTX2.
-   **Size:** Max 1024x1024 for Atlases. Max 512x512 for individual props.
-   **Maps:** Albedo, Normal (Optional), Roughness (In Blue channel of ORM map if possible).

### Audio
-   **Format:** MP3 (Music) / OGG (SFX).
-   **Bitrate:** 128kbps (Music), 64kbps (Voice/SFX).
-   **Loading:** Stream large files; preload small SFX.
