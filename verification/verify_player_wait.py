from playwright.sync_api import sync_playwright, expect
import time

def verify_player_sprite():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 1280x720 Desktop
        page = browser.new_page(viewport={'width': 1280, 'height': 720})

        try:
            print("Navigating to app...")
            page.goto("http://localhost:5173/")

            # Wait for canvas
            print("Waiting for canvas...")
            page.wait_for_selector("canvas", timeout=30000)

            # The intro overlay is blocking the view for 12 seconds.
            # We can try to skip it by waiting, OR check if clicking helps (it says pointerEvents: none).
            # So we must wait.
            print("Waiting 13 seconds for intro to finish...")
            time.sleep(13)

            # Now take screenshot of the player.
            print("Taking screenshot...")
            page.screenshot(path="verification/player_verification_done.png")
            print("Screenshot saved to verification/player_verification_done.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state_final.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_player_sprite()
