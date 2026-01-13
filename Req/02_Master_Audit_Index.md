# Comprehensive Game Mechanics & Physics Audit: Master Index

**Document ID:** AUDIT-2025-001
**Date:** 2026-01-13
**Auditor:** Antigravity (Senior Game Mechanics Engineer)

---

## 1. Executive Summary
The following audit identifies 50 critical improvements required to elevate the current "Portfolio Game" from a basic interactive experience to a robust, polished, and scalable game framework. The primary findings highlight a lack of rigid body physics, basic collision detection, and tight coupling between visualization and game logic.

## 2. Prioritization Matrix
- **Priority P0 (Critical):** Fundamental architectural or mechanical flaws that prevent scalability or gameplay.
- **Priority P1 (High):** Major features needed for a "Standard" game feel.
- **Priority P2 (Medium):** Polish, juice, and "Good to Have" mechanics.
- **Priority P3 (Low):** Niche or expensive additions.

---

## 3. Master Index of Improvements

### I. Core Mechanics & Locomotion (10 Items)
| ID | Priority | Title | Description |
|----|----------|-------|-------------|
| **MECH-001** | **P0** | **Canonical Physics Engine Integration** | Replace custom `useFrame` physics with a robust engine (Rapier/Cannon) for stable collisions. |
| **MECH-002** | **P0** | **Capsule Collider Implementation** | Implement proper player collision volume instead of point-based checks to prevent clipping. |
| **MECH-003** | **P0** | **Fixed Timestep Physics Loop** | Decouple physics calculation from render frame rate to ensure consistent simulation on all devices. |
| **MECH-004** | **P1** | **Slope and Stair Handling** | Add logic to handle non-flat terrain without "flying" or sliding (Project Velocity on Plane). |
| **MECH-005** | **P1** | **Input Buffering System** | Implement a queue for inputs (Jump, Interact) to improve responsiveness and preventing dropped inputs. |
| **MECH-006** | **P1** | **Variable Jump Height** | Refine jump logic to support short hops vs full jumps based on button hold duration (Gravity scaling). |
| **MECH-007** | **P2** | **Coyote Time & Jump Buffering** | (Optimization) Formalize and tune existing ad-hoc implementation for tighter platforming feel. |
| **MECH-008** | **P2** | **Dash / Dodge Mechanic** | Add a burst-movement mechanic with invulnerability frames or collision masking. |
| **MECH-009** | **P2** | **Momentum Conservation** | Allow carried momentum from external forces (platforms, explosions) instead of instant friction. |
| **MECH-010** | **P3** | **Wall Slide & Wall Jump** | Add verticality mechanics for more complex level traversal. |

### II. Interaction & Tooling (10 Items)
| ID | Priority | Title | Description |
|----|----------|-------|-------------|
| **MECH-011** | **P1** | **Precision Raycast Interaction** | Replace distance-based checks with precise raycasting against interactive layer geometry. |
| **MECH-012** | **P1** | **Interaction Queue System** | Enable "Click-to-Move-Then-Interact" logic seamlessly (currently ad-hoc in Lobby.tsx). |
| **MECH-013** | **P2** | **Context-Sensitive Cursor** | Change cursor state dynamically based on hover target (Move, Interact, Attack, Talk). |
| **MECH-014** | **P2** | **Object Highlight / Outline Shader** | Add visual feedback (Rim Light/Outline) when hovering over interactive elements. |
| **MECH-015** | **P2** | **Soft-Lock Targeting System** | Automatically orient player towards nearest interactive target when performing actions. |
| **MECH-016** | **P2** | **Usable Object State Machine** | Define states (Open, Closed, Locked, Broken) for props like Doors and Chests. |
| **MECH-017** | **P3** | **Physics-Based Object Manipulation** | Allow grabbing, carrying, and throwing of small physics objects (RigidBodies). |
| **MECH-018** | **P3** | **Destructible Environment Props** | Implement fracture or simple break states for decorative objects (vases, crates). |
| **MECH-019** | **P3** | **Item Pickup Magnetism** | Add specialized physics force to pull nearby collectibles (Motes) toward player. |
| **MECH-020** | **P3** | **Grid-Based Placement System** | (If building enabled) Snap-to-grid logic for placing objects in world. |

