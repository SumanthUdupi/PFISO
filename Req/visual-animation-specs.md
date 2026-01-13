# Visual & Animation Systems Review and Requirements

## 1. Executive Summary
The current implementation utilizes a clean, procedural approach suitable for efficient web-based 3D. However, to achieve a "next-gen" aesthetic and feel, the system requires a transition from simple mathematical oscillators to layered, physics-driven animation systems, and a significant upgrade to the rendering pipeline (lighting, shadows, and post-processing).

## 2. Critical Issues Analysis

### 2.1 Mouse Tracking & Head Mechanics
*   **Current State:** Uses a simple raycast-to-plane method (`dummyPlane`). This projects the mouse onto an invisible wall at fixed camera depth.
*   **Issues:**
    *   **Perspective Disconnect:** The tracking plane is perpendicular to the camera, not the world. This can cause the head to look "past" objects rather than "at" them.
    *   **Linear Smoothing:** The `Math.exp(-10 * delta)` smoothing is functional but feels robotic. It lacks biological subtle movements (saccades, micro-jitters) and weight (overshoot/settle).
    *   **Whole-Body Locking:** The head tracking operates independently of the body torso. Real movement involves the spine and shoulders twisting to accommodate the head look.

### 2.2 Animation Systems
*   **Current State:** 100% Procedural Sine/Cosine waves for limbs.
*   **Issues:**
    *   **"Floaty" Walk Cycle:** The character slides while legs swing. There is no foot planting or Inverse Kinematics (IK), leading to significant foot sliding.
    *   **Rigidity:** Limb movements are rigid rotations. No secondary motion (overlapping action) on hands or hair during turns.
    *   **State Transitions:** Transitions between "Idle" and "Moving" are linear lerps (`lerpSpeed = 0.1`). This feels mechanical rather than organic.

### 2.3 Visual Quality
*   **Current State:** Standard `RoundedBox` geometry, `MeshStandardMaterial`, basic directional shadows.
*   **Issues:**
    *   **Flat Lighting:** Lack of Ambient Occlusion (SSAO) grounds objects poorly. The character looks like it's floating.
    *   **Shadow Artifacts:** Standard shadow maps often have jagged edges or "peter-panning" (gap between object and shadow).
    *   **Material Definition:** Materials are distinguishable but lack surface detail (imperfections, subsurface scattering approximation for skin).

---

## 3. Technical Specifications & Requirements

### 3.1 Head & Eye Tracking System (Next-Gen)
**Goal:** Implementation of a biomechanically accurate gaze system.

*   **REQ-TRK-001 (Targeting):** Replace `dummyPlane` with a scene-aware raycast (with fallback to plane). The character should look at *geometry* first, then space.
*   **REQ-TRK-002 (Multi-Layer Rotation):** Split rotation into three layers:
    *   **Eyes:** Fast response, high range (+/- 45 deg).
    *   **Head/Neck:** Medium response, medium range (+/- 70 deg).
    *   **Spine/Torso:** Slow response, engages only when look angle exceeds 60 deg.
*   **REQ-TRK-003 (Damping):** Implement Spring-Damper physics (Critically Damped) for head rotation instead of simple Lerp to add "weight".
*   **REQ-TRK-004 (Saccades):** Inject micro-movements (Perlin noise) into the eye target to simulate human attention shifting.

### 3.2 Advanced Animation Physics
**Goal:** Fluid, weight-based movement masking the lack of skeletal rigging.

*   **REQ-ANIM-001 (Procedural IK):** Implement simple 2-bone IK for legs to ensure feet *stick* to the ground plane during the stance phase of the walk cycle.
*   **REQ-ANIM-002 (Velocity Tilting):** Enhance the current tilt mechanics. Add "drag" to the head—when body accelerates forward, head should lag slightly backwards (inertia).
*   **REQ-ANIM-003 (Secondary Motion):** Apply spring physics to "appendages" (hair, tie, hands). When character stops abruptly, these elements should swing forward and settle.
*   **REQ-ANIM-004 (Squash & Stretch 2.0):** Preserve volume accurately. Current implementation is good but should react to *horizontal* impacts (hitting walls) not just vertical jumps.

### 3.3 Visual Fidelity Upgrade
**Goal:** High-end rendering within WebGL constraints.

*   **REQ-VIS-001 (Lighting):** Implement Environment Mapping (HDRI) for realistic reflections on "shiny" materials (shoes, eyes).
*   **REQ-VIS-002 (Shadows):** Replace or augment shadow maps with **Contact Shadows** or **Accumulative Shadows** (Soft Shadows) for a grounded look.
*   **REQ-VIS-003 (Post-Processing):**
    *   **SSAO (Screen Space Ambient Occlusion):** Critical for depth perception between the tie, shirt, and jacket.
    *   **Vignette & Chromatic Aberration:** Subtle lens imperfections to ground the digital image.
    *   **Grain:** Very faint film grain to reduce color banding and add texture.
*   **REQ-VIS-004 (Particles):** Upgrade `VoxelDust` to soft, transparency-faded particles (sprites) rather than solid cubes, or refine geometry dust to tumble and shrink.

---

## 4. Implementation Roadmap

### Phase 1: The Foundation (Visuals)
*   **Task 1:** Install `@react-three/postprocessing` (if not fully utilized) and configure **N8AO** (or standard SSAO) for high-performance occlusion.
*   **Task 2:** Upgrade lighting setup. Add a subtle Rim Light to separate character from background.
*   **Task 3:** Tune materials. Increase Roughness contrast between Cloth (high roughness) and Skin/Eyes (low roughness).

### Phase 2: The Core (Mechanics)
*   **Task 4:** Refactor `RobloxCharacter.tsx` to accept a `targetPoint` (Vector3) instead of calculating it internally. Move logic to a `useHeadTracking` hook.
*   **Task 5:** Implement the "Spine Twist" logic. When head turns left, rotate torso 20% to the left.
*   **Task 6:** Implement Spring physics for head rotation (using `react-spring` or custom Verlet integration).

### Phase 3: The Polish (Animation)
*   **Task 7:** Implement Foot IK. Calculate foot positions based on sine wave but clamp Y to 0 and adjust Z to minimize sliding.
*   **Task 8:** Add secondary motion springs to the Hair and Tie.

---

## 5. Performance Targets

| Metric | Target | Constraints |
| :--- | :--- | :--- |
| **Frame Rate** | 60 FPS (Stable) | Max 16ms per frame logic budget. |
| **Draw Calls** | < 50 | Heavy use of instancing for particles/environment. |
| **Input Latency** | < 30ms | Mouse-to-Head movement delay. |
| **Load Time** | < 1.5s | Asset optimization (compress textures/models). |

---

## 6. Visual Benchmarks (References)
*   **Lighting:** *Journey* (Edge lighting, soft gradients).
*   **Animation:** *Animal Crossing* (Bouncy, procedural feel but polished).
*   **UI Integration:** *The Division* (Diegetic UI floating in world space).
