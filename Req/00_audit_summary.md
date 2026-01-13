# Game Data & Visual Audit Summary Report

**Total Items:** 50
**Date:** 2026-01-13
**Auditor:** Antigravity AI

---

## 1. Visual Art & Aesthetics (12 Items)

### [Critical] [Art] Lighting: Lack of Environmental Reflection
- **Current State:** Basic `AmbientLight` + `DirectionalLight`. Materials like `skin` (roughness 0.3) and `shoe` (roughness 0.1) have nothing to reflect.
- **Problem:** Objects look plastic and floaty; metals and smooth surfaces look flat.
- **Proposed Solution:** Implement `Environment` from `@react-three/drei` with a low-res HDRI (e.g., "city" or "studio" preset) for realistic PBR reflections.
- **Impact:** Dramatic increase in realism and material definition.
- **Difficulty:** Easy

### [High] [Art] Shadows: Peter-Panning Artifacts
- **Current State:** Standard `PCFSoftShadowMap`.
- **Problem:** Visible gaps between objects and their shadows (peter-panning) and jagged edges on diagonal lines.
- **Proposed Solution:** Switch to `ContactShadows` or `AccumulativeShadows` for the character to ground them firmly. Tune `shadow-bias` carefully for directional lights.
- **Impact:** Character feels "planted" on the ground.
- **Difficulty:** Medium

### [High] [Art] Color Palette: Inconsistent Zoning
- **Current State:** Hardcoded hex values scattered in components (`#4b3b60`, `#ff9966`).
- **Problem:** Difficult to maintain thematic consistency or implement "Dark Mode" properly.
- **Proposed Solution:** Centralize all colors into a `ThemeContext` or `constants/theme.ts`. Define semantic names (e.g., `primaryGlow`, `dangerZone`).
- **Impact:** Unifies visual language and simplifies iteration.
- **Difficulty:** Medium

### [Medium] [Art] Materials: Skin Subsurface Scattering
- **Current State:** `MeshStandardMaterial` with color `#ffdbac`.
- **Problem:** Skin looks like painted wood or plastic.
- **Proposed Solution:** Use `MeshPhysicalMaterial` with `transmission` or custom shader to simulate slight light bleed (fast SSS approximation).
- **Impact:** More organic, lifelike character.
- **Difficulty:** Complex

### [Medium] [Art] Particle Quality: Hard Edges
- **Current State:** "Motes" are likely simple meshes or points.
- **Problem:** If they intersect geometry, they create harsh lines.
- **Proposed Solution:** Use soft particles (textures with alpha falloff) and depth testing to fade out near geometry.
- **Impact:** Soft, magical atmosphere.
- **Difficulty:** Medium

### [Medium] [Art] Post-Processing: Lack of Depth
- **Current State:** Basic rendering.
- **Problem:** Scene feels flat; no sense of scale.
- **Proposed Solution:** Add `EffectComposer` with `DepthOfField` (subtle) and `Vignette`.
- **Impact:** Cinematic look that guides eye to the center.
- **Difficulty:** Medium

### [Medium] [Art] UI Integration: Flat Overlay
- **Current State:** HTML overlay sits "on top" of 3D.
- **Problem:** Disconnect between the game world and the UI.
- **Proposed Solution:** Use "Diegetic" UI where possible (floating 3D text in world space) or add blur backdrop filters to HTML UI to blend it.
- **Impact:** Immersive experience.
- **Difficulty:** Medium

### [Low] [Art] Character Proportions: Generic RoundedBox
- **Current State:** `RoundedBox` for all body parts.
- **Problem:** Very "Roblox-like" aesthetic which may be intended but limits expression.
- **Proposed Solution:** Model slight variations (tapering limbs) or custom low-poly geometry.
- **Impact:** Unique artistic identity.
- **Difficulty:** Complex

### [Low] [Art] Textures: Procedural Colors Only
- **Current State:** Solid colors only.
- **Problem:** Lack of high-frequency detail (fabric weave, scratches).
- **Proposed Solution:** Add detailed normal maps tiling over the `suit` and `floor` materials.
- **Impact:** Adds richness when viewed close-up.
- **Difficulty:** Medium

### [Low] [Art] Ambient Occlusion: Missing Local Shadows
- **Current State:** No SSAO mentioned.
- **Problem:** Creases (neck meeting shirt, tie on shirt) lack definition.
- **Proposed Solution:** Enable `N8AO` (efficient SSAO) via post-processing.
- **Impact:** Adds volumetric feel to geometry.
- **Difficulty:** Easy

### [Low] [Art] Emotion: Static Face
- **Current State:** Static geometry for eyes and mouth.
- **Problem:** Character feels mannequin-like.
- **Proposed Solution:** Swap eye texture/geometry to blink randomly or look at headers.
- **Impact:** Character feels alive.
- **Difficulty:** Medium

