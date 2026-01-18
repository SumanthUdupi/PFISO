# 06 - Cozy Features & Systems

**Project:** Interactive 3D Portfolio (PFISO)

## Overview
These systems exist purely for player delight and immersion. They transform the space from a "map" into a "home".

## 1. The Coffee System
A fully interactive ritual.
- **Machine:** An espresso machine or pour-over setup on a side counter.
- **Process:** 
    1. Click "Brew".
    2. Audio: Grinding -> Dripping.
    3. Visual: Liquid fills cup (Shader).
    4. Steam particles start.
- **Consumption:** Player can "Pick Up" the mug.
    - **Action:** Right-click to "Sip".
    - **Effect:** Camera FOV widens slightly (Relax effect), Audio "Ahhh". 
    - **Buff:** Movement speed +10% for 30 seconds (Caffeine Rush).

## 2. Music Station (The Vinyl Player)
Diegetic music control.
- **Object:** A turntable with a stack of vinyl records.
- **Interaction:** 
    - Flip through record covers (Genre selection: Lo-Fi, Jazz, Synthwave).
    - Drag record to player.
    - Click "Needle" to drop it.
- **Visuals:** Record spins. EQ bars visualize on the amplifier.
- **UI:** Track info appears as a "Currently Playing" notification on the HUD.

## 3. Plant Care
- **State:** Plants have a "Thirst" visual state (slightly droopy or desaturated).
- **Tool:** Watering Can (item to pick up).
- **Interaction:** Pour water on plant.
- **Reward:** Plant "perks up" (animation), brightens, and spawns a "Heart" particle. Achievement: "Green Thumb".

## 4. The Companion (Pet System)
*Optional but highly requested.*
- **Entity:** A sleepy Cat or a small Robot.
- **Behavior:** 
    - Follows player loosely or sleeps in sunbeams.
    - Reacts to mouse cursor (lookat).
- **Interaction:** 
    - **Pet:** Click to pet. Purring audio.
    - **Feed:** Place food in bowl.
- **Purpose:** Emotional anchor. Makes the space feel lived-in.

## 5. Customization (Desk Setup)
Allow the player to personalize "My Desk".
- **Clean Up:** Organize scattered papers.
- **Decorate:** Toggle between different desk mats or "Figurines" (Funko-pop style representations of skills).
- **Lighting:** RGB Strip control behind the monitor (Color picker UI).