### III. Camera & Game Feel (10 Items)
| ID | Priority | Title | Description |
|----|----------|-------|-------------|
| **MECH-021** | **P1** | **Spring-Arm Camera Controller** | Implement collision-aware camera that zooms in when obstructed by walls. |
| **MECH-022** | **P1** | **Look-Ahead Camera Damping** | Shift camera target slightly in direction of movement for better visibility. |
| **MECH-023** | **P2** | **Trauma-Based Screen Shake** | Implement "Trauma" system (0-1) for procedural, layered screen shake effects. |
| **MECH-024** | **P2** | **Dynamic FOV adjustment** | Widen FOV slightly during sprinting or falling to accentuate speed. |
| **MECH-025** | **P2** | **Animation Event System** | Trigger sounds/particles exactly on key animation frames (footsteps) rather than timers. |
| **MECH-026** | **P2** | **Hit Stop / Frame Freeze** | Add micro-pauses (50-100ms) on significant impacts/interactions for impact. |
| **MECH-027** | **P2** | **Procedural Recoil/Sway** | Add procedural noise to camera rotation based on movement state. |
| **MECH-028** | **P3** | **Chromatic Aberration Pulse** | Add lens distortion effects on damage or major events. |
| **MECH-029** | **P3** | **Focus/Depth of Field System** | Dynamic focus distance based on raycast to center of screen. |
| **MECH-030** | **P3** | **Motion Blur (Per Object)** | Implement velocity-buffer based motion blur for fast moving character parts. |

### IV. AI & NPCs (10 Items)
| ID | Priority | Title | Description |
|----|----------|-------|-------------|
| **MECH-031** | **P1** | **Finite State Machine (FSM) for AI** | Standardize generic AI behavior (Idle, Patrol, Chase, Flee). |
| **MECH-032** | **P1** | **Navigation Mesh (Recast)** | Implement proper NavMesh generation for AI pathfinding (replace waypoints). |
| **MECH-033** | **P2** | **Steering Behaviors (Boids)** | Add Separation, Alignment, Cohesion for grouping AI avoiding collisions. |
| **MECH-034** | **P2** | **Vision Cone / Perception System** | Implement check for "Line of Sight" and field of view for triggers. |
| **MECH-035** | **P2** | **Bark/Dialogue Trigger System** | Proximity-based floating text bubbles (Barks) for ambient NPCs. |
| **MECH-036** | **P3** | **Crowd Simulation System** | Optimization for handling many simple background NPCs. |
| **MECH-037** | **P3** | **Head Tracking (Inverse Kinematics)** | AI looks at player when nearby (Head/Neck IK). |
| **MECH-038** | **P3** | **Patrol Path Editor** | System to define spline-based patrol routes in editor/data. |
| **MECH-039** | **P3** | **Combat Slot System** | (If combat) Limit number of enemies attacking player simultaneously. |
| **MECH-040** | **P3** | **Ragdoll Physics on Death** | Switch to physical ragdoll simulation upon incapacitation. |

### V. Architecture & Systems (10 Items)
| ID | Priority | Title | Description |
|----|----------|-------|-------------|
| **MECH-041** | **P0** | **Game Loop Separation** | Move core logic out of React Components into a dedicated Game System class. |
| **MECH-042** | **P1** | **Entity Component System (Simple)** | Adopt Composition over Inheritance for game entities (Health, Mover, Renderable). |
| **MECH-043** | **P1** | **Global Event Bus** | Decouple systems using a typed event emitter (e.g., 'PlayerJump' -> Audio/Particles). |
| **MECH-044** | **P1** | **Input Manager Abstraction** | Abstract raw keys/buttons into "Actions" (Jump, Fire, Interact). |
| **MECH-045** | **P2** | **Audio Priority System** | Manage voice stealing and audio culling based on distance/priority. |
| **MECH-046** | **P2** | **Save/Load State Serialization** | robust JSON serialization of all game state entities. |
| **MECH-047** | **P2** | **LOD (Level of Detail) System** | Swap meshes based on distance to improve performance. |
| **MECH-048** | **P2** | **Asset Preloading/Pooling** | Object Pool implementation for particles/projectiles to reduce GC. |
| **MECH-049** | **P3** | **Debug Console / Command Line** | In-game quake-style console for commands (noclip, godmode). |
| **MECH-050** | **P3** | **Telemetry & Heatmapping** | Track player position/deaths to visualize bottleneck areas. |
