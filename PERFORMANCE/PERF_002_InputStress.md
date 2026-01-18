# Performance Report: PERF_002

**Category**: Control Lag / Frame Drop
**Severity**: Medium
**Affected System**: Input / Camera / Rendering

## Performance Metrics
- **Average FPS**: 49.5
- **Frame Time Spikes**: High spikes observed (62.6ms, 55.4ms, 62.5ms).
- **input Latency**: Proxied by frame time spikes; 60ms+ frames indicate perceptible stutter during input.

## Observations
While the average FPS increased slightly during activity (likely due to dynamic clocking or browser priority), there were significant frame time spikes (>60ms) corresponding to input actions (WASD/Mouse).
These spikes cause "micro-stutter" which affects the feel of the controls, making them less responsive than the average FPS suggests.

## Root Cause Analysis
- **Likely Cause**: Event listener overhead or layout thrashing during camera updates.
- **InputManager**: `window.addEventListener` handles inputs directly.
- **Camera**: `useFrame` in `CameraController` performs vector math and `lerp`.
- **Spikes**: 60ms spikes often correlate with React state updates or heavy garbage collection.

## Optimization Solution
1. **Input Buffering**: Ensure `InputManager` doesn't trigger heavy logic on every event, but queues state for `update()`. (Already does this).
2. **Object Allocation**: Review `CameraController` for object creation in `useFrame` (e.g., `new THREE.Vector3` calls).
    - *Found*: `const lookAheadOffset = new THREE.Vector3(...)` and `const offset = BASE_OFFSET.clone()` inside the loop.
    - *Fix*: Reuse vector objects to reduce GC pressure.

## Expected Performance Gain
- Reduced frame time spikes.
- More consistent input response.
