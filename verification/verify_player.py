from playwright.sync_api import sync_playwright

def verify_player_sprite():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming Vite runs on 5173 by default)
        try:
            page.goto("http://localhost:5173", timeout=60000)

            # Wait for canvas to be present (indicating app loaded)
            page.wait_for_selector("canvas", timeout=30000)

            # Wait a bit for textures to load
            page.wait_for_timeout(5000)

            # Take a screenshot of the initial state (Idle)
            page.screenshot(path="verification/player_idle.png")
            print("Idle screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    verify_player_sprite()
