/* 
   Focus Clinical and Diagnostics Centre - Interactivity
   Enhanced with Micare-inspired UX features
*/

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header with Scroll Class
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.padding = '10px 0';
            header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
        } else {
            header.style.padding = '15px 0';
            header.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
        }
    });

    // 2. Mobile Menu (Simple Sidebar) - Improved visibility
    const createMobileMenu = () => {
        const body = document.body;
        const burger = document.createElement('button');
        burger.className = 'mobile-burger';
        burger.id = 'mobile-menu-toggle';
        burger.setAttribute('aria-label', 'Open mobile menu');
        burger.innerHTML = '<i class="fas fa-bars"></i>';
        burger.style.cssText = `
            display: none;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--text-main);
            cursor: pointer;
            padding: 10px;
            z-index: 1000;
        `;

        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            headerActions.prepend(burger);
        }

        const overlay = document.createElement('div');
        overlay.id = 'mobile-menu-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1001;
            display: none;
            backdrop-filter: blur(5px);
        `;

        const menu = document.createElement('div');
        menu.id = 'mobile-menu-sidebar';
        menu.style.cssText = `
            position: fixed;
            top: 0; right: -300px; width: 300px; height: 100%;
            background: white;
            z-index: 1002;
            padding: 40px 20px;
            transition: all 0.4s ease;
            box-shadow: -10px 0 30px rgba(0,0,0,0.1);
        `;

        const closeBtn = document.createElement('button');
        closeBtn.id = 'mobile-menu-close';
        closeBtn.setAttribute('aria-label', 'Close mobile menu');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.style.cssText = 'position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 1.5rem; cursor: pointer;';

        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            const links = navLinks.cloneNode(true);
            links.style.display = 'flex';
            links.style.flexDirection = 'column';
            links.style.marginTop = '40px';
            links.style.gap = '20px';
            menu.appendChild(links);

            links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
        }

        menu.appendChild(closeBtn);
        body.appendChild(overlay);
        body.appendChild(menu);

        burger.addEventListener('click', () => {
            overlay.style.display = 'block';
            setTimeout(() => menu.style.right = '0', 10);
        });

        function closeMenu() {
            menu.style.right = '-300px';
            setTimeout(() => overlay.style.display = 'none', 400);
        };

        closeBtn.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);

        // Media query listener for burger visibility
        const updateBurgerVisibility = () => {
            if (window.innerWidth <= 900) {
                burger.style.display = 'block';
            } else {
                burger.style.display = 'none';
                closeMenu();
            }
        };

        window.addEventListener('resize', updateBurgerVisibility);
        updateBurgerVisibility();
    };

    createMobileMenu();

    // 3. Simple Testimonial Slider - Using reliable small images
    const testimonials = [
        {
            text: "The staff at Focus Clinical are incredibly professional. I got my lab results the same day and the consultation was thorough. Highly recommended for families.",
            author: "John Maina",
            role: "Kerugoya Patient",
            img: "assets/images/testimonial-1.png"
        },
        {
            text: "Excellent experience for my kids' immunization. The Ishiara branch is clean, well-organized, and the nurses are very gentle. Best care in the region!",
            author: "Sarah Wanjiku",
            role: "Ishiara Parent",
            img: "assets/images/testimonial-2.png"
        },
        {
            text: "I've been managing my diabetes at Focus Clinical for two years now. The nutrition counselling and regular checkups have significantly improved my health.",
            author: "Peter Kamau",
            role: "Murang'a Patient",
            img: "assets/images/testimonial-3.png"
        }
    ];

    let currentTestimonial = 0;
    const testCard = document.querySelector('.testimonial-card');

    const updateTestimonial = () => {
        if (!testCard) return;
        const t = testimonials[currentTestimonial];
        testCard.style.opacity = '0';
        testCard.style.transform = 'translateY(10px)';

        setTimeout(() => {
            testCard.querySelector('p').innerText = `"${t.text}"`;
            testCard.querySelector('h4').innerText = t.author;
            testCard.querySelector('span').innerText = t.role;
            testCard.querySelector('img').src = t.img;
            testCard.style.opacity = '1';
            testCard.style.transform = 'translateY(0)';
        }, 400);

        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    };

    if (testCard) {
        setInterval(updateTestimonial, 5000);
    }

    // 4. Appointment Form Interaction - IN-PAGE SUCCESS MESSAGE
    const appointmentForm = document.getElementById('appointmentForm') || document.getElementById('detailedResultForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            if (btn) {
                const originalText = btn.innerText;
                btn.innerText = 'Processing...';
                btn.disabled = true;

                // Collect form data
                const appointmentData = {
                    // Service Selection
                    service: document.getElementById('service')?.value || '',
                    date: document.getElementById('date')?.value || '',
                    time: document.getElementById('time')?.value || '',
                    // Patient Information
                    fullname: document.getElementById('fullname')?.value || '',
                    phone: document.getElementById('phone')?.value || '',
                    email: document.getElementById('email')?.value || '',
                    dob: document.getElementById('dob')?.value || '',
                    idNumber: document.getElementById('id_passport')?.value || '',
                    reason: document.getElementById('reason')?.value || '',
                    firstVisit: document.getElementById('first_visit')?.checked || false,
                    // Insurance Information
                    insuranceProvider: document.getElementById('insurance_provider')?.value || '',
                    policyNumber: document.getElementById('policy_number')?.value || '',
                    // Additional Info
                    notes: document.getElementById('notes')?.value || '',
                    smsReminders: document.getElementById('sms_reminders')?.checked || false,
                    // Legacy field (for homepage form if different)
                    branch: document.getElementById('branch')?.value || ''
                };

                // Save to localStorage database
                saveAppointmentToDatabase(appointmentData);

                setTimeout(() => {
                    showSuccessMessage();
                    appointmentForm.reset();
                    btn.innerText = originalText;
                    btn.disabled = false;
                }, 1500);
            }
        });
    }

    // Function to save appointment to database (localStorage)
    function saveAppointmentToDatabase(data) {
        const storageKey = 'focusAppointments';
        const appointments = JSON.parse(localStorage.getItem(storageKey) || '[]');
        data.id = Date.now().toString();
        data.createdAt = new Date().toISOString();
        data.status = 'pending';
        appointments.push(data);
        localStorage.setItem(storageKey, JSON.stringify(appointments));
    }

    // 5. Scroll Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section > .container, .service-card, .benefit-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.2, 1, 0.3, 1)';
        observer.observe(el);
    });
});

/**
 * Global Success Message Overlay
 * @param {string} title - The heading of the success card
 * @param {string} message - The detail text
 */
function showSuccessMessage(title = 'Booking Confirmed!', message = 'Thank you! Your appointment request has been received successfully.<br><br><strong style="color: #1a1a2e;">Our team will contact you within 24 hours</strong> to confirm your booking details.') {
    // Remove any existing success overlay
    const existing = document.getElementById('success-overlay');
    if (existing) existing.remove();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'success-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
        animation: fadeIn 0.3s ease;
    `;

    // Create success card
    const card = document.createElement('div');
    card.id = 'success-card';
    card.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 50px 40px;
        text-align: center;
        max-width: 450px;
        width: 90%;
        box-shadow: 0 25px 60px rgba(0,0,0,0.3);
        animation: slideUp 0.4s ease;
    `;

    card.innerHTML = `
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px;">
            <i class="fas fa-check" style="font-size: 2.5rem; color: white;"></i>
        </div>
        <h2 style="color: #1a1a2e; margin-bottom: 15px; font-size: 1.75rem;">${title}</h2>
        <p style="color: #64748b; line-height: 1.7; margin-bottom: 25px;">
            ${message}
        </p>
        <button id="close-success" style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border: none; padding: 15px 40px; border-radius: 50px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;">
            Got It!
        </button>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Add animation keyframes
    if (!document.getElementById('success-animations')) {
        const style = document.createElement('style');
        style.id = 'success-animations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    // Close on button click
    document.getElementById('close-success').addEventListener('click', () => {
        overlay.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => overlay.remove(), 300);
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.animation = 'fadeIn 0.3s ease reverse';
            setTimeout(() => overlay.remove(), 300);
        }
    });
}
