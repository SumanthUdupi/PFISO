# 02 - Environment & Art Direction (Rev 2.0)

**Project:** Interactive 3D Portfolio (PFISO) - *The "Hygge" Update*

## 1. Aesthetic Goal: "Digital Hygge"
The environment should feel like a sanctuary. A place where the user *wants* to hang out, even after reading the resume.
- **Keywords:** Warm, Textured, Atmospheric, Soft, Inviting.
- **Inspiration:** "Lo-Fi Hip Hop Radio" backgrounds, high-end Airbnb interiors, Ghibli food/interiors.

## 2. Dynamic Atmosphere System
The office isn't static. It breathes.
### Time of Day Options
1.  **Golden Hour (Default):** Long shadows, warm orange sunbeams, distinct God Rays.
2.  **Midnight Flow:** Dark blue ambient, bright neon monitor glow, city lights visible outside.
3.  **Rainy Afternoon:** Overcast, soft diffuse light, rain droplets on windows.

### Weather Effects
- **Rain:** Animated shader on window glass (refraction/distortion). Audio of rain hitting glass.
- **Wind:** Plants gently swaying near the window.
- **Dust:** Floating dust motes visible in light shafts (Volumetric scattering).

## 3. Materiality & Texture Fidelity
- **Imperfection:** Nothing should look "perfectly CG".
    - **Fingerprints:** Roughness maps on the monitor screen and glass tabletops.
    - **Fabric:** Fuzzy velvet shader for the bean bag and rug (Sheen).
    - **Wood:** Normal maps showing grain depth.
- **Subsurface Scattering (SSS):** For plant leaves and wax candles to let light bleed through.

## 4. Lighting Upgrade (Cinematic)
- **Baked vs. Real-time:** use **Bakery** (or similar) strategies for static GI, mixed with real-time shadows for interactive objects.
- **IES Profiles:** Use real-world light projection maps for desk lamps (asymmetrical throw).
- **Volumetrics:** True volumetric fog for the "God Ray" effect from the window.
- **Reflection Probes:** Real-time reflections on the floor (Screen Space Reflections - SSR) to ground objects.

## 5. Visual FX (Juice)
- **Typing:** Tiny particle sparks or "code glyphs" floating up when interacting with the keyboard.
- **Coffee:** Procedural steam rising from the mug (Shader-based).
- **Selection:** Instead of a generic outline, use a **Chromatic Aberration** pulse or a "Holographic" wireframe overlay on hover.

## 6. Color Palette: "Retro-Future Comfort"
- **Primary:** Cream (#FDF5E6), Warm Grey.
- **Secondary:** Sage Green (Plants), Terracotta (Pots), Deep Navy (Technology).
- **Accent:** Neon Cyan & Magenta (Strictly for "Tech" elements to pop against the warm background).
