# LEGO-Style Player Sprite - Artistic Requirements Document

## Executive Summary

**Visual Direction:**
The player character is a stylized, 2D billboard sprite designed to inhabit a 3D isometric voxel/pixel-art world ("Paper Mario" aesthetic). The character draws heavy inspiration from classic LEGO minifigures but is rendered with a pixel-art technique that emphasizes readability, charm, and the "toy-like" quality of the world.

**Design Philosophy:**
- **Toy-Like but Heroic:** The character should feel like a physical toy come to life—rigid yet expressive.
- **Readability First:** Visuals must be clear at the game's standard zoom level (isometric).
- **Retro-Modern:** Pixel art style (no anti-aliasing) combined with modern lighting integration (billboard sprites in a 3D world).

**Implementation Roadmap:**
1.  **Foundation:** Establish the base 32x48px template and proportions.
2.  **Design:** Finalize the "Classic Space" influenced palette and face.
3.  **Animation:** Create the 8-frame walk cycle and key movement states.
4.  **Polish:** Add normal maps and material properties for dynamic lighting.

---

## Requirements Categories

### 1. Character Foundation (REQ-001 to REQ-010)

| ID | Requirement Title | Priority | Specification & Visual Description | Rationale | Implementation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-001** | **Base Grid Dimensions** | **Critical** | **Spec:** Sprite canvas size must be **32px wide x 48px high**. <br><br> **Visual:** Fits within a 2x3 unit rectangle on the 16px grid. | Ensures the character scales correctly with the world's 16x16 tile system. | **Tool:** Aseprite <br> **Canvas:** 32x48px |
| **REQ-002** | **Minifigure Proportions** | **Critical** | **Spec:** Head: ~12px height (approx 1:3 ratio). Torso: ~14px height. Legs: ~12px height. <br> **Visual:** Top-heavy, "chibi" style ratios. | Mimics the iconic, appealing ratios of a minifigure without infringing on exact trademarks. | **Ref:** Standard minifig diagram. |
| **REQ-003** | **Head Shape Definition** | **High** | **Spec:** Cylindrical shape implied by shading. Top stud: 2px height, 6px width. <br> **Visual:** Rounded rectangle with a distinct "nub" on top. | The "stud" on the head is the primary identifier of the toy aesthetic. | **Pixel Art:** Use shading to imply curvature. |
| **REQ-004** | **Trapezoidal Torso** | **High** | **Spec:** Top width: 14px. Bottom width: 18px. <br> **Visual:** Subtle taper from hips to shoulders. | Creates the classic strong silhouette associated with blocky heroes. | **Draw:** Symm. tool in Aseprite. |
| **REQ-005** | **Pixel Density Consistency** | **Critical** | **Spec:** 1 screen pixel = 1 texture pixel (Texel Density 1:1). No sub-pixel rotation. | Maintains the crisp, retro illusion of the entire game world. | **Engine:** Set texture filter to `Nearest`. |
| **REQ-006** | **Leg Separation** | **Medium** | **Spec:** Legs must appear distinct. 1px dark line or gap between legs in idle pose. | Critical for readability during movement/walk cycles. | **Art:** Darker inner leg shade. |
| **REQ-007** | **Hand/Claw Shape** | **High** | **Spec:** "C" shape hands. 6x6px roughly. Opening faces forward/inward. | Iconic "grasping" hand shape allows for holding items later. | **Visual:** Yellow "C" shape. |
| **REQ-008** | **Shoulder Articulation Point** | **Medium** | **Spec:** Arms connect slightly below the top of the torso (approx 2px down). | Mimics the physical rotation point of a real toy. | **Anim:** Pivot point definition. |
| **REQ-009** | **Hip Connection** | **Low** | **Spec:** Visible "T-piece" or waist section separating torso and legs (2px height). | Adds mechanical realism to the toy aesthetic. | **Color:** Darker shade of torso color. |
| **REQ-010** | **Silhouette Readability** | **Critical** | **Spec:** Character must be instantly recognizable as "humanoid block figure" in pure black silhouette. | Good character design relies on a strong silhouette. | **Test:** Fill layer with black. |

### 2. Visual Design & Aesthetics (REQ-011 to REQ-020)

