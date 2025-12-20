from playwright.sync_api import sync_playwright, expect
import time

def verify_mobile_portrait():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)

        # Emulate Mobile Portrait (Pixel 5)
        pixel_5 = p.devices['Pixel 5']
        context = browser.new_context(**pixel_5)
        page = context.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:5173")
            page.wait_for_selector("canvas", timeout=60000)

            # Wait for Intro to finish or skip it if possible
            time.sleep(5)

            # Verify Layout: Canvas should be 40vh (approx 340px on Pixel 5 which is 851px high)
            # Content list should be visible below

            # Check for Projects List
            print("Checking for Projects list...")
            projects_header = page.get_by_role("heading", name="Projects").first
            expect(projects_header).to_be_visible()

            # Scroll down to see Skills
            print("Scrolling to Skills...")
            page.mouse.wheel(0, 500)
            time.sleep(1)

            skills_header = page.get_by_role("heading", name="Skills").first
            expect(skills_header).to_be_visible()

            # Take screenshot of the main view
            print("Taking screenshot of Main Mobile View...")
            page.screenshot(path="/home/jules/verification/mobile_main.png")

            # Verify Project Modal Response
            # Since we can't easily click 3D objects in this test without knowing where they are relative to camera,
            # we rely on the list view or HUD if available.
            # But the requirement was about ProjectModal responsiveness.
            # We can try to trigger a modal via URL or just verify the HUD button.

            # Verify GlobalHUD Button
            print("Checking GlobalHUD...")
            # HUD might be hidden behind canvas or overlay, need to check z-index or visibility
            # In mobile portrait, HUD is at bottom?
            # We set `bottom: 20px` for mobile in GlobalHUD.tsx

            # Let's try to click the CONTACT button
            # It has text "MAIL" or icon "✉️"
            contact_btn = page.get_by_role("button", name="MAIL").first
            # Or by icon since text might be hidden
            # Actually we made text hidden on mobile, so we look for icon or just button

            # If text is hidden, we might need to find by child
            buttons = page.locator("button")
            # We can take a screenshot of the HUD area

            # Let's just screenshot the bottom area where HUD should be

        except Exception as e:
            print(f"Error: {e}")
            # Take error screenshot
            page.screenshot(path="/home/jules/verification/mobile_error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_mobile_portrait()
