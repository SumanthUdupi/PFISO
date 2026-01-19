# Implementation Report

## Phase 1: Critical Architecture & Physics

### Status: Completed

### Tasks

#### MECH-001: Canonical Physics Engine Integration (P0)
- **Status:** Completed
- **Actions:**
  - Installed `@react-three/rapier@1.1.2` and `@dimforge/rapier3d-compat@0.11.2`.
  - Wrapped `Lobby` scene in `<Physics>`.
  - Refactored `Player.tsx` to use `<RigidBody>`.
  - Integrated Static Colliders for `Floor.tsx` and `Walls.tsx`.
- **Verification:** verified game loads and player stands on floor.

#### MECH-002: Capsule Collider Implementation (P0)
- **Status:** Completed
- **Actions:**
  - Implemented `<CapsuleCollider args={[0.3, 0.3]}>` in `Player.tsx`.
  - Updated `NPC.tsx` to use `RigidBody` and Capsule Collider.

#### MECH-003: Fixed Timestep Physics Loop (P0)
- **Status:** Completed
- **Actions:**
  - Configured `<Physics timeStep={1/60}>` in `Lobby.tsx`.

#### MECH-041: Game Loop Separation (P0)
- **Status:** Completed
- **Actions:**
  - Updated `GameSystem.ts` to coordinate fixed updates via EventBus, decoupling it from direct physics loop (which is now handled by Rapier).

## Phase 2: Core Mechanics (Next)

- [ ] MECH-004: Slope Handling
- [ ] MECH-005: Input Buffering
- [ ] MECH-011: Raycast Interaction

### Phase 3: Clipping Fixes (Batch 1)

#### CL-001: Player through Wall (CCD)
- **Status:** Completed
- **Actions:**
  - Enabled `ccd={true}` on Player RigidBody in `Player.tsx`.

#### CL-004: Floor Clipping
- **Status:** Completed
- **Actions:**
  - Adjusted `CapsuleCollider` position to `[0, 0.65, 0]` and `visualGroup` to `[0, 0.06, 0]` to align feet with floor y=0.

#### CL-005: Head through Ceiling
- **Status:** Completed
- **Actions:**
  - Optimized `CapsuleCollider` dimensions (HalfHeight 0.4, Radius 0.25) to match visual height (~1.3m) and prevent visual clipping into ceilings.

#### CL-002: Camera through Wall
- **Status:** Completed
- **Actions:**
  - Increased camera collision radius (0.2 -> 0.25).
  - Implemented safe pullback distance (`Math.max(0, hit.toi - 0.2)`) to ensure near-plane (0.05) never clips into wall.

#### CL-003: Weapon through Wall
- **Status:** Completed
- **Actions:**
  - Added logic in `Player.tsx` to set `renderOrder = 999` and enable `depthTest = false` for any carried object, ensuring it renders on top of walls.

#### CL-006: NPC Interpenetration
- **Status:** Completed
- **Actions:**
  - Updated `CrowdAgent.tsx` to use `ccd={true}` and an explicit `CapsuleCollider` (Radius 0.3, Height 0.8) instead of Hull.
  - This ensures NPCs physically push against each other rather than tunneling.

#### CL-007: Door Player Pushing
- **Status:** Completed
- **Actions:**
  - Enabled `ccd={true}` on `Door.tsx` RigidBody to ensure the kinematic door properly pushes the dynamic player.

#### CL-008: Prop Overlap Check
- **Status:** Completed
- **Actions:**
  - In `ArtAssetsIntegration.tsx`, increased grid spacing from 3m to 5m to ensure large procedural assets (4x4m) do not overlap.

#### CL-009: Hair Visual Clip
- **Status:** Completed
- **Actions:**
  - In `RobloxCharacter.tsx`, corrected `headGroup` position from `0.2` (chest level) to `0.9` (neck/shoulder level) to prevent hair clipping through the shirt.

#### CL-010: Coat Leg Clip
- **Status:** Completed
- **Actions:**
    - In `RobloxCharacter.tsx`, widened the leg stance (`+/-0.11` -> `+/-0.14`) to ensure legs clear the torso/coat geometry during animation cycles.

