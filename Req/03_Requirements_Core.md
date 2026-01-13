# detailed Requirement Documents: Part 1 (Core Mechanics)

**Includes:** MECH-001, MECH-002, MECH-003, MECH-004, MECH-005

---

## [MECH-001] Canonical Physics Engine Integration

**Improvement ID:** MECH-001  
**Title:** Canonical Physics Engine Integration  
**Priority:** Critical (P0)  
**Category:** Physics  
**Complexity:** Very High  
**Estimated Effort:** 2 Weeks  

### 1. EXECUTIVE SUMMARY
Transition the game's physics from a custom, ad-hoc ad-hoc velocity injection system to a canonical rigid-body physics engine (Rapier or Cannon.js). This is critical to support stable collisions, complex interactions, and future extensibility without reinventing wheel physics.

### 2. CURRENT STATE ANALYSIS
- **File:** `src/components/game/Player.tsx`
- **Logic:** Manual Euler integration: `pos += vel * dt`, `vel += acc * dt`.
- **Issues:** 
  - No continuous collision detection (CCD).
  - No object-to-object collision resolution (only ground plane check `y <= 0`).
  - Prone to tunneling at high speeds.
  - Hard to scale (e.g., adding crates or slopes requires custom math).
- **Architecture:** Physics logic is embedded directly inside the React `useFrame` loop of the Player component.

### 3. PROBLEM STATEMENT
The current custom physics implementation is insufficient for a polished game. It lacks spatial partitioning, broad-phase collision detection, and stable solver iterations. Adding new features (like wall-sliding or pushing objects) requires writing complex vector math from scratch, increasing technical debt and bug surface area.

### 4. PROPOSED SOLUTION

#### 4.1 Functional Requirements
- Integrate `@react-three/rapier` (recommended for performance) or `@react-three/cannon`.
- Replace manual position updates with physics body force/impulse application.
- Maintain existing "Game Feel" (snappy movement) while using the engine.

#### 4.2 Technical Specifications
- **Dependency:** Install `@react-three/rapier`.
- **World:** Wrap `Lobby.tsx` scene in `<Physics>`.
- **Player:** Wrap Player mesh in `<RigidBody type="dynamic" lockRotations>`.
- **Environment:** Wrap Floor/Walls in `<RigidBody type="fixed">`.

#### 4.3 Physics & Mathematics
- **Force Application:** $F = m \cdot a$. Apply forces for movement instead of setting velocity directly, or use `setLinvel` for kinematic-like control if needed for snappy response.
- **Friction:** Set default material friction = 0.5, Restitution = 0.0 (no bounce).

### 5. DESIGN PARAMETERS
- **Gravity:** -9.81 m/s² (or -30 as currently tuned).
- **Mass:** Player = 70kg.
- **Damping:** Linear Damping = 0.5 (air resistance).

### 6. DEPENDENCIES
- NPM Package: `@react-three/rapier`
- React Context update for Physics World.

### 7. ACCEPTANCE CRITERIA
- Player collides with walls (stops moving) instead of passing through or clipping.
- Player falls and lands on floor using engine gravity.
- Performance maintains 60 FPS.

---

## [MECH-002] Capsule Collider Implementation

**Improvement ID:** MECH-002  
**Title:** Capsule Collider Implementation  
**Priority:** Critical (P0)  
**Category:** core Mechanics  
**Complexity:** Medium  
**Estimated Effort:** 3 Days  

### 1. EXECUTIVE SUMMARY
Replace the point-based or box-based collision checks with a Capsule Collider for the player. This ensures smooth movement over small obstacles, prevents getting stuck on corners, and better represents a humanoid shape.

### 2. CURRENT STATE ANALYSIS
- **File:** `Player.tsx`
- **Current Shape:** Implicit point or simple bounds check.
- **Problem:** Point collision causes "snagging" on geometry seams. Box collision causes getting stuck when rotating near walls.

### 3. PROPOSED SOLUTION
#### 4.1 Functional Requirements
- Player uses a vertical Capsule (Cylinder with rounded ends).
- Dimensions: Height ~1.8m, Radius ~0.3m.

