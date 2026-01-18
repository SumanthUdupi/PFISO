from playwright.sync_api import sync_playwright

def verify_images(page):
    print("Navigating to page...")

    # Capture requests
    requests = []
    page.on("request", lambda r: requests.append(r))

    response = page.goto("http://localhost:5173/PFISO/")
    print(f"Page load status: {response.status}")

    # Wait for page to settle
    page.wait_for_timeout(10000)

    # Check for hero.webp requests
    hero_requests = [r for r in requests if "hero.webp" in r.url]
    print(f"Found {len(hero_requests)} requests for hero.webp")
    for r in hero_requests:
        response = r.response()
        status = response.status if response else "No Response"
        print(f"Request: {r.url} - Status: {status}")

    print("Clicking Projects button...")
    try:
        # Try finding by text matching partially
        page.get_by_role("button", name="▲ Projects").click()
    except Exception as e:
        print(f"Click failed: {e}")

    page.wait_for_timeout(2000)

    page.screenshot(path="verification/verification.png")
    print("Screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport
        context = browser.new_context(viewport={"width": 375, "height": 667})
        page = context.new_page()

        # Listen for console errors
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("requestfailed", lambda request: print(f"FAILED: {request.url} {request.failure}"))

        try:
            verify_images(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
