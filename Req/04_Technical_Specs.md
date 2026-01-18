# 04 - Technical Specifications

**Project:** Interactive 3D Portfolio Experience (PFISO)

## 1. Core Technology Stack
- **Runtime:** React.
- **3D Engine:** Three.js + React Three Fiber (R3F).
- **Physics:** Rapier (via `@react-three/rapier`) - lightweight, stable.
- **State Management:** Zustand (for game state, inventory, UI triggers).
- **Styling:** Tailwind CSS (for 2D overlays) + Styled Components.
- **Build Tool:** Vite.

## 2. Performance Targets
- **Desktop:** 60 FPS @ 1080p.
- **Mobile:** 30+ FPS (or fallback to a simplified navigation mode).
- **Load Time:** < 3 seconds (Initial TTI).
- **Bundle Size:** Aggressive splitting. Assets lazy-loaded.

## 3. Asset Management Strategy
- **Texture Compression:** All textures converted to `.webp` or `.ktx2` (Basis Universal) for GPU efficiency.
- **Model Optimization:** 
    - Use `gltf-pipeline` for Draco compression.
    - Merge static meshes (walls, floors) into single draw calls (`<Instances />`).
- **LOD (Level of Detail):** Distance-based switching for complex props (e.g., plants).

## 4. Physics & Collision
- **Player Controller:** Capsule collider. Kinematic character controller (Rapier).
- **Interaction Raycast:**
    - Throttle raycasting to 10-20 checks per second (don't act on every frame) OR use `onPointerOver` R3F events which are optimized.
    - R3F event system is preferred over manual raycasting for specific objects.

## 5. Responsive Design
- **Desktop:** Full FPS experience.
- **Mobile:** 
    - **Controls:** Virtual Joystick (Nipple.js or similar).
    - **Orientation:** Lock to Landscape preferred, or handle Portrait with clear "Rotate Device" prompt.
    - **Quality:** Reduce shadow map size, disable expensive post-processing (SSAO/Bloom).

## 6. Code Architecture
- `src/components/world/`: 3D Scene components.
- `src/components/ui/`: 2D React overlays (HUD, Modals).
- `src/stores/`: Zustand stores (`useGameStore`, `useUIStore`).
- `src/hooks/`: Custom hooks (`useInteraction`, `useKeyboard`).
- `public/assets/`: Static GLBs and Textures.
