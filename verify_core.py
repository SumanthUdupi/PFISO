
from playwright.sync_api import sync_playwright

def verify_core():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        try:
            page.goto("http://localhost:5173", timeout=10000)
            print(f"Title: {page.title()}")
            content = page.content()
            if "canvas" in content:
                print("Canvas found in HTML source")
            else:
                print("Canvas NOT found in HTML source")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_core()
