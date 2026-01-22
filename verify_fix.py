from playwright.sync_api import sync_playwright
import time

def verify(page):
    # Listen to console
    page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

    print("Navigating to app...")
    page.goto("http://localhost:5173/")

    # Wait for loading to finish (Coffee cup)
    print("Waiting for loading...")

    # Wait up to 20 seconds
    time.sleep(20)

    print("Taking screenshot...")
    page.screenshot(path="verification/fix_verification_2.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        # Enable WebGL software rendering if possible
        browser = p.chromium.launch(headless=True, args=['--use-gl=swiftshader', '--enable-webgl'])
        page = browser.new_page()
        try:
            verify(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_verification_2.png")
        finally:
            browser.close()
