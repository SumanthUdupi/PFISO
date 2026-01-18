import { test, expect } from '@playwright/test';

test('check if scene loads', async ({ page }) => {
  // Capture console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  // Go to the page
  await page.goto('http://localhost:3000/PFISO/');

  // Wait for a few seconds to let things load
  await page.waitForTimeout(5000);

  // Take a screenshot
  await page.screenshot({ path: 'verification/initial_load.png' });

  // Check if canvas exists
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
});
