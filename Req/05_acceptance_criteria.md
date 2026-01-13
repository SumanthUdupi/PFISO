# Acceptance Criteria & QA Checklist

## 1. Visual Quality Assurance
- [ ] **Lighting:** Character does not look "flat" against the background. Shadows are visible and contact-grounded.
- [ ] **Clipping:** Camera never clips through walls during rotation or movement.
- [ ] **Text:** All text is legible against its background (Contrast ratio 4.5:1 minimum).
- [ ] **Mobile:** UI overlays do not cover essential gameplay elements (character head/body).
- [ ] **Glitch-Free:** No Z-fighting (flickering textures) on the character tie or shirt buttons at any distance.

## 2. Interaction Testing
- [ ] **Click:** Verified that clicking "Projects" opens the Projects modal 100% of the time.
- [ ] **Floor:** Clicking an empty floor spot moves the player there.
- [ ] **Cancel:** Pressing 'Escape' closes any open modal.
- [ ] **Focus:** Tab navigation cycles through interactable elements logically.

## 3. Performance Benchmarks
| Metric | Target (Desktop) | Target (Mobile High-End) | Target (Mobile Low-End) |
| :--- | :--- | :--- | :--- |
| **FPS** | 60 (capped) | 60 | 30 |
| **Draw Calls** | < 100 | < 80 | < 50 |
| **Triangles** | < 100k | < 80k | < 50k |
| **Texture Mem** | < 200MB | < 100MB | < 50MB |
| **Load Time** | < 1.0s | < 1.5s | < 3.0s |

## 4. Browser Compatibility
- [ ] **Chrome/Edge (Chromium):** Pass
- [ ] **Firefox:** Pass (Check for specific WebGL shader quirks)
- [ ] **Safari (iOS/macOS):** Pass (Critical: Check for 100vh scrolling issues and audio auto-play blocks)

## 5. Sign-off Requirements
A feature is considered "Done" when:
1.  It meets all Functional Requirements.
2.  Code is reviewed and linted (no `any` types).
3.  Works on Mobile Device (Real hardware, not just simulator).
4.  Lighthouse Accessibility Score > 90.
