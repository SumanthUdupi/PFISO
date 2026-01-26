import { chromium } from 'playwright';

async function run() {
    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    console.log('Navigating to game...');
    let connected = false;
    for (let i = 0; i < 5; i++) {
        try {
            await page.goto('http://localhost:5175', { waitUntil: 'domcontentloaded', timeout: 15000 });
            connected = true;
            console.log('Connected!');
            break;
        } catch (err) {
            console.log(`Connection attempt ${i + 1} failed: ${err.message}. Retrying...`);
            await page.waitForTimeout(2000);
        }
    }

    if (!connected) {
        console.error('Failed to connect.');
        await browser.close();
        process.exit(1);
    }

    try {
        await page.waitForTimeout(2000);

        // Check for Start button
        const startBtn = page.getByRole('button', { name: 'Start Journey' }).first();
        try {
            await startBtn.waitFor({ state: 'visible', timeout: 10000 });
            console.log('SUCCESS: Start Journey button is visible.');

            await startBtn.click({ force: true });
            console.log('Action: Clicked Start Journey.');

            // Wait for gameplay element
            // Looking at App.tsx, the canvas is in a div with class 'app-container'
            const canvas = page.locator('canvas').first();
            await canvas.waitFor({ state: 'attached', timeout: 10000 });
            console.log('SUCCESS: Canvas element found (Gameplay started).');

            // Check for HUD elements
            const hud = page.locator('.hud-container, #hud, div').filter({ hasText: /Health|HP/ }).first(); // Generic guess or specific class
            // App.tsx has <HUD />. Let's assume it renders something detectable.
            // Or check for "Project ISO" title gone?

            await page.waitForTimeout(2000);
            console.log('Gameplay running for 2 seconds...');

        } catch (err) {
            console.log('Interaction failed:', err.message);
            // Dump body to see what's there
            const body = await page.innerHTML('body');
            console.log('Body dump (truncated):', body.substring(0, 500));
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
        console.log('Inspection complete.');
    }
}

run();
