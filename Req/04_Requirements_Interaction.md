# detailed Requirement Documents: Part 2 (Interaction & Camera)

**Includes:** MECH-011, MECH-012, MECH-013, MECH-014, MECH-015

---

## [MECH-011] Precision Raycast Interaction

**Improvement ID:** MECH-011  
**Title:** Precision Raycast Interaction  
**Priority:** High (P1)  
**Category:** Interaction  
**Complexity:** Medium  
**Estimated Effort:** 3 Days  

### 1. EXECUTIVE SUMMARY
Replace the current broad proximity check (calculating distance to hardcoded Vector3s) with a precision Raycast system. This allows players to interact with specific objects (drawers, papers on a desk) rather than just "general areas" like "Desk Zone".

### 2. CURRENT STATE ANALYSIS
- **File:** `Lobby.tsx`
- **Logic:** `useFrame` calculates `distanceTo(projectPos)`. If `< 2.5`, it considers it focused.
- **Problem:**
  - Can trigger "About Me" when standing behind a wall near the zone.
  - Cannot distinguish between multiple small items on a table.
  - Inefficient (checking ALL distances every frame).

### 3. PROPOSED SOLUTION
#### 4.1 Functional Requirements
- Cast a ray from Camera center (or Mouse cursor) to the world.
- If ray hits an object with tag `Interactive`:
  - Show prompt "E to Interact".
- **Interaction Range:** 3.0 meters.

#### 4.2 Technical Specifications
- **Three.js Raycaster:** Use `useThree().raycaster`.
- **Layer:** Create a specific layer/group for `InteractiveObjects` to avoid querying walls/floors.
- **Code:**
  ```typescript
  const [hovered, setHover] = useState(null)
  useFrame(({ raycaster, camera }) => {
     const hits = raycaster.intersectObjects(interactiveGroup.current.children);
     if (hits.length > 0 && hits[0].distance < 3.0) {
        setHover(hits[0].object);
     }
  })
  ```

---

## [MECH-012] Interaction Queue System

**Improvement ID:** MECH-012  
**Title:** Interaction Queue System  
**Priority:** High (P1)  
**Category:** Interaction  
**Complexity:** High  
**Estimated Effort:** 4 Days  

### 1. EXECUTIVE SUMMARY
Formalize the "Click-to-Move-Then-Interact" pattern into a reusable Command Queue. Currently, this logic is hardcoded inside `Lobby.tsx` (`handleInteraction` callback). A queue system allows generalized behavior like "Walk to Chest -> Open Chest -> Loot Item".

### 2. CURRENT STATE ANALYSIS
- **File:** `Lobby.tsx` (lines 88-127)
- **Logic:** Manual check: `if (dist > 3) { moveTo(target, callback) }`.
- **Problem:** Nested callbacks are messy. Hard to cancel (clicking elsewhere doesn't cleanly clear the pending interaction callback).

### 3. PROPOSED SOLUTION
- **Command Pattern:**
  - `PlayerController` has a `currentCommand` (e.g., `MoveCommand`, `InteractCommand`).
  - **Queue:** `commandQueue = [MoveTo(x,y), Interact(obj)]`.
- **Cancellation:** Any new input clears the queue immediately.
- **Visual Feedback:** Show a "waypoint" marker that persists until interaction is complete.

---

## [MECH-013] Context-Sensitive Cursor

**Improvement ID:** MECH-013  
**Title:** Context-Sensitive Cursor  
**Priority:** Medium (P2)  
**Category:** UI/UX  
**Complexity:** Low  
**Estimated Effort:** 2 Days  

### 1. EXECUTIVE SUMMARY
Enhance user feedback by dynamically changing the cursor icon based on what is being hovered (Walkable Floor, Interactive Object, NPC, Enemy). This removes ambiguity about "What happens if I click here?".

### 2. CURRENT STATE ANALYSIS
- **Current:** Default System Cursor.
- **Feedback:** None until click (Walk marker appears).

### 3. PROPOSED SOLUTION
- **Icons:**
  - `CursorArrow`: Default.
  - `CursorWalk`: Footprints (Hovering Floor).
  - `CursorHand`: Hand (Hovering Interactable).
  - `CursorTalk`: Speech Bubble (Hovering NPC).
- **Implementation:** Global Zustand store `useCursorStore`. Objects call `setCursor('hand')` on `onPointerEnter` and `setCursor('default')` on `onPointerLeave`.

---

## [MECH-014] Object Highlight / Outline Shader

**Improvement ID:** MECH-014  
**Title:** Object Highlight / Outline Shader  
**Priority:** Medium (P2)  
**Category:** Visuals  
**Complexity:** Medium  
**Estimated Effort:** 3 Days  

### 1. EXECUTIVE SUMMARY
Implement a post-processing Outline effect or a Rim Light shader that activates when an interactive object is hovered or closest to the player. This is a standard "Accessibility" and "Game Feel" feature.

### 2. CURRENT STATE ANALYSIS
- **Current:** `InteractiveObject` creates a `ClickMarker` or just scales up slightly (implied). `Lobby.tsx` uses `pulseRef` for point lights.
- **Problem:** Hard to see exact bounds of interaction. Point lights are expensive.

### 3. PROPOSED SOLUTION
- **Technique:** `@react-three/postprocessing` -> `Outline` or `Selection`.
- **Logic:**
  - Add `<Selection>` wrapper around scene.
  - Wrap interactive objects in `<Select enabled={hovered}>`.
  - Config: White outline, thickness 2px, pulse speed 0.

---

## [MECH-015] Soft-Lock Targeting System

**Improvement ID:** MECH-015  
**Title:** Soft-Lock Targeting System  
**Priority:** Medium (P2)  
**Category:** Combat / Interaction  
**Complexity:** Medium  
**Estimated Effort:** 4 Days  

### 1. EXECUTIVE SUMMARY
When using a Gamepad or Keyboard (non-mouse), the player needs a way to "aim" interactions. Soft-Lock automatically rotates the player's upper body (or camera focus) towards the nearest interesting object in the forward cone.

### 2. CURRENT STATE ANALYSIS
- **Current:** `closestObject` logic in `Lobby.tsx` checks simple radial distance.
- **Problem:** Player can be facing *away* from the object but still trigger it because they are "close". This feels physically wrong.

### 3. PROPOSED SOLUTION
- **Dot Product Check:**
  - `toObject = ObjectPos - PlayerPos`
  - `forward = PlayerForwardVector`
  - `angle = dot(toObject.normalize(), forward)`
  - ONLY consider objects where `angle > 0.5` (within ~60 degrees front cone).
- **Visuals:** Head Inverse Kinematics (IK) to look at the target.

---
