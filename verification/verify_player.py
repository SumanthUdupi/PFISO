from playwright.sync_api import sync_playwright, expect
import time

def verify_player_sprite():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile view to check performance/layout or Desktop
        # Let's check Desktop first
        page = browser.new_page(viewport={'width': 1280, 'height': 720})

        try:
            print("Navigating to app...")
            page.goto("http://localhost:5173/")

            # Wait for canvas to load
            print("Waiting for canvas...")
            page.wait_for_selector("canvas", timeout=30000)

            # Wait a bit for assets to load and intro to finish
            # The IntroOverlay might be blocking view?
            # It usually has a "Skip" or fades out.
            # Let's wait 5 seconds.
            time.sleep(5)

            # We want to see the player.
            # The player is at [0, 0.5, 0] initially.

            # Take a screenshot of the center where the player should be
            print("Taking screenshot...")
            page.screenshot(path="verification/player_verification.png")
            print("Screenshot saved to verification/player_verification.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_player_sprite()
