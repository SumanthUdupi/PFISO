# Art Asset Requirement: ARTREQ_041

## 1. Asset Title
**Soft Interior Shadow Profile**

## 2. Asset Type
Lighting / Settings

## 3. Detailed Description
Configuration for shadow maps to ensure they are soft and diffused, matching the "cloudy/soft sun" vibe, avoiding harsh digital aliasing.

## 4. Style Guidelines
- **Resolution:** High (2048+)
- **Softness:** PCSS or high blur radius.

## 5. Technical Specifications
- **Type:** Cascaded Shadow Maps.
- **Bias:** Tuned to prevent peter-panning on desk objects.
- **Normal Bias:** 0.1.

## 6. Lighting & Color Theme
- **Color:** Shadows should not be black, but a deep warm brown (#4a403a) or cool blue (#2d2424) depending on time of day.

## 7. Visual References
- Blender Cycles renders.

## 8. Integration Notes
- Global directional light settings.

## 9. Portfolio Impact
Technical understanding of real-time shadow artifacts and mitigation.
