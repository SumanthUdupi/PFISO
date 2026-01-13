# detailed Requirement Documents: Part 4 (AI & NPCs)

**Includes:** MECH-031, MECH-032, MECH-033, MECH-034, MECH-035

---

## [MECH-031] Finite State Machine (FSM) for AI

**Improvement ID:** MECH-031  
**Title:** Finite State Machine (FSM) for AI  
**Priority:** High (P1)  
**Category:** AI  
**Complexity:** Medium  
**Estimated Effort:** 4 Days  

### 1. EXECUTIVE SUMMARY
Implement a reusable Finite State Machine class to manage NPC behaviors. Currently, there is no AI, but future NPCs (Connectors/Recruiters) need defined states like `IDLE`, `PATROL`, `CHASE`, `INTERACT`.

### 2. PROBLEM STATEMENT
Without an FSM, AI logic becomes a spaghetti of `if` statements inside `useFrame`. "If player near AND not talking AND not walking..." is error-prone.

### 3. PROPOSED SOLUTION
- **Structure:**
  - `State` abstract class (`enter()`, `exit()`, `update()`).
  - `AIController` holds `currentState`.
- **States:**
  - `Idle`: Play idle anim, look around.
  - `Patrol`: Move between waypoints.
  - `Interact`: Face player, play talking anim.

---

## [MECH-032] Navigation Mesh (Recast/Detour)

**Improvement ID:** MECH-032  
**Title:** Navigation Mesh  
**Priority:** High (P1)  
**Category:** AI  
**Complexity:** Very High  
**Estimated Effort:** 2 Weeks  

### 1. EXECUTIVE SUMMARY
Integrate a Navigation Mesh generation tool (like `recast-navigation` or `three-pathfinding`) to allow NPCs to navigate the complex office environment without walking through walls or furniture.

### 2. CURRENT STATE ANALYSIS
- **File:** `Player.tsx` imports `findPath` from `../../utils/pathfinding`.
- **Assumption:** This is likely a simple A* grid or direct line check.
- **Problem:** Grids are blocky. Direct lines fail on corners.

### 3. PROPOSED SOLUTION
- **Bake:** Use `recast-navigation` wasm to bake the `Lobby` geometry into a NavMesh.
- **Runtime:** `navMesh.findPath(start, end)` returns a smooth polygon path.

---

## [MECH-033] Steering Behaviors (Boids)

**Improvement ID:** MECH-033  
**Title:** Steering Behaviors  
**Priority:** Medium (P2)  
**Category:** AI  
**Complexity:** Medium  
**Estimated Effort:** 3 Days  

### 1. EXECUTIVE SUMMARY
Implement Steering Behaviors (Seek, Flee, Arrive, Wander, Separation) to make NPC movement look natural and fluid, rather than robotic straight lines.

### 2. PROPOSED SOLUTION
- **Library:** Custom implementation or `yuka` library.
- **Formulas:**
  - $Force = DesiredVelocity - CurrentVelocity$
  - **Separation:** $\sum \frac{Position - NeighborPos}{Distance^2}$
- **Result:** NPCs will naturally avoid crowding the player or each other.

---

## [MECH-034] Vision Cone / Perception System

**Improvement ID:** MECH-034  
**Title:** Vision Cone / Perception System  
**Priority:** Medium (P2)  
**Category:** AI  
**Complexity:** Medium  
**Estimated Effort:** 3 Days  

### 1. EXECUTIVE SUMMARY
Give NPCs "Vision" so they only react to the player if they can "see" them (i.e., not behind a wall or behind their back).

### 2. PROPOSED SOLUTION
- **Checks:**
  1. **Distance:** `dist < ViewRange`
  2. **Angle:** `dot(npcFwd, toPlayer) > cos(FieldOfView / 2)`
  3. **Raycast:** Check line of sight (no walls in between).
- **Visualization:** Debug helper showing the cone.

---

## [MECH-035] Bark / Dialogue Trigger System

**Improvement ID:** MECH-035  
**Title:** Bark / Dialogue Trigger System  
**Priority:** Medium (P2)  
**Category:** AI  
**Complexity:** Low  
**Estimated Effort:** 2 Days  

### 1. EXECUTIVE SUMMARY
Implement a system for "Barks" (floating text bubbles) that trigger when the player does something nearby (e.g., "Nice jump!", "Did you see that project?"). This adds life to the world.

### 2. PROPOSED SOLUTION
- **Component:** `<BarkTrigger event="jump" radius={5} text={["Wow!", "High up!"]} />`
- **UI:** World-space text that fades in/out and billboards to camera.
- **Cooldown:** Prevent spamming same bark.

---
