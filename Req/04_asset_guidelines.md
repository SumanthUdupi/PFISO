# Asset Creation Guidelines

## 1. Directory Structure
Assets MUST be organized by type, then domain:
```text
/public
  /assets
    /models
      /characters
      /environment
    /textures
      /ui
      /materials
    /audio
      /sfx
      /music
```

## 2. File Naming Conventions
-   **General:** `snake_case` is mandatory for all asset files.
    -   ✅ `player_idle.glb`, `button_hover.mp3`
    -   ❌ `PlayerIdle.glb`, `ButtonHover.mp3`
-   **Suffixes:** Use suffixes for map types.
    -   `_c`: Color/Albedo
    -   `_n`: Normal
    -   `_orm`: Occlusion/Roughness/Metalness packed
    -   `_e`: Emissive

## 3. 3D Model Specifications
-   **Pivot Points:**
    -   **Characters:** At their feet (between soles).
    -   **Props (Floor standing):** Bottom center.
    -   **Props (Wall mounted):** Center of back face.
-   **Scale:** 1 unit = 1 meter. Character height ~1.7 - 1.8 units.
-   **UVs:** No overlapping UVs for baked lighting maps. Texel density ~512px/meter.

## 4. Textures & 2D Art
-   **Format:**
    -   **Photos/Complex:** WebP (lossy, q=80).
    -   **Icons/Sharps:** SVG or PNG-8 (quantized).
-   **Power of Two:** Textures for 3D usage MUST be Power-of-Two (POT) dimensions (512, 1024, 2048).
-   **Sprites:** Pack multiple small icons into a single Texture Atlas (Sprite Sheet) to reduce draw calls.

## 5. Optimization Criteria
-   **Draco Compression:** All GLB files > 500KB MUST be compressed with Draco.
-   **LODs (Level of Detail):** If an object has >5k tris, provide a LOD1 version with <1k tris for distance rendering.
-   **Re-use:** Reuse the same material instance across multiple objects (Batching) wherever possible.
