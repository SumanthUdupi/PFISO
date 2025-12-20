# Game Mechanics Enhancement Requirements

## Executive Summary

- **Current Mechanical Strengths**: The game possesses a solid technical foundation with a dual-input control scheme (WASD/Click) and a well-structured interactive object system. The core loop of "Explore -> Interact -> View" is clear and functional, serving its purpose as a portfolio showcase. The art style is cohesive and provides a strong atmospheric base to build upon.

- **Key Opportunities for Improvement**: The primary opportunity lies in transforming the experience from a passive "interactive resume" into a true "game". The current mechanics lack depth, progression, and player motivation beyond curiosity. The `SkillInventory` is a static display and represents the single greatest opportunity for creating a compelling progression system. The world is static and lacks reasons for deep exploration or repeat engagement.

- **Recommended Focus Areas**:
    1.  **Dynamic Skill Progression**: Evolve the `SkillInventory` from a static list into the core progression system where skills are unlocked by engaging with portfolio content.
    2.  **Goal-Oriented Gameplay**: Introduce a quest or task system that guides the player and provides a clear sense of purpose and accomplishment.
    3.  **World Interactivity & Depth**: Add layers of interaction, including collectibles, skill-gated challenges, and environmental puzzles to reward exploration and mastery.
    4.  **Juice & Game Feel**: Dramatically enhance the feeling of interaction with improved audio-visual feedback to make every action more satisfying.

## Requirements by Category

### 1. Core Gameplay Loop (Requirements 1-10)

#### REQ-001: The "A-HA!" Moment
- **Category**: Core Loop
- **Current State**: Players interact with objects to view portfolio content, which is a passive experience.
- **Proposed Mechanic**: When a player views a project in `ProjectModal.tsx`, an animation plays, and the specific skills listed in that project's `techStack` (from `projects.json`) are "unlocked" or gain "XP" in the `SkillInventory.tsx`.
- **Player Benefit**: Connects the portfolio content directly to player progression, giving a clear purpose and rewarding "A-ha!" moment for each interaction.
- **Implementation Complexity**: Medium
- **Priority**: Critical
- **Success Metrics**: Players actively seek out all project stations to complete their skill set.
- **Examples**: *Outer Wilds* (gaining knowledge), *Metroid Prime* (scanning lore).

#### REQ-002: Purposeful Movement
- **Category**: Core Loop
- **Current State**: The player can jump, but it serves no gameplay purpose.
- **Proposed Mechanic**: Introduce small, low-risk platforming challenges. Place some interactive elements or collectibles in areas that are only reachable by jumping.
- **Player Benefit**: Gives the jump action a purpose, encourages environmental awareness, and adds a light layer of skill-based exploration.
- **Implementation Complexity**: Low
- **Priority**: High
- **Success Metrics**: Heatmaps show players exploring vertical spaces and successfully reaching hidden areas.
- **Examples**: *A Short Hike*, *Jak and Daxter* (hub world collectibles).

#### REQ-003: Player Sprint/Dash
- **Category**: Core Loop
- **Current State**: Player movement speed is constant.
- **Proposed Mechanic**: Add a "sprint" or short "dash" ability to the player controller in `Player.tsx`, possibly consuming a regenerating stamina bar.
- **Player Benefit**: Increases player agency and the dynamism of movement, making traversal faster and more engaging.
- **Implementation Complexity**: Medium
- **Priority**: Medium
- **Success Metrics**: Players use the dash ability frequently to navigate the space more quickly.

#### REQ-004: A Living World
- **Category**: Core Loop
- **Current State**: The environment is entirely static. The `BLOCKED_TILES` in `pathfinding.ts` are hardcoded.
- **Proposed Mechanic**: Create a simple "NPC" character that walks along a predefined path, dynamically updating the pathfinding grid. This could be a simple, non-interactive cleaning bot or a wandering creature.
- **Player Benefit**: Makes the world feel more alive, dynamic, and less like a static diorama.
- **Implementation Complexity**: High
- **Priority**: Medium
- **Success Metrics**: Players notice and occasionally have their pathfinding altered by the moving entity.

#### REQ-005: The "Inspiration" Currency
- **Category**: Core Loop
- **Current State**: There is no economy or currency system.
- **Proposed Mechanic**: Introduce a collectible currency called "Inspiration" (or "Insights"). These can be gained by completing tasks or finding hidden collectibles.
- **Player Benefit**: Creates a primary extrinsic motivator and a resource that can be spent on cosmetic unlocks or other minor upgrades, providing a tangible reward for actions.
- **Implementation Complexity**: Medium
- **Priority**: Medium
- **Success Metrics**: Players have a clear understanding of how to earn "Inspiration" and what it can be used for.

