# 09 - Mobile Experience & Adaptation

**Project:** Interactive 3D Portfolio (PFISO)

## 1. Philosophy: "Pocket World"
The mobile version is not a "lite" version; it is a tailored, tactile experience. It should feel like holding a small portal to the office in your hands.
- **Goal:** Retain the "Cozy" and "Immersive" feel while accommodating touch controls and hardware limitations.
- **Orientation:** **Landscape Mode Locked** (Best for 3D exploration). *Optional: Portrait mode triggers a traditional scrollable 2D resume fallback for quick access.*

## 2. Controls: Touch & Tactility
Replacing WASD + Mouse with intuitive touch inputs.

### Primary Scheme: Dual Virtual Joysticks
- **Left Stick (Floating):** Movement (Walk/Strafe).
- **Right Zone (Invisible):** Camera Look.
- **Gyro Look (Optional):** "Magic Window" mode. Tilting the phone tilts the camera slightly, adding physical immersion.

### Interaction (Tap System)
- **Tap World:** If player taps an object directly (3D touch):
    - **Nearby:** Interacts instantly (Open drawer, toggle lamp).
    - **Far:** Moves player towards that object (NavMesh pathfinding) - *Accessible "Point & Click" mode.*
- **Action Button:** A definitive "Interact" button appears on the HUD when the crosshair is over a target, preventing mis-clicks.

### Haptics (Vibration)
Mobile offers physical feedback that PC lacks.
- **Footsteps:** Extremely subtle ticks on step.
- **UI:** Crisp 'taptic' feedback on button presses.
- **Collision:** Thud when bumping into a wall.

## 3. UI Adaptation: "Thumbtip Design"
- **HUD Layout:**
    - **Top Left:** Menu / Journal Icon.
    - **Top Right:** Camera Mode / Settings.
    - **Bottom Corners:** Control zones (Clear of UI).
- **Modals:**
    - **Card View:** "Project" and "Bio" modals should slide up from the bottom (Sheet style) rather than center overlay, allowing user to swipe down to close.
    - **Font Sizing:** Text scaled up ~1.2x for readability on small screens.
- **Cozy UI:**
    - The "Journal" takes up the full screen on mobile, turning pages with swipe gestures.

## 4. Feature Parity & Simplification
Adapting complex interactions for touch.
- **Coffee:**
    - *PC:* Hold Right Click to sip.
    - *Mobile:* Tap the mug icon that appears. Phone vibrates + Audio plays.
- **Physics Toys:**
    - *Newton's Cradle:* Swipe finger across it to trigger physics.
    - *Vinyl Player:* Swipe gesture to "scratch" the record or drop the needle.
- **Journal:**
    - Use "Pinch to Zoom" to view sketches/photos in detail.

## 5. Mobile Performance Strategy
Mobile GPUs vary wildly; optimization is key to maintaining the "Fun".
- **Dynamic Resolution Scaling (DRS):** Automatically lower render scale during movement to keep 30/60 FPS.
- **Lighting Cutbacks:**
    - Disable Real-time Reflection Probes (use static cubemaps).
    - Reduce Shadow Map resolution (or use blob shadows for small objects).
    - Disable Volumetric Fog (expensive) -> Use billboard "Fake Godrays".
- **Battery Saver:** Cap FPS at 30 when no input is detected for >5 seconds.

## 6. Mobile-Specific Polish
- **Safe Areas:** Respect the "Notch" and "Home Bar" (iPhone safe areas).
- **Touch Ripples:** Visual ripple effect on screen touch (feedback).
- **Load Times:** Critical. Aggressive texture compression (ASTC/ETC2 if supported, or small WebP).

## 7. Success Metric
The "Thumb Test": Can the user navigate from the Reception to the Workstation and open a project using *only* their thumbs, without frustration, in under 15 seconds?
