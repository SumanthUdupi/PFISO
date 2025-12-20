from playwright.sync_api import sync_playwright

def verify_intro_and_modals():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate desktop to see full overlay
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:5173")

            # 1. Wait for ANY text from name
            print("Waiting for Name...")
            # Use regex to match partial text or ensure it exists
            # The Typewriter effect might be slow or split
            # Let's wait for a longer time and capture a screenshot if it fails
            try:
                page.wait_for_selector("text=Sumanth", timeout=15000)
                print("Name detected.")
            except Exception:
                print("Name NOT detected in time. Capturing state.")
                page.screenshot(path="verification/failed_name.png")
                # Continue anyway to see what's there

            page.screenshot(path="verification/1_intro_state.png")

            # Wait for Intro Overlay to disappear? Or just check contents.
            # Let's wait for the "Bridging" text
            try:
                page.wait_for_selector("text=Bridging", timeout=15000)
                print("Headline detected.")
            except:
                print("Headline NOT detected.")

            page.screenshot(path="verification/2_headline_state.png")

            # Wait until intro completes (timeout in IntroOverlay is 12s)
            print("Waiting for intro completion...")
            page.wait_for_timeout(13000)

            # Take screenshot of lobby
            page.screenshot(path="verification/3_lobby.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    verify_intro_and_modals()