#### REQ-006: Hub Expansion
- **Category**: Core Loop
- **Current State**: The entire game takes place in one small room.
- **Proposed Mechanic**: Add a new door or teleporter that becomes unlocked after the player views all primary projects. This leads to a small, new "Lab" or "R&D" area with an experimental/fun project inside.
- **Player Benefit**: Provides a satisfying "end-game" reward and a sense of discovery and progression in the world itself.
- **Implementation Complexity**: High
- **Priority**: Low
- **Success Metrics**: Players successfully unlock and enter the new area.

#### REQ-007: Meaningful Obstacles
- **Category**: Core Loop
- **Current State**: Obstacles are just static blockers.
- **Proposed Mechanic**: Introduce one or two simple "puzzle" obstacles. For example, a laser grid that must be deactivated by pressing two switches in different locations within a time limit.
- **Player Benefit**: Introduces a light challenge and problem-solving element to the core loop, breaking up the simple "walk and click" pattern.
- **Implementation Complexity**: Medium
- **Priority**: Low
- **Success Metrics**: Players are able to solve the puzzle without excessive frustration.

#### REQ-008: Dynamic Day/Night Cycle
- **Category**: Core Loop
- **Current State**: The lighting is static.
- **Proposed Mechanic**: Implement a simple, accelerated day/night cycle that subtly changes the lighting and skybox colors over a 10-minute loop. Some secrets could only be visible at "night" (e.g., glowing paint on the floor).
- **Player Benefit**: Adds significant visual dynamism and provides a hook for time-based puzzles or discoveries.
- **Implementation Complexity**: Medium
- **Priority**: Low
- **Success Metrics**: Players notice the changing light and discover time-sensitive secrets.
- **Examples**: *The Legend of Zelda: Ocarina of Time*, *Stardew Valley*.

#### REQ-009: Interaction Variations
- **Category**: Core Loop
- **Current State**: All interactions are a single button press that opens a modal.
- **Proposed Mechanic**: Introduce a "hold to interact" mechanic for specific, important actions (e.g., "booting up the main server"). This builds anticipation.
- **Player Benefit**: Adds weight and ceremony to critical interactions, making them feel more significant than a simple click.
- **Implementation Complexity**: Low
- **Priority**: Medium
- **Success Metrics**: Players feel a greater sense of impact when performing "held" interactions.

#### REQ-010: The Main Quest
- **Category**: Core Loop
- **Current State**: There is no explicit goal.
- **Proposed Mechanic**: Upon starting, the player receives a single, clear objective in the UI: "Restore your skills by reviewing your past projects."
- **Player Benefit**: Provides immediate direction and a clear, overarching goal for the player to pursue, framing the entire experience as a game.
- **Implementation Complexity**: Low
- **Priority**: Critical
- **Success Metrics**: New players immediately understand what they are supposed to do.

---

### 2. Progression & Rewards (Requirements 11-20)

#### REQ-011: Skill Tiers
- **Category**: Progression
- **Current State**: Skills are just a name in a list.
- **Proposed Mechanic**: Each skill in `SkillInventory.tsx` can have tiers (e.g., Novice, Proficient, Master). Viewing a small project might grant "Novice," while a major project grants "Proficient."
- **Player Benefit**: Creates a more granular and satisfying progression system with a longer tail of engagement.
- **Implementation Complexity**: Medium
- **Priority**: High
- **Success Metrics**: Players understand the tier system and feel a sense of growth as they level up skills.

#### REQ-012: Skill-Gated Content
- **Category**: Progression
- **Current State**: All content is available from the start.
- **Proposed Mechanic**: Add a new `InteractiveObject` that is initially "locked." It requires a specific skill (e.g., "React" at "Proficient" tier) to be unlocked. Interacting with it could reveal a blog post about that technology or a fun easter egg.
- **Player Benefit**: Makes the skill progression meaningful, as it directly unlocks new content and rewards the player for their progress.
- **Implementation Complexity**: Medium
- **Priority**: High
- **Success Metrics**: Players return to previously locked objects once they've acquired the necessary skills.
- **Examples**: *Metroid* (classic ability gating).

