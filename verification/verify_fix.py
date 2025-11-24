from playwright.sync_api import sync_playwright
import time

def verify_visual():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8000/index.html")

        # Wait for loading
        page.wait_for_selector("#matchupTable", state="visible", timeout=10000)

        # Open details
        page.click("#tableBody tr:first-child td:nth-child(2)")
        page.wait_for_selector("#detailPanel.active", timeout=5000)

        # Change level to 20 and Rarity to Legendary
        page.fill("#atkLevelSlider", "20")
        page.locator("#atkLevelSlider").dispatch_event("input")

        page.fill("#atkRaritySlider", "4")
        page.locator("#atkRaritySlider").dispatch_event("input")

        time.sleep(1)

        # Take screenshot of the panel
        page.locator("#detailPanel").screenshot(path="verification/screenshot.png")

        browser.close()

if __name__ == "__main__":
    verify_visual()
