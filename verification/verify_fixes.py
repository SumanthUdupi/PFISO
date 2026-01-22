from playwright.sync_api import sync_playwright, expect
import time

def verify_fixes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (dev mode uses root)
        page.goto("http://localhost:5173/")

        # Monitor console
        page.on("console", lambda msg: print(f"CONSOLE: {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        # Wait for the canvas to be visible (game loaded)
        try:
            page.wait_for_selector("canvas", timeout=30000)
            print("Canvas found!")
        except Exception as e:
            print(f"Error waiting for canvas: {e}")
            page.screenshot(path="verification/error_screenshot.png")
            browser.close()
            return

        # Wait a bit for initialization
        time.sleep(10)

        # Take a screenshot
        page.screenshot(path="verification/verification.png")
        print("Screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_fixes()