#### REQ-013: Collectible "Inspiration Motes"
- **Category**: Progression
- **Current State**: No collectibles exist.
- **Proposed Mechanic**: Scatter 10-15 small, glowing "Inspiration Motes" around the level, some in hard-to-reach places. Each mote, when collected, displays a short, interesting quote about design or programming.
- **Player Benefit**: Encourages thorough exploration and provides small, delightful rewards that flesh out the theme of the game.
- **Implementation Complexity**: Medium
- **Priority**: High
- **Success Metrics**: A UI tracker shows `Motes Found: X/15`, and players actively hunt for them.

#### REQ-014: Cosmetic Unlocks
- **Category**: Rewards
- **Current State**: The player character is not customizable.
- **Proposed Mechanic**: Using the "Inspiration" currency (REQ-005), allow the player to purchase simple cosmetic changes for their avatar at a special "Customization Station" object. This could be changing the color of their character's "shirt" or head.
- **Player Benefit**: Provides a tangible use for currency and allows for player expression, increasing investment in their avatar.
- **Implementation Complexity**: Medium
- **Priority**: Medium
- **Success Metrics**: Players engage with the customization system and spend their currency.
- **Examples**: *Fortnite*, *Destiny* (shader system).

#### REQ-015: The "Accomplishments" System
- **Category**: Progression
- **Current State**: No achievements or tracked stats.
- **Proposed Mechanic**: Create a simple, in-game achievement system (e.g., "First Project Viewed," "All Skills Unlocked," "Found All Motes," "Jumped 50 times").
- **Player Benefit**: Provides a checklist of optional goals that cater to completionist players and extend playtime.
- **Implementation Complexity**: Medium
- **Priority**: Medium
- **Success Metrics**: A dedicated UI modal for accomplishments shows player progress and encourages them to hit 100%.

#### REQ-016: The Final Reward
- **Category**: Rewards
- **Current State**: No reward for "finishing" the game.
- **Proposed Mechanic**: Once all skills are unlocked to their highest tier, a final, celebratory animation plays. The central desk could transform, revealing a "Hire Me" button that links to your contact info or LinkedIn.
- **Player Benefit**: Provides a clear, satisfying conclusion to the game loop and a powerful, memorable call-to-action.
- **Implementation Complexity**: Medium
- **Priority**: High
- **Success Metrics**: Players reach the "end" and trigger the final call-to-action.

#### REQ-017: Content Feed
- **Category**: Progression
- **Current State**: All portfolio content is static.
- **Proposed Mechanic**: Create an `InteractiveObject` for a "Blog" or "Updates" feed. This could pull data from a simple headless CMS (like a public Notion page or a GitHub gist) to display recent, short updates.
- **Player Benefit**: Allows you to add new content and keep the portfolio fresh without redeploying the entire application, adding a reason for visitors to return.
- **Implementation Complexity**: High
- **Priority**: Low
- **Success Metrics**: You can update the in-game content feed dynamically.

#### REQ-018: "Eureka!" Moments
- **Category**: Rewards
- **Current State**: Unlocking a skill has no immediate effect beyond the UI.
- **Proposed Mechanic**: When a skill is unlocked, trigger a radial particle burst and a satisfying sound effect. For a brief moment, all objects related to that skill in the world could glow.
- **Player Benefit**: Creates a powerful, multi-sensory reward moment that feels significant and exciting.
- **Implementation Complexity**: Medium
- **Priority**: High
- **Success Metrics**: Player feedback indicates that unlocking skills feels satisfying.

#### REQ-019: Environmental Storytelling
- **Category**: Rewards
- **Current State**: The environment is clean and context-free.
- **Proposed Mechanic**: Add small, non-interactive narrative objects that become readable upon unlocking certain skills. For example, a whiteboard with complex diagrams that only becomes "decipherable" once the "System Design" skill is unlocked.
- **Player Benefit**: Rewards progression with narrative snippets and world-building, making the environment itself part of the reward loop.
- **Implementation Complexity**: Low
- **Priority**: Medium
- **Success Metrics**: Players notice and appreciate the environmental details that change or become available as they progress.

#### REQ-020: The "Fast-Travel" Unlock
- **Category**: Progression
- **Current State**: The player must manually walk everywhere.
- **Proposed Mechanic**: After viewing 50% of the projects, unlock a "fast travel" system. The player can open a map view and instantly teleport between the major interactive stations.
- **Player Benefit**: Respects the player's time in the later stages of the game and removes friction once exploration is no longer the primary goal.
- **Implementation Complexity**: Medium
- **Priority**: Medium
- **Success Metrics**: Players use the fast travel system in the mid-to-late game to speed up navigation.
- **Examples**: Most open-world RPGs.