### [Critcal] [Art] Visual Consistency: Mobile vs Desktop
- **Current State:** Mobile hides details; desktop shows all.
- **Problem:** Mobile experience feels "lesser" rather than "optimized".
- **Proposed Solution:** Create specific mobile-first assets (baked lighting textures) to maintain quality without high cost.
- **Impact:** Consistent brand experience.
- **Difficulty:** High

---

## 2. Asset Management (8 Items)

### [High] [Asset] Organization: Scattered Data
- **Current State:** JSON data in `assets/data/`.
- **Problem:** Hard to manage large datasets or localize.
- **Proposed Solution:** Move content to a CMS structure or strictly typed TypeScript content files.
- **Impact:** Easier content updates.
- **Difficulty:** Medium

### [High] [Asset] File Formats: Raw Images
- **Current State:** `placeholder_hero.webp` exists, but check for PNG/JPG usage in `projects` folder.
- **Problem:** Potential for large file sizes.
- **Proposed Solution:** Enforce WebP/AVIF for all static textures.
- **Impact:** Faster load times.
- **Difficulty:** Easy

### [Medium] [Asset] Preloading: None Evident
- **Current State:** `Suspense` handles loading but no predictive preloading.
- **Problem:** Pop-in when opening modals with images.
- **Proposed Solution:** Implement a `texturePreloader` that loads project images in background after main scene load.
- **Impact:** Smoother UX.
- **Difficulty:** Medium

### [Medium] [Asset] Naming Convention: Inconsistent
- **Current State:** Mix of snake_case and camelCase in file names.
- **Problem:** Confusing when importing (e.g., `generate_lego_sprites.py` vs `RobloxCharacter.tsx`).
- **Proposed Solution:** Enforce: `PascalCase` for Components, `camelCase` for utils/hooks, `snake_case` for assets/scripts.
- **Impact:** Professional codebase standards.
- **Difficulty:** Easy

### [Medium] [Asset] Audio: Hardcoded Management
- **Current State:** `audioStore.ts` handles sound.
- **Problem:** If audio files are large, they block main thread or delay TTI.
- **Proposed Solution:** Use `Howler.js` sprites or verify audio is streaming/lazy-loaded.
- **Impact:** Performance safety.
- **Difficulty:** Medium

### [Low] [Asset] Python Scripts: Manual Execution
- **Current State:** `pack_sprites.py` in root.
- **Problem:** Manual step required to update assets.
- **Proposed Solution:** Integrate into `npm run assets` or a pre-build hook.
- **Impact:** Developer Experience (DX).
- **Difficulty:** Medium

### [Low] [Asset] Unused Files: Cleanup
- **Current State:** `effects_verification.png` (1.7MB) in root.
- **Problem:** Bloats repository.
- **Proposed Solution:** Move to a `docs` or `_ref` folder, exclude from build.
- **Impact:** Cleaner repo.
- **Difficulty:** Easy

### [Low] [Asset] Fonts: Google Fonts Optimization
- **Current State:** Likely loaded via CSS import.
- **Problem:** Render blocking.
- **Proposed Solution:** Self-host fonts (woff2) and subset them.
- **Impact:** Faster FCP (First Contentful Paint).
- **Difficulty:** Medium

---

## 3. Positioning & Layout (10 Items)

### [Critical] [UX] Camera: Mobile Framing
- **Current State:** `useEffect` in `CameraController` manually sets zoom.
- **Problem:** Hard jumps when resizing window or rotating device.
- **Proposed Solution:** Use `MathUtils.lerp` in `useFrame` to smooth camera zoom transitions based on viewport aspect ratio.
- **Impact:** Fluid response to device changes.
- **Difficulty:** Medium

### [High] [UX] Click Targets: Floor Interaction
- **Current State:** `handleFloorClick` raycasts against a plane.
- **Problem:** Users might miss interactable objects and click floor, causing accidental walking.
- **Proposed Solution:** Implement priority raycasting: Check UI/Objects first, if no hit, *then* allow floor click.
- **Impact:** Prevents frustration.
- **Difficulty:** Medium

### [High] [UX] UI Scaling: Fixed Pixels
- **Current State:** `MobileControls` likely uses fixed pixel sizes.
- **Problem:** Tiny buttons on high-DPI small screens.
- **Proposed Solution:** Use `rem` or viewport units (`vw`, `dvh`) for touch overlays.
- **Impact:** Accessibility.
- **Difficulty:** Medium

