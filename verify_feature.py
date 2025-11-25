from playwright.sync_api import sync_playwright
import os
import http.server
import socketserver
import threading
import time

PORT = 8000

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def run():
    # Start server in background
    daemon = threading.Thread(name='daemon_server', target=start_server)
    daemon.setDaemon(True)
    daemon.start()
    time.sleep(2) # Wait for server to start

    server_url = f"http://localhost:{PORT}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

        print(f"Loading page: {server_url}")
        page.goto(server_url)

        print("Waiting for table to load...")
        try:
            page.wait_for_selector("#matchupTable", state="visible", timeout=30000)
            print("Table loaded successfully.")

            # Click on a cell (1st row, 2nd col - usually a matchup cell)
            # Row 1 is header, Row 2 is first data row.
            # Col 1 is Name, Col 2 is first matchup.
            print("Opening detail panel...")
            page.click("#tableBody tr:nth-child(1) td:nth-child(2)")
            page.wait_for_selector("#detailPanel.active", timeout=5000)

            # Change Rarity
            if page.is_visible("#atkRaritySlider"):
                initial_stats = page.inner_text("#rarityStatsDisplay")
                print(f"Initial Stats:\n{initial_stats}")

                # Change to Legendary (4)
                print("Changing Rarity to Legendary...")
                page.fill("#atkRaritySlider", "4")
                page.evaluate("document.getElementById('atkRaritySlider').dispatchEvent(new Event('input'))")
                page.wait_for_timeout(1000)

                updated_stats = page.inner_text("#rarityStatsDisplay")
                print(f"Updated Stats:\n{updated_stats}")

                if initial_stats != updated_stats:
                    print("VERIFICATION SUCCESS: Stats updated.")
                else:
                    print("VERIFICATION FAILED: Stats did not update.")

                # Take screenshot for frontend verification
                os.makedirs("verification", exist_ok=True)
                page.screenshot(path="verification/feature_verified.png")
                print("Screenshot saved.")

            else:
                print("VERIFICATION FAILED: Sliders not found.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/debug_error.png")

        browser.close()

if __name__ == "__main__":
    run()
