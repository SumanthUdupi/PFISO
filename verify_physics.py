
import os
import sys
from playwright.sync_api import sync_playwright
import time

def verify_physics():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"Page Error: {exc}"))
        page.on("requestfailed", lambda req: print(f"Request Failed: {req.url} {req.failure}"))
        
        print("Loading game...")
        try:
            page.goto("http://localhost:5173", timeout=30000)
            
            time.sleep(10)
            
            if page.locator("canvas").count() > 0:
                print("Canvas detected.")
            else:
                print("Canvas NOT detected. Still on loading screen?")

            page.screenshot(path="physics_debug.png")
            
        except Exception as e:
            print(f"Test failed: {e}")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    verify_physics()
