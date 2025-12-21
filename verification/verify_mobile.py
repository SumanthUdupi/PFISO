from playwright.sync_api import sync_playwright

def verify_mobile_view():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch()

        # Emulate a mobile device (iPhone 12)
        iphone_12 = p.devices['iPhone 12']
        context = browser.new_context(**iphone_12)
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173")

        # Wait for loading to finish (simple wait for now, or wait for specific element)
        page.wait_for_timeout(5000)

        print("Taking initial mobile screenshot...")
        page.screenshot(path="verification/mobile_initial.png")

        # Verify Mobile Controls are present
        print("Verifying joystick...")
        joystick = page.locator("div[style*='border-radius: 50%']").first
        if joystick.is_visible():
            print("Joystick is visible.")
        else:
            print("Joystick NOT visible.")

        # Verify Projects Section Collapsed/Expanded
        print("Verifying Project Section Toggle...")
        toggle_btn = page.locator("button", has_text="Projects") # It says "▲ Projects" initially if closed, or "Minimize" if open.
        # Initial state should be collapsed or expanded?
        # My code:
        # isProjectSectionOpen default is false.
        # Button text: isProjectSectionOpen ? '▼ Minimize' : '▲ Projects'
        # So initially it says "▲ Projects".

        if page.get_by_text("▲ Projects").is_visible():
             print("Project section is collapsed (Correct).")
        else:
             print("Project section state unexpected.")

        # Click to expand
        page.get_by_text("▲ Projects").click()
        page.wait_for_timeout(1000)

        print("Taking screenshot after expand...")
        page.screenshot(path="verification/mobile_expanded.png")

        if page.get_by_text("▼ Minimize").is_visible():
             print("Project section expanded (Correct).")

        # Verify Skill Icons (Flattened)
        # Check for skill cards
        skill_cards = page.locator(".skill-card")
        count = skill_cards.count()
        print(f"Found {count} skill cards.")

        browser.close()

if __name__ == "__main__":
    verify_mobile_view()