#### 4.2 Technical Specifications
- **Rapier:** `<CapsuleCollider args={[halfHeight, radius]} />`
- **Offset:** Pivot is usually at center, so offset Y by half height so pivot is at feet (or adjust visual).

### 7. ACCEPTANCE CRITERIA
- Player slides off sharp corners.
- Player can step up small height differences (step offset) if utilizing a Kinematic Character Controller, or slide over if dynamic.

---

## [MECH-003] Fixed Timestep Physics Loop

**Improvement ID:** MECH-003  
**Title:** Fixed Timestep Physics Loop  
**Priority:** Critical (P0)  
**Category:** Core Mechanics  
**Complexity:** High  
**Estimated Effort:** 5 Days  

### 1. EXECUTIVE SUMMARY
Decouple the game logic simulation from the visual frame rate. Even without a physics engine, using a fixed timestep (e.g., 60hz) ensures consistent jump heights and movement speeds across 144hz monitors and 30fps mobile devices.

### 2. CURRENT STATE ANALYSIS
- **Current:** `useFrame((state, delta) => ...)`
- **Issue:** Euler integration varies with `delta`. If `delta` spikes (lag), integration errors accumulate. A lag spike during a jump could result in falling through the floor or jumping super high.

### 3. PROPOSED SOLUTION
- Implement an "Accumulator" pattern.
- **Logic:**
  ```typescript
  const FIXED_STEP = 1/60;
  let accumulator = 0;
  useFrame((state, delta) => {
    accumulator += delta;
    while (accumulator >= FIXED_STEP) {
      physicsWorld.step(FIXED_STEP);
      accumulator -= FIXED_STEP;
    }
    // Interpolate visuals
  })
  ```
- (Note: Most physics engines like Rapier handle this internally, but if keeping custom logic, this is mandatory).

---

## [MECH-004] Slope and Stair Handling

**Improvement ID:** MECH-004  
**Title:** Slope and Stair Handling  
**Priority:** High (P1)  
**Category:** Core Mechanics  
**Complexity:** High  
**Estimated Effort:** 1 Week  

### 1. EXECUTIVE SUMMARY
Enable the player to traverse non-flat terrain (ramps, stairs) smoothly without sliding down or launching into the air.

### 2. CURRENT STATE ANALYSIS
- **Current:** Ground is assumed flat `y = 0`.
- **Problem:** Any non-zero Y geometry will act as a wall or prevent movement.

### 3. PROPOSED SOLUTION
- **Slope Physics:**
  - Project Movement Vector onto the plane of the ground normal.
  - $V_{planar} = V - (V \cdot N) \cdot N$
- **Max Slope Angle:** Prevent climbing slopes > 45 degrees.
- **Snap to Ground:** When moving down a slope, apply a downward force to keep player grounded (prevent "skiing" off ramps).

---

## [MECH-005] Input Buffering System

**Improvement ID:** MECH-005  
**Title:** Input Buffering System  
**Priority:** High (P1)  
**Category:** Core Mechanics  
**Complexity:** Medium  
**Estimated Effort:** 3 Days  

### 1. EXECUTIVE SUMMARY
Implement an Input Buffer (Queue) that stores player inputs (like Jump or Attack) for a short duration (e.g., 0.15s) if they occur during a non-actionable state (like mid-air or attack recovery), and executes them immediately once the state becomes valid.

### 2. CURRENT STATE ANALYSIS
- **Current:** Naive check. `if (isGrounded && keyPressed) Jump()`.
- **Problem:** If player presses Jump 0.05s before landing, the input is ignored. This feels unresponsive.

### 3. PROPOSED SOLUTION
- **Buffer Timer:**
  - On Press Jump: `jumpBuffer = 0.15` (seconds).
  - Update: `jumpBuffer -= dt`.
  - On Land: `if (jumpBuffer > 0) ExecuteJump()`.
- **Result:** Frame-perfect timing is no longer required, making the game feel "responsive" and "fair".

### 4. IMPLEMENTATION
- **File:** `Player.tsx` references `JUMP_BUFFER` but check implementation correctness.
- **Refinement:** Ensure this applies to Interacts and Dashes as well.

---
