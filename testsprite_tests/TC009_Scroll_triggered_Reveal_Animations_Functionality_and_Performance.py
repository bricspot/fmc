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
        # -> Start scrolling slowly down the page to observe scroll-triggered animations.
        await page.mouse.wheel(0, 300)
        

        # -> Continue slow scrolling down the page to observe more scroll-triggered animations and check for layout shifts or performance degradation.
        await page.mouse.wheel(0, 400)
        

        # -> Scroll further down the page slowly to continue observing scroll-triggered animations and check for layout shifts or performance issues.
        await page.mouse.wheel(0, 500)
        

        # -> Continue slow scrolling down the page to observe more scroll-triggered animations and confirm no layout shifts or performance degradation.
        await page.mouse.wheel(0, 500)
        

        # -> Continue slow scrolling down the page to observe more scroll-triggered animations and confirm no layout shifts or performance degradation.
        await page.mouse.wheel(0, 500)
        

        # -> Continue slow scrolling down the page to observe more scroll-triggered animations and confirm no layout shifts or performance degradation.
        await page.mouse.wheel(0, 500)
        

        # -> Continue slow scrolling down the page to observe more scroll-triggered animations and confirm no layout shifts or performance degradation.
        await page.mouse.wheel(0, 500)
        

        # -> Continue slow scrolling down the page to observe remaining scroll-triggered animations and confirm no layout shifts or performance degradation.
        await page.mouse.wheel(0, 500)
        

        # -> Continue slow scrolling down the page to observe remaining scroll-triggered animations and confirm no layout shifts or performance degradation.
        await page.mouse.wheel(0, 500)
        

        # -> Continue slow scrolling down the page to observe remaining scroll-triggered animations and confirm no layout shifts or performance degradation.
        await page.mouse.wheel(0, 500)
        

        # -> Complete final slow scrolls to the bottom of the page to confirm no layout shifts or performance degradation on footer and final elements.
        await page.mouse.wheel(0, 300)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=TRUSTED HEALTHCARE PARTNER').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=City-Grade Healthcare, Right in Your Community.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Focus Clinical and Diagnostics Centre Ltd delivers integrated, premium healthcare featuring modern diagnostics and experienced clinicians for families in Kenya.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Our Services').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=WHY CHOOSE US').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Caring for Your Community').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Expert Doctors').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Highly trained clinicians dedicated to providing personalized care for every patient.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Modern Labs').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Advanced diagnostic facilities for accurate and timely medical results.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=24/7 Support').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Always ready to serve you with emergency care and round-the-clock assistance.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=MEDICAL DEPARTMENTS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Our Specialist Services').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Maternal & Child Health').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Antenatal care, child immunization, and growth monitoring for a healthy start.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Outpatient Care').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=General consultations and emergency visits available round the clock.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Advanced Diagnostics').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=High-end ultrasound, laboratory testing, and molecular biology.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Pharmacy Services').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Fully stocked retail pharmacy with dedicated clinical pharmacist support.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Family Planning').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Range of family planning methods tailored to your lifestyle and choice.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Specialized Care').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Nutrition counselling, mental health, dental and optical services.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=FIND US').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Our Branches').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Murang’a Branch').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=United Plaza, Murang’a Town. Our flagship centre providing full diagnostic and outpatient services.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Kerugoya Branch').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Near Family Bank, specializing in advanced high-definition ultrasound diagnostics.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Embu Branch').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Centrally located in Embu Town, offering quick consultations and pharmacy support.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Ishiara Branch').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Serving the Ishiara market area with essential outpatient and child health clinics.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=BOOK APPOINTMENT').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Get Expert Care in 3 Simple Steps').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Reserved your spot at any of our branches in Murang'a, Embu, Ishiara, or Kerugoya.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=01').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Select Your Service').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Choose from our wide range of clinical and diagnostic services.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=02').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Pick a Location').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Find the branch nearest to you for maximum convenience.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=03').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Confirm Booking').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Provide your details and we'll confirm your visit within 24 hours.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Start Your Booking Now').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=TESTIMONIALS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=What Our Patients Say').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text="The staff at Focus Clinical are incredibly professional. I got my lab results the same day and the consultation was thorough. Highly recommended for families."').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=John Maina').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Kerugoya Patient').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Subscribe to Our Newsletter').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Stay updated with health tips and branch updates.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Providing integrated healthcare and modern diagnostic services across Central Kenya. Trusted by families for over a decade.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Quick Links').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Home').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=About').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Services').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Locations').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Contact').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=United Plaza, Murang’a').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=+254 7XX XXX XXX').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=info@focusclinical.co.ke').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=© 2026 Focus Clinical and Diagnostics Centre Ltd. All Rights Reserved. | Designed with care for your health.').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    