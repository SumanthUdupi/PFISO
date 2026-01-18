# 01 - Game Design & Mechanics Requirements (Rev 2.0)

**Project:** Interactive 3D Portfolio (PFISO) - *The "Cozy" Update*

## 1. Core Philosophy: "Playful Professionalism"
The experience must bridge the gap between a **high-end architectural visualization** and a **whimsical sandbox game**.
- **The "Feel":** Tactile, responsive, and grounded. Objects shouldn't just be static meshes; they should react to the player's presence.
- **The Loop:** Explore -> Play/Relax -> Discover -> Connect.

## 2. Advanced Movement & Controls
### Weight & Momentum
- **Inertia:** Movement should have subtle acceleration/deceleration curves. The player isn't a floating camera; they are a person.
- **Head Sway:** Procedural camera sway based on turning speed, not just animations.
- **Crouch:** (`Left Ctrl`) To inspect low shelves or look under desks for secrets.
- **Lean:** (`Q` / `E`) capability to peek around corners or admire details.

### "Siting" System
- **Contextual Action:** Almost any chair (desk chair, bean bag, sofa) is interactable.
- **Effect:** Camera smoothly transitions to a seated position.
- **UI Change:** HUD fades out in "Relax Mode". New options appear (e.g., "Spin Chair", "Read Book").

## 3. Physics & Object Manipulation
To make the world feel alive, we implement a "Tactile Physics" system similar to *Gone Home* or *Firewatch*.
- **Pickup & Inspect:** (`Right Click`) Hold an object in front of the camera.
- **Rotate:** Drag mouse while holding to examine 3D details (e.g., read the back of a book or the bottom of a trophy).
- **Throw/Drop:** (`Left Click`) Gently toss a crumbled paper ball or place a mug back on the coaster.
- **Physics Toys:** 
    - **Newton's Cradle:** Clicking pulls a ball back.
    - **Basketball:** Mini-hoop on the door. Real-time physics scoring.

## 4. The "Cozy" Interaction Layer
Interactions that serve no "business" purpose but strictly enhance mood.
- **Light Switches:** Toggle desk lamps, floor lamps, and smart bias lighting.
- **Blinds/Curtains:** Open/Close to change natural light influx.
- **Faucets:** Turn on sink water (audio feedback).
- **Whiteboard Eraser:** Physically wipe drawings off the board.

## 5. Gamification 2.0: The "Flow" State
Instead of a linear checklist, use a **Journal System**.
- **The Journal:** Valid "Quest Log".
    - **Auto-Sketching:** When player visits a zone, a "sketch" of that zone is drawn in the journal.
    - **Stickers:** Achievements award stickers placed on the journal cover.
- **Memory Orbs:** Finding key resume items spawns a localized particle effect or "Orb" that can be collected to unlock "Developer Commentary" audio logs.

## 6. Camera / Photography Mode
- **Tool:** In-game Smartphone or Camera.
- **Function:** Take screenshots with filters (Polaroid, Noir, Vibrant).
- **Gallery:** Photos saved to a virtual album (and downloadable to real device).
- **Quest:** "Photo Safari" - Take a picture of the Cat, the Award, and the view from the window.