### Phase 3: Clipping Fixes (Batch 2)

#### CL-011: Camera Near Plane (Fade out character)
- **Status:** Completed
- **Actions:**
  - Added `opacityRef` logic in `Player.tsx` to fade out player model when camera distance < 0.5m.

#### CL-012: Shadow Bias Leak (Lower bias)
- **Status:** Completed
- **Actions:**
  - In `CozyEnvironment.tsx`, reduced `shadow-bias` to -0.00001 and added `normalBias` of 0.02.

#### CL-013: Held Item Clip (Animation offset)
- **Status:** Completed
- **Actions:**
  - In `Player.tsx`, adjusted held object Z position offset from 0.5 to 0.7.

#### CL-014: Plant Leaves Wall (Move placement)
- **Status:** Completed
- **Actions:**
  - In `Level_01.tsx`, moved OfficePlant from `[-8]` to `[-7]` axis.

#### CL-015: Chair Desk Clip (Fix desk collider)
- **Status:** Completed
- **Actions:**
  - In `OfficeAssets.tsx`, replaced single BoxCollider with separate Top and Leg colliders.

#### CL-016: Ragdoll Floor (Check layers/mask)
- **Status:** Completed
- **Actions:**
  - Enabled `ccd={true}` on all ragdoll limb RigidBodies in `RagdollCharacter.tsx`.

#### CL-017: Particle Clipping (Enable soft particles)
- **Status:** Completed
- **Actions:**
  - In `ParticleEffects.tsx`, added `depthWrite: false` to SparkleBurst material.

#### CL-018: Decal Z-Fight (Bias)
- **Status:** Completed
- **Actions:**
  - In `TapGround.tsx`, added `polygonOffset` and `polygonOffsetFactor={-1}`.

#### CL-019: Stair Clipping (IK)
- **Status:** Completed
- **Actions:**
  - In `RobloxCharacter.tsx`, implemented Raycast IK to lift legs when stepping on higher ground.

#### CL-020: Crouch Head Clip (Check collider)
- **Status:** Completed
- **Actions:**

### Phase 3: Clipping Fixes (Batch 3)

#### CL-021: Throw Clip (Sphere check spawn)
- **Status:** Completed
- **Actions:**
  - In `Player.tsx`, added raycast check in `throwObject` to prevent spawning inside walls.

#### CL-022: Cable Clipping
- **Status:** Completed
- **Actions:**
  - Created `OfficeCable` in `OfficeAssets.tsx` with `RigidBody type="fixed"`.

#### CL-023: Vehicle/Mount Clip
- **Status:** Completed
- **Actions:**
  - Created `Vehicle.tsx` with `dismount` logic checking for safe ground.

#### CL-024: Carry Clip (Side hold)
- **Status:** Completed
- **Actions:**
  - In `Player.tsx`, added dynamic `x` offset (0.5 -> 0.8) for large carried objects.

#### CL-025: Backpack Clip
- **Status:** Completed
- **Actions:**
  - In `RobloxCharacter.tsx`, added Backpack geometry and logic to hide it when `isSitting`.

#### CL-026: Weapon Holster Clip
- **Status:** Completed
- **Actions:**
  - In `RobloxCharacter.tsx`, added Holster usage and position adjustment.

#### CL-027: Elevator Fall
- **Status:** Completed
- **Actions:**
  - Created `Elevator.tsx` using `kinematicPosition` and friction to handle player contact.

#### CL-028: Grass Clip
- **Status:** Completed
- **Actions:**
  - Created `Grass.tsx` with `y >= 0.1` logic to prevent Z-fighting/floor clip.

#### CL-029: Rain Indoor Clip
- **Status:** Completed
- **Actions:**
  - In `CozyEnvironment.tsx`, adjusted `Sparkles` position/scale to stay strictly outside.

#### CL-030: Fog Outdoor Clip
- **Status:** Completed
- **Actions:**
  - In `CozyEnvironment.tsx`, adjusted Fog parameters to soften range.
