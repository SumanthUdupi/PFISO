# Bug Report: React Warning - Update During Render

**Issue ID**: ISSUE_002
**Category**: Bug
**Severity**: High
**Related Requirement**: REQ-04 (Technical Specs - Code Architecture)

## Problem Description
React triggers a warning: `Cannot update a component while rendering a different component`. This indicates a side-effect (state update) is happening during the render phase of another component, which causes unstable behavior and potential infinite loops.

## Steps to Reproduce
1. Open the application.
2. Watch the console during the initial load or transition from Loading Screen to Game.
3. Observe the warning referencing `LoadingScreen` or `EaselImage`.

## Expected Behavior
The application should render without React warnings. State updates should occur in `useEffect` or event handlers, not during render.

## Actual Behavior
Console warning: `Warning: Cannot update a component (`App`) while rendering a different component (`LoadingScreen`). To locate the bad setState() call inside `LoadingScreen`, follow the stack trace...`

## Root Cause Analysis
- `LoadingScreen` or a child component (like `EaselImage`) is likely calling a state setter (e.g., `setFinished(true)`) directly in the function body instead of wrapping it in `useEffect`.
- This often happens when checking a condition (like `progress >= 100`) and immediately setting state.

## Proposed Solution
1. **Locate State Update**: Find the `setState` call in `LoadingScreen.tsx` or `EaselImage.tsx`.
2. **Refactor**: Move the state update into a `useEffect` hook.
   ```typescript
   // Bad
   if (progress === 100) setLoaded(true);

   // Good
   useEffect(() => {
     if (progress === 100) setLoaded(true);
   }, [progress, setLoaded]);
   ```

## Files Affected
- `src/components/ui/LoadingScreen.tsx`
- `src/components/ui/EaselImage.tsx`

## Testing Verification
1. Apply the fix.
2. Reload the application.
3. Verify the warning no longer appears in the console.