| ID | Requirement Title | Priority | Specification & Visual Description | Rationale | Implementation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-011** | **Primary Skin Tone** | **High** | **Spec:** LEGO Yellow (Bright Yellow). <br> **Hex:** `#FNC12E` (Approx) or `#FCC200`. | The classic, neutral "everyman" hero color. | **Palette:** Index 1. |
| **REQ-012** | **Torso Color (Main)** | **High** | **Spec:** Bright Red (Classic Space/City feel). <br> **Hex:** `#FE1923`. | High contrast against the typical office/dungeon background colors. | **Palette:** Index 2. |
| **REQ-013** | **Leg Color (Main)** | **High** | **Spec:** Bright Blue. <br> **Hex:** `#0055BF`. | Creates a primary color triad (Yellow/Red/Blue) that screams "toy". | **Palette:** Index 3. |
| **REQ-014** | **Plastic Material Highlight** | **Critical** | **Spec:** High-contrast, sharp specular highlights on the upper left of curved surfaces (head, shoulder). | Conveys the shiny, hard plastic material. | **Art:** 1-2px pure white highlights. |
| **REQ-015** | **Face: Classic Smile** | **High** | **Spec:** Two vertical dots for eyes (black). Simple curved line for smile. <br> **Visual:** `:)` style. | Neutral, friendly, positive appeal. | **Brush:** 1px brush for eyes. |
| **REQ-016** | **Outline Style** | **High** | **Spec:** 1px colored outline (darker shade of fill color), NOT pure black. | "Selout" (Selective Outline) softens the sprite and blends better with 3D. | **Tech:** Sprite outline stroke. |
| **REQ-017** | **Torso Decal/Logo** | **Medium** | **Spec:** Simple white geometric logo (e.g., a pixelated planet or gear) on chest. | Breaks up the red mass and adds "hero" detail. | **Ref:** Classic Space logo. |
| **REQ-018** | **Matte Finish for Cloth** | **Low** | **Spec:** If character has a cape or cloth, use #000000 dither pattern for texture. | Distinguishes soft materials from hard plastic. | **Art:** Checkerboard dither. |
| **REQ-019** | **Ambient Occlusion (Baked)** | **Medium** | **Spec:** Darker pixels under the chin and arms (baked into sprite). | Adds volume without relying solely on the 3D engine. | **Art:** 20% opacity black overlay. |
| **REQ-020** | **Color Palette Limit** | **Medium** | **Spec:** Maximum 16 colors for the character sprite. | enforcing retro/GBA era aesthetic and consistency. | **Tool:** Aseprite Palette limit. |

### 3. Animation & Movement (REQ-021 to REQ-030)

| ID | Requirement Title | Priority | Specification & Visual Description | Rationale | Implementation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-021** | **Isometric Walk Cycle Directions** | **Critical** | **Spec:** 4 Directions: SW, SE, NW, NE (to match isometric camera). | Standard movement for isometric games. | **Sheet:** Rows 1-4. |
| **REQ-022** | **Walk Cycle Frames** | **High** | **Spec:** 8 Frames per direction. | Snooth enough effectively, but jerky enough to feel like a toy. | **Timing:** 100ms per frame. |
| **REQ-023** | **"Rigid" Walk Style** | **High** | **Spec:** Legs move straight back and forth (pendulum). No knee bending. | Minifigures don't have knees! This is key to authenticity. | **Anim:** Rotate leg from hip only. |
| **REQ-024** | **Arm Swing Sync** | **Medium** | **Spec:** Opposite arm swings with leg (Left Leg fwd = Right Arm fwd). Amplitude: ~45 degrees. | Natural counterbalance, exaggerated for readability. | **Anim:** Parenting in Aseprite. |
| **REQ-025** | **Idle Animation** | **High** | **Spec:** "Breathing" - Scale torso/head up 1px every 60 frames. | Keeps the screen alive even when user is inactive. | **Anim:** Sub-pixel shift. |
| **REQ-026** | **Jump - Rise Pose** | **Medium** | **Spec:** Arms up (cheer pose), legs straight down. | Distinct silhouette for "airborne" state. | **Frame:** Single keyframe. |
| **REQ-027** | **Jump - Fall Pose** | **Medium** | **Spec:** Legs slightly splayed or flailing arms. | Visual feedback for gravity/falling. | **Frame:** Single keyframe. |
| **REQ-028** | **Head Bob** | **Low** | **Spec:** Head moves down 1px on the "contact" frame of the walk cycle. | Adds weight to the movement. | **Anim:** Shift head layer. |
| **REQ-029** | **Blink Animation** | **Low** | **Spec:** Eyes close for 1 frame (approx 0.1s) randomly every 2-5s. | Adds life and personality. | **Code:** Random timer overlay. |
| **REQ-030** | **Run Cycle Transition** | **Medium** | **Spec:** Double speed of walk cycle frames + lean torso forward 2px. | Cheap way to create running without new assets. | **Code:** Playback speed 2x. |

### 4. Technical Implementation (REQ-031 to REQ-040)

