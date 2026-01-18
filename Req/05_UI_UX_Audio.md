# 05 - UI/UX & Audio Design

**Project:** Interactive 3D Portfolio Experience (PFISO)

## 1. UI Philosophy: Diegetic & Minimal
The User Interface should exist *within* the world as much as possible, or be minimal overlays that don't break immersion.

## 2. HUD (Heads-Up Display)
- **Always Visible:**
    - **Reticle:** Tiny dot in center. Changes state (color/shape) on hover.
    - **Current Objective:** Subtle text top-left (e.g., "Explore the Workstation").
- **Contextual:**
    - **Interaction Prompt:** "[E] Read" appears near the crosshair when hovering.
    - **Mobile:** Virtual joysticks (bottom left/right) only visible on touch devices.

## 3. Menus & Modals
- **Pause Menu (ESC):**
    - Options: Sensitivity, Audio Volume, Graphics Quality (Low/High).
    - Controls Reference.
    - "Resume" and "Back to Intro".
- **Content Modals:**
    - When viewing a project, the camera blurs (Depth of Field), and a clean glass-morphism card overlays the center.
    - Close button (X) and standard scrolling inside the modal.
    - Pressing `ESC` or clicking `Backdrop` closes the modal.
- **Loading Screen:**
    - Black screen -> Progress Bar -> "Click to Start" (Initializes AudioContext).
    - Quote/Tagline display.

## 4. Accessibility (A11Y)
- **Reduced Motion:** Toggle to disable head bob and smooth camera lerp.
- **Colorblind Support:** Ensure critical cues (reticle change) use shape *and* color.
- **Keyboard Navigation:** Menus must be navigable via Arrows/Tab.
- **Screen Reader:** 3D canvas is largely invisible to screen readers. We must provide a parallel **"Accessible Mode"** (a plain HTML version of the portfolio) linked from the start screen or accessible via a hidden skip link.

## 5. Audio Design
Audio is half the immersion.
- **BGM:**
    - "Experience" / "Flow" state music. Low-BPM Lo-Fi or Ambient Electronica.
    - Muted/Ducked when a video is playing in a modal.
- **SFX:**
    - **Footsteps:** Randomized pitch for variety. Different sounds for Carpet vs. Concrete (if multiple materials).
    - **UI:** Soft "Click", "Hover" swoosh (digital/holographic sounds).
    - **Interaction:** Physical sounds (Paper rustle, Keyboard clack).
- **Positional Audio:**
    - A radio in the corner playing the BGM (so it gets louder as you get closer).
    - Computer fans humming near the desk.

## 6. Feedback Systems
- **Visual:** 
    - Highlight outlines on interactive objects.
    - Particles (dust motes) near windows to show volumetric light.
- **Haptic:** 
    - (Mobile) Light vibration on successful interaction.
