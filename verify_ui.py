from playwright.sync_api import sync_playwright, expect
import time

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            page.goto("http://localhost:5173")
            page.wait_for_selector("canvas", timeout=30000)
            time.sleep(5)

            # Click Projects label
            print("Clicking 'Projects' label...")
            # Use force=True because of potential overlay issues or pointer-events
            page.get_by_text("Projects").click(force=True)

            print("Waiting for modal...")
            expect(page.get_by_text("My Projects")).to_be_visible()

            # Wait for typewriter animation
            time.sleep(2)

            print("Taking screenshot of Modal...")
            page.screenshot(path="/home/jules/verification/modal_open.png")

        except Exception as e:
            print(f"Error: {e}")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_ui()