---

### 3. Challenge & Difficulty (Requirements 21-30)

*Note: As a portfolio piece, challenge should be minimal and focused on optional engagement rather than barriers.*

#### REQ-021: Optional Time Trials
- **Category**: Challenge
- **Current State**: No time pressure.
- **Proposed Mechanic**: Add an `InteractiveObject` that triggers an optional "Speed Run" mode. The player must visit all three main stations as quickly as possible. A leaderboard could store the best time locally.
- **Player Benefit**: Provides a high-skill, repeatable challenge for interested players without impeding the core experience for others.
- **Implementation Complexity**: Medium
- **Priority**: Low
- **Success Metrics**: Players attempt the speed run and try to beat their own best times.

#### REQ-022: Hidden Area Platforming
- **Category**: Challenge
- **Current State**: Jumping is not challenging.
- **Proposed Mechanic**: Create a small, hidden "attic" or "basement" area that requires a series of slightly tricky jumps to reach. This area could contain a fun easter egg or the final "Inspiration Mote."
- **Player Benefit**: Provides an optional, skill-based challenge for players who have mastered the controls.
- **Implementation Complexity**: Medium
- **Priority**: Low
- **Success Metrics**: Only a fraction of players will find this area, making it a special discovery.
- **Examples**: *Super Mario 64* (secret stars).

#### REQ-023: Sequential Puzzle
- **Category**: Challenge
- **Current State**: No puzzles.
- **Proposed Mechanic**: Create a set of 3-4 terminals that must be activated in a specific order. The order could be hinted at by a riddle or a visual cue elsewhere in the environment. Solving it could unlock a cosmetic item.
- **Player Benefit**: Adds a light intellectual challenge that encourages observation and deduction.
- **Implementation Complexity**: Medium
- **Priority**: Low
- **Success Metrics**: Players are able to find the hint and solve the sequence puzzle.

#### REQ-024: "Glitching" Obstacles
- **Category**: Challenge
- **Current State**: Obstacles are static.
- **Proposed Mechanic**: One of the pathways could be blocked by a "glitching" wall that phases in and out of existence on a regular timer. The player must time their movement to pass through it.
- **Player Benefit**: Introduces a simple timing challenge that tests player observation and execution.
- **Implementation Complexity**: Low
- **Priority**: Low
- **Success Metrics**: Players successfully navigate the timed obstacle.

#### REQ-025: The "Memory" Game
- **Category**: Challenge
- **Current State**: No memory elements.
- **Proposed Mechanic**: An interactive terminal flashes a short sequence of colors (e.g., Red, Blue, Blue, Green). The player must then click on colored panels in the same sequence to unlock a reward.
- **Player Benefit**: Provides a classic, simple mini-game challenge that breaks up the core loop.
- **Implementation Complexity**: Medium
- **Priority**: Low
- **Success Metrics**: Players can beat the memory game.
- **Examples**: *Simon*.

*Note: Requirements 26-30 are intentionally left simple as heavy challenge is counter-productive for this type of project.*

#### REQ-026: Hidden Key
- **Category**: Challenge
- **Current State**: No keys or locks.
- **Proposed Mechanic**: A locked door requires a "keycard." The keycard is a collectible item hidden somewhere in the level, perhaps behind a plant or on top of a high shelf.
- **Player Benefit**: Encourages more careful, deliberate exploration of the environment.
- **Implementation Complexity**: Low
- **Priority**: Low
- **Success Metrics**: Players find the keycard and use it to open the corresponding door.

#### REQ-027: "Debug Mode"
- **Category**: Challenge
- **Current State**: No alternate game modes.
- **Proposed Mechanic**: After completing the game, the player unlocks a "Debug Mode" they can toggle. This could enable noclip, display pathfinding grids, or reveal other behind-the-scenes data.
- **Player Benefit**: Acts as a fun, empowering "New Game+" reward for technically-minded visitors and showcases your development skills.
- **Implementation Complexity**: Medium
- **Priority**: Low
- **Success Metrics**: Players who finish the game discover and play with the debug tools.

