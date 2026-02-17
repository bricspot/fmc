import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000/index.html", wait_until="commit", timeout=10000)

        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass

        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:3000/index.html
        await page.goto("http://localhost:3000/index.html", wait_until="commit", timeout=10000)
        
        # -> Open the appointment form by clicking the 'Make Appointment' button so the form fields become available for filling.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=html/body/header/div/a[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Fill all required appointment fields with valid data and scroll to reveal the Submit button so it can be clicked in the next step.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[3]/div[1]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('2026-02-05')
        
        # -> Fill all required personal fields (Full Name, Phone, Email, ID/Passport, Reason), click the consent checkbox, then scroll down to reveal the Submit button so it can be clicked next.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[5]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('John Doe')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[6]/div[1]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('+254712345678')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[6]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('johndoe@example.com')
        
        # -> Fill Date of Birth, ID/Passport and Reason fields; click the consent checkbox; click the Confirm Booking button; wait briefly and extract any submission state (e.g., 'Submitting...' or spinner) and final confirmation message. Also check whether form is reset/disabled and whether the confirmation is accessible.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[7]/div[1]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('1990-01-01')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[7]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('A12345678')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[8]/textarea').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('General consultation - routine checkup')
        
        # -> Click the consent checkbox, click the Confirm Booking button, wait briefly, then extract any submission state and the final confirmation message and check whether the form is reset/disabled and if the confirmation is accessible (aria-live or focus).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[15]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    