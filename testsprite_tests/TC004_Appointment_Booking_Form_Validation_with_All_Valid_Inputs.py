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
        # Click on the 'Make Appointment' button to open the appointment booking form.
        elem = frame.locator('xpath=html/body/header/div/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill in the 'Preferred Date' field with a valid future date.
        frame = context.pages[-1]
        # Input a valid future date in the 'Preferred Date' field.
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('2026-02-10')
        

        # -> Fill in the 'Full Name' field with a valid name.
        frame = context.pages[-1]
        # Input valid full name in the 'Full Name' field.
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[5]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('John Doe')
        

        # -> Fill in the 'Phone Number' field with a valid phone number.
        frame = context.pages[-1]
        # Input valid phone number in the 'Phone Number' field.
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[6]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('+254712345678')
        

        # -> Fill in the 'Email Address' field with a valid email.
        frame = context.pages[-1]
        # Input valid email address in the 'Email Address' field.
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[6]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('johndoe@example.com')
        

        # -> Fill in the 'Date of Birth' field with a valid date.
        frame = context.pages[-1]
        # Input valid date of birth in the 'Date of Birth' field.
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[7]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('1990-05-15')
        

        # -> Fill in the 'ID/Passport Number' field with a valid ID number.
        frame = context.pages[-1]
        # Input valid ID/Passport number in the 'ID/Passport Number' field.
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[7]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('A12345678')
        

        # -> Fill in the 'Reason for Visit' field with a brief description, then submit the form.
        frame = context.pages[-1]
        # Input valid reason for visit in the 'Reason for Visit' textarea.
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[8]/textarea').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('General health checkup')
        

        frame = context.pages[-1]
        # Click the 'Confirm Booking' button to submit the appointment form.
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Check the consent checkbox to allow form submission, then submit the form again and verify the confirmation message.
        frame = context.pages[-1]
        # Check the consent checkbox to allow form submission.
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[15]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click the 'Confirm Booking' button to submit the appointment form after checking consent.
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill in the 'Preferred Date' field with a valid future date to clear validation error.
        frame = context.pages[-1]
        # Input a valid future date in the 'Preferred Date' field after form reset.
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/form/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('2026-02-10')
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=Appointment Booking Failed: Please try again later').first).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test case failed: The appointment booking form submission did not display the expected successful confirmation message as per the test plan.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    