#### REQ-028: NPC Dialogue Quiz
- **Category**: Challenge
- **Current State**: No dialogue.
- **Proposed Mechanic**: If an NPC is added (REQ-004), interacting with it could present a simple, multiple-choice quiz based on the portfolio content (e.g., "What framework was used in Project X?").
- **Player Benefit**: Playfully tests if the visitor was paying attention to the portfolio content.
- **Implementation Complexity**: Medium
- **Priority**: Low
- **Success Metrics**: Players answer the quiz questions correctly.

#### REQ-029: Avoid the "Patrol"
- **Category**: Challenge
- **Current State**: No threats.
- **Proposed Mechanic**: A slow-moving "Security Bot" patrols a key area. If it sees the player, it doesn't cause damage, but "reboots" them back to the start of the area. It can be avoided by hiding behind objects.
- **Player Benefit**: Introduces a very light stealth element and a dynamic obstacle.
- **Implementation Complexity**: High
- **Priority**: Low
- **Success Metrics**: Players learn the patrol pattern and successfully avoid the bot.

#### REQ-030: The One-Time-Only Event
- **Category**: Challenge
- **Current State**: All events are repeatable.
- **Proposed Mechanic**: The first time the player interacts with the main desk, trigger a scripted "power outage." The main lights go out for 10 seconds, and emergency lights turn on before power is restored.
- **Player Benefit**: Creates a memorable, surprising, and unrepeatable moment that makes the first playthrough feel special.
- **Implementation Complexity**: Medium
- **Priority**: Medium
- **Success Metrics**: The scripted event surprises the player and adds a sense of drama.

---

### 4. Feedback & Game Feel (Requirements 31-40)

#### REQ-031: Dynamic Click Marker
- **Category**: Feedback
- **Current State**: The `ClickMarker.tsx` is a simple visual effect.
- **Proposed Mechanic**: Enhance the click marker. If the player clicks a valid spot, it's a green ring. If they click an invalid spot (a wall), it's a red "X" with a negative sound effect.
- **Player Benefit**: Provides immediate, clear, and unambiguous feedback for the player's primary input.
- **Implementation Complexity**: Low
- **Priority**: Critical
- **Success Metrics**: Players are never confused about whether their click was valid.

#### REQ-032: "Coyote Time" & Jump Buffering
- **Category**: Polish
- **Current State**: The jump physics in `Player.tsx` are likely basic.
- **Proposed Mechanic**: Implement "coyote time" (allowing a jump for a few frames after walking off a ledge) and a "jump buffer" (queuing a jump if the button is pressed just before landing).
- **Player Benefit**: Makes the platforming controls feel significantly more responsive, forgiving, and fair, even if players don't consciously know why.
- **Implementation Complexity**: Medium
- **Priority**: High
- **Success Metrics**: Platforming feels "right" and players don't complain about missed jumps.
- **Examples**: *Celeste*.

#### REQ-033: Audio Feedback for Everything
- **Category**: Feedback
- **Current State**: Audio is likely minimal or non-existent.
- **Proposed Mechanic**: Add sound effects for: jumping, landing, collecting a mote, UI buttons appearing, hovering over a button, and opening/closing modals.
- **Player Benefit**: Audio is 50% of game feel. This will make the world feel infinitely more tactile and responsive.
- **Implementation Complexity**: Medium
- **Priority**: Critical
- **Success Metrics**: Every significant player action has a corresponding sound.

#### REQ-034: Screen Shake
- **Category**: Feedback
- **Current State**: No screen shake.
- **Proposed Mechanic**: Add subtle, tasteful screen shake for major events using a library like `@react-three/drei`'s `CameraShake`. Example triggers: landing from a high jump, unlocking a major skill, the "power outage" event.
- **Player Benefit**: Adds visceral, physical impact to key moments, making them feel more powerful.
- **Implementation Complexity**: Low
- **Priority**: High
- **Success Metrics**: Key moments feel more impactful.

#### REQ-035: Player Animation Polish
- **Category**: Polish
- **Current State**: Player animations are procedural but simple.
- **Proposed Mechanic**: In `Player.tsx`, add subtle secondary animations. When the player stops running, add a little "skid" animation. When they land from a jump, add a "squash" motion.
- **Player Benefit**: Makes the player character feel more physical and responsive to input.
- **Implementation Complexity**: Medium
- **Priority**: Medium
- **Success Metrics**: Player movement feels more fluid and polished.

