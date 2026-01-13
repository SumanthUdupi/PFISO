
const { chromium } = require('playwright');

(async () => {
    console.log("Starting Core Verification...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Log console messages
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err));

    try {
        console.log("Navigating to localhost:5173...");
        await page.goto('http://localhost:5173', { timeout: 60000 });

        console.log("Waiting for canvas...");
        await page.waitForSelector('canvas', { timeout: 60000 });
        console.log("Canvas found. Game loaded.");

        // Wait to ensure physics is ticking
        await page.waitForTimeout(3000);

        console.log("Pressing Jump...");
        await page.keyboard.press('Space');

        await page.waitForTimeout(1000);
        console.log("Survival check passed.");

    } catch (e) {
        console.error("Verification Failed:", e);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
