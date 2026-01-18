# 03 - Content & Zoning Strategy

**Project:** Interactive 3D Portfolio Experience (PFISO)

## 1. The "Meta-Portfolio" Philosophy
Everything in the world represents a data point. The player isn't just "reading" a resume; they are "experiencing" the history and capability of the candidate.

## 2. Interaction Data Mapping

### Zone A: Reception (Introduction)
- **Object:** **Reception Computer / Tablet**.
    - **Interaction:** [Read Welcome Message].
    - **Content:** Brief bio, "How to Play", objective tracker start.
- **Object:** **Wall Plaque**.
    - **Content:** "Employee of the Month" (Humorous self-portrait).

### Zone B: Experience Hallway (Timeline)
- **Layout:** A long corridor or wall with chronological frames.
- **Object:** **Framed Photos / Certificates**.
    - **Interaction:** [Inspect].
    - **Content:** 
        - Frame 1: Education (University, Degree).
        - Frame 2: Early Career (Company A, Role).
        - Frame 3: Recent Role (Company B, Senior Role).
- **Detail:** As player walks down the hall, they literally walk through the career timeline.

### Zone C: The Lab (Projects & Skills)
- **Object:** **Main Desk Computer**.
    - **Interaction:** [Use Computer].
    - **UI:** A desktop OS simulation. Icons for different projects.
    - **Content:** Deep dives. Live demos via iframe or video previews.
- **Object:** **Whiteboard**.
    - **Interaction:** [Examine Diagram].
    - **Content:** System architecture drawing of a complex project. Shows "Architectural" skills.
- **Object:** **Server Rack / Tech Shelf**.
    - **Interaction:** [Inspect Server].
    - **Content:** "Backend Skills" (Node, AWS, SQL). Physical servers labeled with tech stacks.

### Zone D: The Lounge (About & Contact)
- **Object:** **Bookshelf**.
    - **Interaction:** [Pick up Book].
    - **Content:** "Favorite Tech Books" (Clean Code, Pragmatic Programmer) - reveals philosophy.
- **Object:** **Passport / Globe**.
    - **Interaction:** [Spin Globe].
    - **Content:** Languages spoken, willingness to relocate, travel hobbies.
- **Object:** **Business Cards**.
    - **Interaction:** [Take Card].
    - **Effect:** Downloads PDF Resume or copies Email to clipboard.

## 3. Data Structure (JSON)
Content should be decoupled from the scene logic.
- `bio.json`: Personal details, summary.
- `experience.json`: Timeline data.
- `projects.json`: Case studies, asset URLs.
- `skills.json`: Categorized skills list.

## 4. Copywriting Tone
- **In-World:** Diegetic text (post-its, screens) should be concise, punchy.
- **Modals:** Expanded text can be more traditional professional resume detailed.