#### REQ-036: Text Readability
- **Category**: Feedback
- **Current State**: Text might be hard to read against certain backgrounds.
- **Proposed Mechanic**: As suggested in the art review, add a 1px dark drop-shadow to all world-space and UI text.
- **Player Benefit**: Guarantees text is readable in all lighting conditions, which is critical for communicating information.
- **Implementation complexity**: Low
- **Priority**: Critical
- **Success Metrics**: Text is always legible.

#### REQ-037: State-Driven Cursor
- **Category**: Feedback
- **Current State**: The mouse cursor is likely the OS default.
- **Proposed Mechanic**: Change the cursor style based on context. Default arrow for UI, a "hand" or "magnifying glass" when hovering over an `InteractiveObject`, and a "crosshair" or "dot" otherwise.
- **Player Benefit**: Provides constant, subtle feedback about what the player can interact with.
- **Implementation Complexity**: Low
- **Priority**: High
- **Success Metrics**: The cursor changes appropriately with game state.

#### REQ-038: Teleport Transition Polish
- **Category**: Polish
- **Current State**: The `TeleportSparkle.tsx` effect is simple.
- **Proposed Mechanic**: Enhance the fast-travel (REQ-020) transition. On departure, the screen rapidly fades to white with a "whoosh" sound. On arrival, it fades back in from white, and the `TeleportSparkle` effect plays.
- **Player Benefit**: Makes fast travel feel like a deliberate, polished mechanic rather than a jarring teleport.
- **Implementation Complexity**: Low
- **Priority**: Medium
- **Success Metrics**: The fast travel sequence feels good to use.

#### REQ-039: Interaction Prompt Polish
- **Category**: Feedback
- **Current State**: Interaction prompts are simple text.
- **Proposed Mechanic**: Redesign the interaction prompt to be graphical. Show the object's name and a stylized icon of the key/button to press (e.g., a pixel art "[E]"). Animate it to pulse gently.
- **Player Benefit**: Improves clarity and visual appeal of the most important UI prompt.
- **Implementation Complexity**: Low
- **Priority**: High
- **Success Metrics**: Prompts are clearer and more aesthetically pleasing.

#### REQ-040: Destructive Feedback
- **Category**: Feedback
- **Current State**: No destructive actions.
- **Proposed Mechanic**: If you add a "Reset Progress" button in the options, make it a "hold to confirm" button inside a scary red box. The holding action fills a circle, and the sound pitch increases.
- **Player Benefit**: Provides extremely clear feedback for a dangerous action, preventing accidental data loss while feeling deliberate and "chunky".
- **Implementation Complexity**: Low
- **Priority**: Low
- **Success Metrics**: No user accidentally resets their progress.

---

### 5. Replayability & Depth (Requirements 41-50)

#### REQ-041: Session State
- **Category**: Replayability
- **Current State**: No state is saved.
- **Proposed Mechanic**: Use `localStorage` to save the player's progress (unlocked skills, found motes, achievements) between sessions.
- **Player Benefit**: Massively increases investment. Players can leave and come back, continuing their "game," which is essential for a portfolio piece that might be viewed multiple times.
- **Implementation Complexity**: Medium
- **Priority**: Critical
- **Success Metrics**: Player progress persists after closing and reopening the browser tab.

#### REQ-042: Multiple Endings
- **Category**: Replayability
- **Current State**: One linear path.
- **Proposed Mechanic**: Based on the order projects are viewed, slightly change the final "job title" unlocked in the end-game sequence. View all front-end projects first? "Creative Developer." Back-end first? "Software Architect."
- **Player Benefit**: Adds a light element of consequence and encourages a second playthrough to see the different outcomes.
- **Implementation Complexity**: Low
- **Priority**: Low
- **Success Metrics**: Players notice the different titles and may replay to see others.

#### REQ-043: Procedural Decor Placement
- **Category**: Replayability
- **Current State**: `Decor.tsx` objects are likely in fixed positions.
- **Proposed Mechanic**: On each new session, slightly randomize the position and rotation of minor decor items (plants, chairs, etc.).
- **Player Benefit**: Makes the world feel slightly different on each visit, enhancing organic exploration.
- **Implementation Complexity**: Low
- **Priority**: Low
- **Success Metrics**: The scene looks slightly different each time the page is loaded.

