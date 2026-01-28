import asyncio
from playwright import async_api
from playwright.async_api import expect

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
        await page.goto("http://localhost:8080/", wait_until="commit", timeout=10000)
        
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
        # -> Click on the 'Make Appointment' button to open the appointment booking form.
        frame = context.pages[-1]
        # Click on the 'Make Appointment' button to open the appointment booking form
        elem = frame.locator('xpath=html/body/header/div/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Partially fill the form leaving one or more required fields empty, e.g., fill Full Name but leave Select Service empty.
        frame = context.pages[-1]
        # Fill Full Name field with 'John Doe'
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[5]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('John Doe')
        

        frame = context.pages[-1]
        # Fill Phone Number field with a valid phone number
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[6]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('+254712345678')
        

        frame = context.pages[-1]
        # Fill Email Address field with a valid email
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[6]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('john.doe@example.com')
        

        frame = context.pages[-1]
        # Fill Date of Birth field with a valid date
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[7]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('1990-01-01')
        

        frame = context.pages[-1]
        # Fill ID/Passport Number field with a valid ID
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[7]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('A12345678')
        

        frame = context.pages[-1]
        # Fill Reason for Visit field with a valid reason
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[8]/textarea').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Routine checkup')
        

        frame = context.pages[-1]
        # Leave Preferred Date empty to test validation
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('')
        

        frame = context.pages[-1]
        # Attempt to submit the form with missing required fields
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Select Service *').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Preferred Date *').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    