
from playwright.sync_api import sync_playwright
import time

def verify_deployment():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        console_errors = []
        page.on("console", lambda msg: print(f"Console ({msg.type}): {msg.text}"))
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        try:
            url = "http://localhost:4173/PFISO/"
            print(f"Navigating to {url}...")
            page.goto(url, timeout=30000)

            # Wait for loading to potentially finish (or fail)
            time.sleep(5)

            print(f"Title: {page.title()}")

            # Check for canvas
            canvas = page.locator("canvas").first
            if canvas.is_visible():
                print("Canvas is visible")
            else:
                print("Canvas is NOT visible")

            # Check for Loading Screen
            loading_screen = page.locator("text=BREWING MORNING COFFEE") # Checking part of the text
            if loading_screen.is_visible():
                print("Loading Screen is still visible")
            else:
                print("Loading Screen is NOT visible")

            if console_errors:
                print("\n--- Page Errors ---")
                for err in console_errors:
                    print(err)

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_deployment()