#### REQ-044: The "Director's Commentary"
- **Category**: Depth
- **Current State**: No developer commentary.
- **Proposed Mechanic**: After completing the game once, special "commentary" nodes appear. Interacting with them shows a pop-up with a brief, interesting behind-the-scenes fact about the development of the portfolio or a specific project.
- **Player Benefit**: Provides unique "insider" content for interested visitors and brilliantly showcases your thought process as a developer.
- **Implementation Complexity**: Medium
- **Priority**: Medium
- **Success Metrics**: Players who finish the game engage with the commentary nodes.
- **Examples**: Valve games (developer commentary mode).

#### REQ-045: Skill Synergies
- **Category**: Depth
- **Current State**: Skills are independent.
- **Proposed Mechanic**: Create a "synergy" bonus. If you have both "React" and "Three.js" unlocked, a special pedestal appears showcasing a project that uses both.
- **Player Benefit**: Rewards players for unlocking specific combinations of skills and creates a deeper, more systems-driven layer of discovery.
- **Implementation Complexity**: Medium
- **Priority**: Low
- **Success Metrics**: Players discover the synergy-based rewards.

#### REQ-046: A Secret NPC
- **Category**: Depth
- **Current State**: No hidden characters.
- **Proposed Mechanic**: Add a secret NPC that only appears after a non-obvious sequence of actions (e.g., jumping three times in front of the weirdest-looking plant). The NPC could say something cryptic or funny.
- **Player Benefit**: Classic easter egg design. Creates a myth and a "water cooler moment" for those who discover it, dramatically increasing the perceived depth of the world.
- **Implementation Complexity**: Medium
- **Priority**: Low
- **Success Metrics**: The secret is discovered and shared by visitors.

#### RE-047: Dynamic Music System
- **Category**: Depth
- **Current State**: Music is likely one looping track or non-existent.
- **Proposed Mechanic**: Implement a layered music system. A simple ambient track plays constantly. As you approach a project station, a new melodic or rhythmic layer fades in. When all skills are unlocked, a final, triumphant layer is added to the mix.
- **Player Benefit**: Creates a soundtrack that evolves with player progress, sonically underscoring their journey and achievements.
- **Implementation Complexity**: Medium
- **Priority**: Medium
- **Success Metrics**: The music changes dynamically and reflects the player's current state.
- **Examples**: *FTL: Faster Than Light*.

#### REQ-048: The "Konami" Code
- **Category**: Depth
- **Current State**: No cheat codes.
- **Proposed Mechanic**: Implement the Konami code. If the player inputs it, unlock a silly cosmetic (like a pirate hat for the avatar) or a retro-themed visual filter.
- **Player Benefit**: A classic, fun easter egg that rewards players with knowledge of gaming history and showcases a playful side of your development.
- **Implementation Complexity**: Low
- **Priority**: Low
- **Success Metrics**: Players discover and activate the code.

#### REQ-049: Environmental Clues
- **Category**: Depth
- **Current State**: No narrative connections in the environment.
- **Proposed Mechanic**: The password for a terminal (REQ-023) isn't random; it's the year you were born or the name of your first pet, which is mentioned in your bio.
- **Player Benefit**: Rewards players for paying attention to the actual portfolio content and cleverly links the "game" to the "resume".
- **Implementation Complexity**: Low
- **Priority**: Medium
- **Success Metrics**: Players make the connection between the portfolio content and the puzzle solutions.

#### REQ-050: A "Thank You" Message
- **Category**: Replayability
- **Current State**: No personal sign-off.
- **Proposed Mechanic**: Leave a final, hidden `InteractiveObject` that is only findable after 100% completion. Interacting with it simply shows a heartfelt thank you message from you, the creator, for their time and exploration.
- **Player Benefit**: Ends the experience on a warm, personal, and memorable note.
- **Implementation Complexity**: Low
- **Priority**: Medium
- **Success Metrics**: Completionists find the final message and leave with a positive impression.

---

## Implementation Roadmap

- **Phase 1 (Critical - The Core Experience)**: These requirements are essential to transform the project into a "game". They establish the core loop and progression.
  - REQ-001: The "A-HA!" Moment
  - REQ-010: The Main Quest
  - REQ-011: Skill Tiers
  - REQ-012: Skill-Gated Content
  - REQ-018: "Eureka!" Moments
  - REQ-031: Dynamic Click Marker
  - REQ-033: Audio Feedback for Everything
  - REQ-036: Text Readability
  - REQ-041: Session State

