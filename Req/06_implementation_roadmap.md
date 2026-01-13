# Implementation Roadmap

## Phase 1: High-Impact Visuals (Quick Wins)
*Timeline: Days 1-3*

-   **Step 1.1:** Setup `Environment` and HDRI.
-   **Step 1.2:** tune PBR Materials (Skin SSS, Cloth Roughness).
-   **Step 1.3:** Implement `ContactShadows`.
-   **Step 1.4:** Add Post-Processing (Bloom + Vignette).
-   **Dependencies:** None.
-   **Risk:** Performance drop on mobile. *Mitigation: Disable Post-Processing on `isMobile`.*

## Phase 2: Core Refactor (Architecture)
*Timeline: Days 4-7*

-   **Step 2.1:** Implement Zustand `gameStore`.
-   **Step 2.2:** Migrate all `assets/data` to Type-safe collections.
-   **Step 2.3:** Refactor `RobloxCharacter` to use IK for feet (No more sliding).
-   **Step 2.4:** Fix Camera Controller for smooth Mobile/Desktop transitions.
-   **Dependencies:** Phase 1 complete (to visually verify IK).
-   **Risk:** Breaking existing movement logic. *Mitigation: Keep `LegacyPlayer` component as fallback.*

## Phase 3: Mobile & UX Polish
*Timeline: Days 8-10*

-   **Step 3.1:** Rebuild Mobile UI overlay (CSS Grid/Flex based on Safe Areas).
-   **Step 3.2:** Implement Touch-to-move prioritization.
-   **Step 3.3:** Add "Loading..." states and Preloaders.
-   **Dependencies:** Store refactor (Step 2.1).

## Phase 4: Final Polish & Audit
*Timeline: Days 11-14*

-   **Step 4.1:** Accessibility Pass (ARIA labels).
-   **Step 4.2:** Sound FX integration (Howler).
-   **Step 4.3:** Particle System Upgrade (Soft particles).
-   **Step 4.4:** Final Bug Sweep (Clipping, Z-fighting).

## Milestone Definitions
-   **M1 (Visual Alpha):** The game looks "Next-Gen" but might have bugs.
-   **M2 (Technical Beta):** Code is clean, performant, and robust.
-   **M3 (Release Candidate):** Fully polished, mobile-ready, audio integrated.