### [Medium] [UX] Z-Fighting: Overlapping Geometry
- **Current State:** Ties/Shirts use small offsets (`0.005`).
- **Problem:** Z-fighting (flickering) at far distances or steep angles.
- **Proposed Solution:** Merge geometries or increase separation slightly for camera distance.
- **Impact:** Visual stability.
- **Difficulty:** Medium

### [Medium] [UX] Responsive Layout: Portrait Mode
- **Current State:** "Project" drawer slides up over 3D view.
- **Problem:** 3D view can feel cramped or hidden.
- **Proposed Solution:** Adjust camera target Y-offset when drawer is open to keep character visible in the top portion.
- **Impact:** Context preservation.
- **Difficulty:** Medium

### [Medium] [UX] Navigation: Click vs WASD
- **Current State:** Supports both.
- **Problem:** No visual indicator of *where* clicked.
- **Proposed Solution:** Spawn a "ripple" or "target marker" effect at click location (in `ClickMarker.tsx` - verify it's polished).
- **Impact:** Feedback confirmation.
- **Difficulty:** Easy

### [Low] [UX] Scroll: Wheel Events
- **Current State:** `OrbitControls` handles zoom.
- **Problem:** Scrolling might fight with page scroll if embedded.
- **Proposed Solution:** Disable scroll zoom on `OrbitControls` unless a modifier key (Ctrl) is pressed, or if in fullscreen.
- **Impact:** Better webpage coexistence.
- **Difficulty:** Easy

### [Low] [UX] Focus: Focus Management
- **Current State:** `closestObject` logic runs every frame.
- **Problem:** Can flicker if on boundary.
- **Proposed Solution:** Add hysteresis (require moving 0.5 units *closer* to switch focus than to lose it).
- **Impact:** Stable UI prompts.
- **Difficulty:** Medium

### [Low] [UX] Boundaries: Invisible Walls
- **Current State:** `Walls` component visualizes limits.
- **Problem:** Character can clip through if `clamp` logic isn't robust.
- **Proposed Solution:** Use physics collider (Rapier) or strict bounding box clamping in `Player.tsx`.
- **Impact:** Bug prevention.
- **Difficulty:** Medium

### [Low] [UX] Loading: Blank Screen
- **Current State:** `<Suspense fallback={<LoadingScreen />}>`.
- **Problem:** If `LoadingScreen` is heavy, user sees white.
- **Proposed Solution:** Ensure `LoadingScreen` is pure CSS/HTML and in `index.html` (removed after React mounts).
- **Impact:** Immediate feedback.
- **Difficulty:** Easy

---

## 4. Technical Issues (10 Items)

### [Critical] [Tech] Animation Loop: Raycasting Cost
- **Current State:** Raycasting runs every frame in `RobloxCharacter`.
- **Problem:** Expensive operation on CPU.
- **Proposed Solution:** Throttle raycasting to 10-15ms or use a spatial index (BVH) if scene grows. For now, throttle is sufficient.
- **Impact:** CPU usage reduction.
- **Difficulty:** Medium

### [High] [Tech] State Management: Prop Drilling
- **Current State:** Passing `projectsData` and state deep into components.
- **Problem:** Rerenders entire tree on small updates.
- **Proposed Solution:** Move UI state to Zustand `useGameStore`.
- **Impact:** Render performance.
- **Difficulty:** Medium

### [High] [Tech] Event Listeners: Cleanup
- **Current State:** `window.addEventListener('keydown')` in `Lobby`.
- **Problem:** Potential dupes if `Lobby` remounts.
- **Proposed Solution:** Ensure strict cleanup in `useEffect` return (appears correct, but verify `handleKeyDown` stability with `useCallback`).
- **Impact:** Memory leak prevention.
- **Difficulty:** Easy

### [Medium] [Tech] Geometry: Instancing
- **Current State:** `Motes` likely individual meshes?
- **Problem:** High draw calls if 100+ motes.
- **Proposed Solution:** Use `<Instances>` from `@react-three/drei` for all repetitive decor/particles.
- **Impact:** Draw call reduction (Critical for mobile).
- **Difficulty:** Medium

### [Medium] [Tech] Clipping: Near Plane
- **Current State:** `near: 0.1` in `App.tsx`.
- **Problem:** Camera might clip into walls if room is tight.
- **Proposed Solution:** Implement collision detection for camera to push it forward if wall is behind it.
- **Impact:** Polish.
- **Difficulty:** Medium

### [Medium] [Tech] React Keys: Stability
- **Current State:** Map iterations in `App.tsx` use `project.id` (good) or `index`.
- **Problem:** Ensure stable IDs for animations.
- **Proposed Solution:** Verify detailed `key` usage in all lists (skills, motes).
- **Impact:** React reconciliation performance.
- **Difficulty:** Easy

### [Low] [Tech] Math: Object Creation
- **Current State:** `new THREE.Vector3()` in `useFrame` or render loops.
- **Problem:** Garbage Collection (GC) pauses.
- **Proposed Solution:** Reuse single `Vector3` module-level constants or `useMemo` refs for temporary math.
- **Impact:** Stutter-free gameplay.
- **Difficulty:** Medium

### [Low] [Tech] Types: Strictness
- **Current State:** `project: any` in `App.tsx`.
- **Problem:** Loose typing invites runtime errors.
- **Proposed Solution:** Define `interface Project` and `interface Skill` schemas.
- **Impact:** Code reliability.
- **Difficulty:** Easy

### [Low] [Tech] Helpers: Production Code
- **Current State:** `debug_visibility.py` implies there might be debug helpers left in.
- **Problem:** Dead code.
- **Proposed Solution:** Ensure `<Stats>` or `<AxesHelper>` are wrapped in `process.env.NODE_ENV === 'development'`.
- **Impact:** Bundle size.
- **Difficulty:** Easy

### [Low] [Tech] Accessibility: Canvas ARIA
- **Current State:** Canvas is a black box to screen readers.
- **Problem:** No accessibility for blind users.
- **Proposed Solution:** Add `aria-label` or "Canvas fallback content" describing the scene state.
- **Impact:** Inclusivity.
- **Difficulty:** High

---

## 5. Animation & Motion (10 Items)

### [Critical] [Anim] Physics: Foot Sliding
- **Current State:** `Math.sin(t * speed)` for legs.
- **Problem:** Feet move at constant rate regardless of world movement speed, causing sliding.
- **Proposed Solution:** Sync animation speed `t` to valid `velocity.length()`. Calculate exact stride length.
- **Impact:** Visual grounding.
- **Difficulty:** Medium

### [High] [Anim] Head Tracking: Robotic Smoothness
- **Current State:** `Math.exp(-10 * delta)` smoothing.
- **Problem:** Perfect mathematical curve feels robotic.
- **Proposed Solution:** Use `Spring` physics (overshoot and settle) for head rotation.
- **Impact:** Organic feel.
- **Difficulty:** Medium

### [High] [Anim] Transitions: Linear Lerp
- **Current State:** `lerp(current, target, 0.1)`.
- **Problem:** Starts fast, ends slow, but infinite tail.
- **Proposed Solution:** Use `damp` functions from `maath` or `framer-motion` for time-based, frame-independent smoothing.
- **Impact:** Consistent motion on all refresh rates.
- **Difficulty:** Medium

### [Medium] [Anim] Skeletal Rig: Lack Thereof
- **Current State:** Group rotation.
- **Problem:** Seams between joints.
- **Proposed Solution:** Not a full rig, but hide seams by nesting geometry spheres at joint locations ("ball joints").
- **Impact:** Visual polish.
- **Difficulty:** Easy

### [Medium] [Anim] Idle State: Static
- **Current State:** Likely freezes or simple breathe when not moving.
- **Problem:** Boring.
- **Proposed Solution:** Add "micro-idles" (look around, check watch, stretch) triggered every 5-10s.
- **Impact:** Character personality.
- **Difficulty:** Medium

### [Medium] [Anim] Secondary Motion: Rigidity
- **Current State:** Tie/Hair are static relative to head/body.
- **Problem:** Stiff.
- **Proposed Solution:** Add simple spring rotation to Tie/Hair groups based on body velocity change (inertia).
- **Impact:** Fluidity.
- **Difficulty:** Medium

### [Low] [Anim] Anticipation: Instant Move
- **Current State:** Input -> Move immediately.
- **Problem:** Lacks weight.
- **Proposed Solution:** Add 100ms "lean in" animation before velocity is applied.
- **Impact:** Heavy, realistic feel.
- **Difficulty:** High

### [Low] [Anim] Camera: Static Follow
- **Current State:** Rigidly follows player?
- **Problem:** Can feel nauseating or stiff.
- **Proposed Solution:** Soft follow with `damp3` on camera position (lag behind player slightly).
- **Impact:** Smooth cinematic feel.
- **Difficulty:** Medium

### [Low] [Anim] Interactivity: Button Feedback
- **Current State:** Unknown.
- **Problem:** Clicking buttons needs juice.
- **Proposed Solution:** Scale down (`0.95`) on press, spring up (`1.05`) on release.
- **Impact:** Tactile satisfaction.
- **Difficulty:** Easy

### [Low] [Anim] Cursor: System Cursor
- **Current State:** `cursor: crosshair` in CSS.
- **Problem:** Breaks immersion.
- **Proposed Solution:** Custom SVG cursor or a trail renderer following mouse in WebGL.
- **Impact:** Holistic style.
- **Difficulty:** Medium
