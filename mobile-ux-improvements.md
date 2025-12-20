# Mobile UX Audit & Improvement Plan

## Executive Summary

### Current State Assessment
- **Overall Mobile Experience Rating**: 6/10
- **Critical Issues Found**: 3
- **High Priority Issues**: 4
- **Medium Priority Issues**: 5
- **Estimated Implementation Time**: ~1 Day

### Key Problems Identified
1. **Accessibility Block:** User zooming is explicitly disabled.
2. **Rigid Layout:** `App.tsx` uses hardcoded inline styles for a strict 40/60 split, making adjustments difficult and brittle.
3. **Small Text:** Body text defaults to 14px in the portrait view, which is below the recommended 16px for readability.
4. **Touch Areas:** While button *dimensions* are 48px, their placement in the HUD can feel crowded on smaller screens.

### Success Metrics (Target Improvements)
- Mobile Lighthouse Score: Current (Unknown) → Target: 90+
- Accessibility: Fix zoom blocking.
- Readability: All body text ≥ 16px.
- Maintainability: Move inline styles to CSS classes.

---

## Detailed Audit Findings

### Category A: Layout & Visual Issues

#### ISSUE-001: Viewport Zoom Disabled
**Severity**: 🔴 Critical
**Location**: `index.html`
**Current State**:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```
**Problem Description**: Disabling zoom (`user-scalable=no`) is a major accessibility violation. Users with visual impairments cannot zoom in to see details.
**Proposed Solution**:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
```

#### ISSUE-002: Rigid Split-Screen Implementation
**Severity**: 🟡 High
**Location**: `src/App.tsx`
**Current State**:
The portrait layout is controlled via inline styles:
```javascript
height: isPortraitMobile ? '40vh' : '100vh' // Canvas
height: '60vh' // Content List
```
**Problem Description**: Hardcoding `vh` units in JS inline styles prevents browser chrome (address bar) adjustments from working smoothly (`dvh` is better) and makes it hard to adjust with CSS media queries.
**Proposed Solution**: Refactor to CSS classes (e.g., `.canvas-container`, `.mobile-content`) and use CSS media queries to control layout. Use `dvh` (dynamic viewport height).

### Category B: Interaction & Navigation

#### ISSUE-003: Scroll Behavior in Content Area
**Severity**: 🟡 High
**Location**: `src/App.tsx` (Content List)
**Current State**:
```javascript
overflowY: 'auto',
touchAction: 'none' // global body
```
**Problem Description**: The global `touch-action: none` (for the game) might conflict with the `overflowY: auto` of the content list, potentially causing getting "stuck" or weird scroll physics on some devices.
**Proposed Solution**: Ensure `touch-action: pan-y` is explicitly allowed on the scrollable content container.

#### ISSUE-004: Global HUD Position
**Severity**: 🟢 Medium
**Location**: `src/components/ui/GlobalHUD.tsx`
**Current State**:
Fixed `top: 20px, right: 20px`.
**Problem Description**: On iPhones with Dynamic Island or notches, `top: 20px` might be too close to the status bar or rounded corners.
**Proposed Solution**: Use `safe-area-inset-top` and slightly increase padding.

### Category C: Typography & Content

#### ISSUE-005: Small Body Text
**Severity**: 🟡 High
**Location**: `src/App.tsx`
**Current State**: `fontSize: '14px'` for project descriptions.
**Problem Description**: 14px is often too small for comfortable reading on mobile, especially with the high contrast dark mode.
**Proposed Solution**: Increase to `16px` (`1rem`).

---

## Implementation Plan

### Phase 1: Critical Fixes (P0) - Day 1
**Goal**: Fix accessibility and core layout mechanics.
- [ ] **ISSUE-001**: Update `index.html` viewport meta tag.
- [ ] **ISSUE-003**: Ensure proper scroll physics (`touch-action: pan-y`) on the project list.
- [ ] **ISSUE-004**: Add Safe Area support for HUD.

### Phase 2: Refactor & Polish (P1) - Day 1
**Goal**: Move to maintainable CSS and improve readability.
- [ ] **ISSUE-002**: Extract inline styles from `App.tsx` to `App.css` (or `index.css`).
- [ ] **ISSUE-005**: Update typography to `16px` base for content.
- [ ] **Style**: Improve the "Skills" grid visual hierarchy (currently simple flex).

### Phase 3: Desktop Protection Check
- [ ] Verify `isPortraitMobile` logic ensures desktop remains EXACTLY as is.
- [ ] Test resizing window to ensure smooth transition.

---

## Desktop Protection Strategy

The current codebase uses a robust toggle:
```javascript
const { isMobile, isLandscape } = useDeviceDetect()
const isPortraitMobile = isMobile && !isLandscape
```
This logic creates a completely separate branch for the mobile styling (the additional content div).
**Strategy**:
1. We will keep this logic.
2. We will apply the new CSS classes primarily to the elements *inside* the `isPortraitMobile` block.
3. For shared elements (Canvas), we will use strict media queries + the existing prop toggles.

---

## Quality Assurance Checklist
- [ ] Zoom works on mobile.
- [ ] Scrolling the project list feels native.
- [ ] No layout broken on Desktop (verify `isMobile` is false).
- [ ] Text is readable without squinting.
- [ ] HUD is not covered by notch/status bar.