| ID | Requirement Title | Priority | Specification & Visual Description | Rationale | Implementation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-031** | **Sprite Sheet Layout** | **High** | **Spec:** Grid layout. Columns = Frames (0-7). Rows = Direction (0=S, 1=SW, 2=W, etc. mapped to Iso). | Standardizes import into Unity/Godot/Web engines. | **Tool:** Packer script. |
| **REQ-032** | **File Format** | **Critical** | **Spec:** PNG-24 with Alpha Transparency. | Universally supported, lossless transparency. | **Export:** PNG. |
| **REQ-033** | **Anchor Point** | **Critical** | **Spec:** Bottom Center (between feet). Pixel coordinate (16, 48). | Essential for correct sorting in isometric depth (z-sorting). | **Engine:** Set Pivot. |
| **REQ-034** | **Texture Filtering** | **Critical** | **Spec:** Nearest Neighbor (Point) filtering. | Prevents blurriness when camera zooms. | **Three.js:** `texture.magFilter = THREE.NearestFilter` |
| **REQ-035** | **Naming Convention** | **Medium** | **Spec:** `char_lego_[action]_[direction].png` or `char_lego_sheet.png`. | Easy searching and scripting. | **File:** Rename. |
| **REQ-036** | **Padding/Bleed** | **Low** | **Spec:** 1px clear border around each frame in sheet. | Prevents "texture bleeding" from adjacent frames. | **Packer:** Padding = 1. |
| **REQ-037** | **Background Color** | **High** | **Spec:** Transparent background! No matte color. | Essential for compositing. | **Art:** Check layers. |
| **REQ-038** | **Normal Mapping** | **Low** | **Spec:** Optional secondary sprite sheet for normals (R=X, G=Y, B=Z). | Allows the flat sprite to react to 3D point lights. | **Tool:** SpriteIlluminator. |
| **REQ-039** | **Emission Map** | **Low** | **Spec:** Mask for "shiny" or glowing parts (e.g. logo). | Adds sci-fi/tech feel suitable for portfolio. | **Art:** B&W mask. |
| **REQ-040** | **Compression** | **Medium** | **Spec:** Use `tinypng` or similar. Target size < 50KB for sheet. | Web optimization. | **Tool:** TinyPNG. |

### 5. Polish & Game Integration (REQ-041 to REQ-050)

| ID | Requirement Title | Priority | Specification & Visual Description | Rationale | Implementation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-041** | **Drop Shadow** | **High** | **Spec:** Do NOT bake shadow into sprite. Use engine shadow or separate "blob" shadow sprite. | Baked shadows look wrong when character jumps or stands on edges. | **Engine:** Blob shadow. |
| **REQ-042** | **Billboard Behavior** | **Critical** | **Spec:** Y-Axis Billboard (always faces camera around vertical axis) OR Fixed Isometric (4 views). | For this "Paper Mario" style, usually Y-Axis billboard is preferred if 2D-in-3D. | **Code:** `lookAt(camera)`. |
| **REQ-043** | **Interact Icon Placement** | **High** | **Spec:** Floating icon (e.g., "?") should spawn at `y + 50px` (2px above head). | Prevents UI overlapping the character's face. | **Code:** Anchor relative. |
| **REQ-044** | **Step Particles** | **Medium** | **Spec:** Spawn small pixel "dust" particles at feet frame 0 and 4. | Grounds the character in the world. | **VFX:** Particle system. |
| **REQ-045** | **Colorblind Accessibility** | **Medium** | **Spec:** Ensure sufficient contrast between Red torso vs Green grass backgrounds. | Accessibility. | **Check:** Grayscale test. |
| **REQ-046** | **UI Portrait Version** | **Medium** | **Spec:** Crop of head/upper torso, scaled 2x (64x64px), with a colored background circle. | For HUD/Dialogue boxes. | **Art:** Separate export. |
| **REQ-047** | **"Ouch" Flash** | **Low** | **Spec:** White flash shader or tint when hitting obstacles. | Standard damage/feedback trope. | **Shader:** Tint parameter. |
| **REQ-048** | **Scale in Engine** | **High** | **Spec:** World scale should be set such that 32px height = 1.8m (human height) approx. | Physics consistency. | **Three.js:** Scale setting. |
| **REQ-049** | **Camera Distance** | **High** | **Spec:** Optimal zoom shows character at ~64-96 screen pixels height. | Balances detail visibility with field of view. | **Camera:** Ortho size. |
| **REQ-050** | **Style Guide Check** | **High** | **Spec:** Comparison side-by-side with `ProjectRoom` assets. | Ensures the bright Lego colors don't clash with muted office palette. | **Review:** Mockup. |

---

## Additional Deliverables

### A. Color Palette Reference Card

| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Lego Bright Red** | `#FE1923` | Classic Space Torso / Accent |
| **Lego Bright Blue** | `#0055BF` | Legs / Pants / UI Primary |
| **Lego Bright Yellow** | `#FNC12E` | Skin Tone (Head/Hands) |
| **Lego Dark Grey** | `#6B5a5A` | Joints / Hips / Utility Belt |
| **White** | `#FFFFFF` | Highlights / Eyes / Logo |
| **Black** | `#000000` | Eyes / Facial Features / Outlines |

### B. Proportion Guide Reference
```
      [   HEAD   ]  <- 12px
      [ STUD TOP ]  <- 2px
      
      [  TORSO   ]  <- 14px  (Trapezoid: 14px top -> 18px bottom)
      
      [   HIPS   ]  <- 2px   (T-Piece)
      
      [   LEGS   ]  <- 12px  (Rectangular blocks)
      
      TOTAL HEIGHT: ~48px (including top stud)
```

### C. Implementation Timeline
1.  **Day 1:** Create Base Body (Front, Back, Side views).
2.  **Day 1:** Apply Palette and Shading (Plastic look).
3.  **Day 2:** Rig/Separate parts in Aseprite (Head, Torso, Arms, Legs).
4.  **Day 2:** Animate South/East Walk Cycles.
5.  **Day 3:** Mirror animations for North/West.
6.  **Day 3:** Export and Test in Game Engine.