- **Phase 2 (High Impact - The "Fun" Factor)**: These requirements add significant engagement, feedback, and reasons to explore.
  - REQ-002: Purposeful Movement
  - REQ-013: Collectible "Inspiration Motes"
  - REQ-016: The Final Reward
  - REQ-032: "Coyote Time" & Jump Buffering
  - REQ-034: Screen Shake
  - REQ-037: State-Driven Cursor
  - REQ-039: Interaction Prompt Polish
  - REQ-044: The "Director's Commentary"

- **Phase 3 (Polish & Depth - The "Wow" Factor)**: These requirements add long-term depth, secrets, and a final layer of professional polish.
  - REQ-003: Player Sprint/Dash
  - REQ-014: Cosmetic Unlocks
  - REQ-022: Hidden Area Platforming
  - REQ-027: "Debug Mode"
  - REQ-046: A Secret NPC
  - REQ-047: Dynamic Music System
  - All remaining `Low` priority tasks.

## Metrics for Success

The ultimate success of these mechanics can be evaluated through a combination of qualitative and (if possible) quantitative measures:

1.  **Session Length**: If you have analytics, a noticeable increase in average session duration would indicate that the new mechanics are successfully engaging users beyond a quick glance.
2.  **Completion Rate**: What percentage of users who start the "game" go on to unlock all skills and see the final call-to-action? A high completion rate is a strong signal of a compelling core loop.
3.  **Qualitative Feedback**: The goal of a portfolio is to generate conversations. Success is when a recruiter or hiring manager says, "I spent way too long playing with your portfolio, I had to find all the secrets!" or "I loved how my skills unlocked as I learned about your projects."
4.  **Discovery of Secrets**: Evidence (via feedback or analytics) that users are finding the optional collectibles, secret areas, and easter eggs. This proves the depth is being explored, not ignored.

---

## Bonus Sections

### Top 10 "Quick Wins" (High Impact, Low Effort)
1.  **REQ-010: The Main Quest**: The simplest way to frame the experience as a game.
2.  **REQ-031: Dynamic Click Marker**: Immediately improves usability.
3.  **REQ-036: Text Readability**: Critical accessibility fix.
4.  **REQ-037: State-Driven Cursor**: Simple CSS changes for big feedback improvement.
5.  **REQ-039: Interaction Prompt Polish**: Improves the most-seen UI element.
6.  **REQ-002: Purposeful Movement**: Placing one collectible on a high ledge immediately gives the jump a purpose.
7.  **REQ-034: Screen Shake**: Easy to add with libraries and adds immense impact.
8.  **REQ-048: The "Konami" Code**: A fun, quick easter egg to implement.
9.  **REQ-049: Environmental Clues**: Just requires changing a password string to match existing bio text.
10. **REQ-009: Interaction Variations**: Swapping a click for a hold is a small code change with good feel.

### 5 "Signature Mechanics" That Could Define the Game
1.  **REQ-001: The "A-HA!" Moment**: The core mechanic linking your portfolio to progression. This is THE defining feature.
2.  **REQ-012: Skill-Gated Content**: Makes the progression meaningful and creates a Metroidvania-like loop of returning to old areas with new abilities.
3.  **REQ-044: The "Director's Commentary"**: A brilliant and unique way to present your professional thought process in a diegetic format. This is a huge portfolio standout.
4.  **REQ-027: "Debug Mode"**: Shows off your technical skills in a playful, interactive, and impressive way.
5.  **REQ-047: Dynamic Music System**: An elegant, high-end feature that demonstrates a deep understanding of player experience design.

### 3 "Bold Ideas" That Might Require Refactoring but Would be Transformative
1.  **Dynamic Navmesh Generation**: Ripping out the hardcoded `BLOCKED_TILES` in `pathfinding.ts` and replacing it with a system that generates the navmesh at runtime. This would allow for truly dynamic environments, where you could add/remove furniture or have NPCs that act as moving obstacles. This is a huge technical flex.
2.  **Multiplayer Visitor Avatars**: Using a simple WebSockets backend (or a service like Liveblocks/Ably) to show other people currently visiting the site as simple, non-interactive ghost avatars walking around. It would make the space feel alive and communal, transforming it from a single-player game into a shared digital space.
3.  **Physics-Based Micro-Puzzles**: Integrating a lightweight physics engine (if not already present) to create small, satisfying puzzles. Imagine a locked door where the key is visible but out of reach, and you have to knock it down by throwing a nearby object at it. This moves beyond simple "go here, click this" interactions into a more emergent, physics-driven gameplay.
