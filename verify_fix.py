
from playwright.sync_api import sync_playwright
import time
import os

def verify_fix():
    os.makedirs("verification", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        console_errors = []
        page.on("console", lambda msg: print(f"Console ({msg.type}): {msg.text}"))
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        try:
            url = "http://localhost:4173/PFISO/"
            print(f"Navigating to {url}...")
            page.goto(url, timeout=60000) # Increased timeout for build/load

            # Wait for canvas to be visible
            print("Waiting for canvas...")
            page.wait_for_selector("canvas", timeout=30000)
            print("Canvas found.")

            # Wait a bit for loading screen to potentially dismiss or show error
            # We want to see if the game loads.
            # Loading screen text "Brewing morning coffee..."
            # If we wait 20s, the "Taking longer than expected" should show up IF it's stuck.
            # Or if it works, the loading screen should disappear.

            # Let's wait 5 seconds to see initial load state
            time.sleep(5)
            page.screenshot(path="verification/verification_initial.png")
            print("Initial screenshot taken.")

            # Check if loading screen is still there
            if page.locator("text=Brewing morning coffee").count() > 0 or page.locator("text=READY").count() > 0:
                print("Loading screen still visible. Waiting more...")
                time.sleep(10) # Total 15s
                page.screenshot(path="verification/verification_after_wait.png")

                # Check for error message
                if page.locator("text=Taking longer than expected").count() > 0:
                     print("Timeout message appeared!")
            else:
                print("Loading screen dismissed. Game loaded!")
                page.screenshot(path="verification/verification_game.png")

            if console_errors:
                print("\n--- Page Errors ---")
                for err in console_errors:
                    print(err)

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/verification_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_fix()
