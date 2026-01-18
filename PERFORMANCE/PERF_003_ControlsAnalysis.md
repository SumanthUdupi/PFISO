# Performance Report: PERF_003

**Category**: Optimization Opportunity
**Severity**: Low
**Affected System**: Controls / InputManager

## Analysis
The `InputManager.ts` and `CameraController.tsx` were reviewed.

### InputManager `src/systems/InputManager.ts`
- **Good**: Uses a polling `update()` method rather than reacting to every event for game logic.
- **Good**: Uses bit flags or booleans for key states.
- **Optimization**: `bindEvents` adds listeners to `window`. Clean up is handled? It's a singleton, so cleanup isn't critical unless hot-reloaded often.
- **Optimization**: `getGamepads()` is called every frame. This is standard but can be slow in some browsers.

### CameraController `src/components/game/CameraController.tsx`
- **Issue**: **Garbage Collection Churn**.
  - Inside `useFrame`:
    - `playerPos` is cloned `targetRef.current.position.clone()`.
    - `distMoved` creates new Vector.
    - `lookAheadOffset` creates new Vector.
    - `offset` clones `BASE_OFFSET`.
    - `finalPos` clones `idealPos`.
    - `shakeOffset` creates new Vector.
  - **Impact**: Creating ~10-15 objects per frame. At 60FPS, that's 900 objects/sec. This contributes to the GC spikes seen in PERF_002.

## Recommendations
Refactor `CameraController.tsx` to use persistent `useRef` vectors and `copy`/`set` methods instead of `clone`/`new`.

## Code Changes Required
- **File**: `src/components/game/CameraController.tsx`
- **Technique**: Object Pooling / Reuse variables.
