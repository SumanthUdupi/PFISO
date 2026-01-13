# detailed Requirement Documents: Part 3 (Architecture & Systems)

**Includes:** MECH-041, MECH-042, MECH-043, MECH-044, MECH-045

---

## [MECH-041] Game Loop Separation

**Improvement ID:** MECH-041  
**Title:** Game Loop Separation  
**Priority:** Critical (P0)  
**Category:** Architecture  
**Complexity:** Very High  
**Estimated Effort:** 2 Weeks  

### 1. EXECUTIVE SUMMARY
Decouple the core game logic (Physics, AI, State updates) from the React Component render cycle. Currently, logic is scattered across `useEffect` and `useFrame` hooks inside components like `Player.tsx` and `Lobby.tsx`. This causes logic to re-run or break when components re-render for UI changes.

### 2. CURRENT STATE ANALYSIS
- **Location:** Logic is inside `Lobby` component body and `Player` component body.
- **Problem:** If `Lobby` re-renders (e.g., UI state changes), all local variables not in `ref` or `store` are reset (or refs persist but hooks re-run).
- **Goal:** React should only be the *View* layer. The *Model/Controller* should exist independently.

### 3. PROPOSED SOLUTION
- **GameSystem Class:** Create a vanilla TS class `GameEngine`.
- **Zustand Bridge:** `useGameStore` exposes the engine state.
- **Loop:** `useFrame` calls `GameEngine.update(dt)`.
- **Benefit:** Testable logic without booting React.

---

## [MECH-042] Entity Component System (ECS) (Lite)

**Improvement ID:** MECH-042  
**Title:** Entity Component System (ECS) (Lite)  
**Priority:** High (P1)  
**Category:** Architecture  
**Complexity:** High  
**Estimated Effort:** 1.5 Weeks  

### 1. EXECUTIVE SUMMARY
Adopt a "Composition over Inheritance" pattern. Instead of `RobloxCharacter.tsx` containing movement logic, create Entities with components: `Position`, `Velocity`, `Renderable`, `InputListener`.

### 2. CURRENT STATE ANALYSIS
- **Current:** "Smart Objects". `Player.tsx` has mesh, physics, input, and audio all in one file.
- **Problem:** Adding a "Moveable Crate" requires duplicating physics code from `Player.tsx`.

### 3. PROPOSED SOLUTION
- **Library:** `@react-three/ecs` or `miniplex`.
- **Components:**
  - `PhysicsBody`: rigidbody handle.
  - `Interactive`: label, action.
  - `AI`: state machine.
- **Systems:** `MovementSystem`, `InteractionSystem`, `AISystem` iterate over entities with specific components.

---

## [MECH-043] Global Event Bus

**Improvement ID:** MECH-043  
**Title:** Global Event Bus  
**Priority:** High (P1)  
**Category:** Architecture  
**Complexity:** Low  
**Estimated Effort:** 2 Days  

### 1. EXECUTIVE SUMMARY
Implement a typed Event Bus to handle game-wide events (e.g., `PLAYER_DIED`, `QUEST_COMPLETED`, `MOTE_COLLECTED`) without prop-drilling callbacks through the React tree.

### 2. CURRENT STATE ANALYSIS
- **Current:** Prop drilling `onComplete`, `onInteract`. Direct import of stores.
- **Problem:** `Lobby.tsx` handles everything. Hard to trigger a "Confetti" effect from a deeply nested `Chest` component without passing props up 5 levels.

### 3. PROPOSED SOLUTION
- **Library:** `mitt` or native `EventTarget`.
- **Events:**
  ```typescript
  type Events = {
    'player:jump': void;
    'interaction:start': { targetId: string };
    'system:notification': { message: string };
  }
  ```
- **Usage:** `gameEvents.emit('player:jump')`. Components subscribe via `useEvent('player:jump', playSound)`.

---

## [MECH-044] Input Manager Abstraction

**Improvement ID:** MECH-044  
**Title:** Input Manager Abstraction  
**Priority:** High (P1)  
**Category:** Architecture  
**Complexity:** Medium  
**Estimated Effort:** 3 Days  

### 1. EXECUTIVE SUMMARY
Abstract raw inputs (Key 'W', Button 0) into semantic Actions ("MoveForward", "Jump"). This allows easy remapping and multi-device support (Gamepad + Keyboard simultaneously).

### 2. CURRENT STATE ANALYSIS
- **File:** `Player.tsx` checks `keys.current['w']`.
- **Problem:** Hardcoded keys. Adding Arrow Keys required `||` logic. Adding Gamepad required separate `joystick` check.

### 3. PROPOSED SOLUTION
- **Input Map:** `Map<Action, Input[]>`.
- **Hook:** `useInput()` returns `{ moveVector: Vector2, jump: boolean, interact: boolean }`.
- **Logic:** The hook sums up all inputs mapped to an action.

---

## [MECH-045] Audio Priority System

**Improvement ID:** MECH-045  
**Title:** Audio Priority System  
**Priority:** Medium (P2)  
**Category:** Systems  
**Complexity:** Medium  
**Estimated Effort:** 3 Days  

### 1. EXECUTIVE SUMMARY
Implement a smart audio manager that culls sounds based on distance and priority (Importance). Prevent "sound spam" (e.g., 50 coins spawning at once) from blowing out the speakers or performance.

### 2. CURRENT STATE ANALYSIS
- **Current:** `useAudioStore` plays sounds directly.
- **Problem:** No limit on concurrency.

### 3. PROPOSED SOLUTION
- **Channels:** `BGM`, `SFX`, `UI`, `VOICE`.
- **Logic:**
  - `poolSize`: Max 10 simultaneous SFX.
  - `play(sound, priority)`: If pool full, stop lowest priority sound to play new one (or ignore new one if lower priority).
  - **Distance:** Auto-cull sounds > 20m away.

---
