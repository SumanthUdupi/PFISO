from playwright.sync_api import sync_playwright

def verify_mobile_simulation():
    with sync_playwright() as p:
        # Simulate an iPhone 12 Pro
        iphone_12 = p.devices['iPhone 12 Pro']
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(**iphone_12)
        page = context.new_page()

        # Assuming Vite runs on port 5173
        page.goto("http://localhost:5173")

        # Wait for canvas to load
        page.wait_for_selector("canvas", timeout=30000)

        # Wait a bit for initial render
        page.wait_for_timeout(5000)

        # Take screenshot of initial state (should see mobile view, zoomed in)
        page.screenshot(path="verification/mobile_view.png")

        # Test clicking on floor (approximate center)
        # page.mouse.click(195, 422) # Center of iPhone 12 Pro (390x844)

        # Wait for movement
        # page.wait_for_timeout(2000)
        # page.screenshot(path="verification/mobile_moved.png")

        browser.close()

if __name__ == "__main__":
    verify_mobile_simulation()
