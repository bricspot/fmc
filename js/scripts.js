/* 
   Focus Clinical and Diagnostics Centre - Interactivity
   Enhanced with Supabase backend and modern UX
*/

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header with Scroll Class
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.style.padding = '10px 0';
                header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            } else {
                header.style.padding = '15px 0';
                header.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
            }
        });
    }

    // 2. Mobile Menu
    const initMobileMenu = () => {
        const burger = document.getElementById('mobile-menu-toggle');
        const overlay = document.getElementById('mobile-menu-overlay');
        const menu = document.getElementById('mobile-menu-sidebar');
        const closeBtn = document.getElementById('mobile-menu-close');
        const navLinks = document.querySelector('.nav-links');
        const mobileNavContent = document.querySelector('.mobile-nav-content');

        if (!burger || !menu || !overlay) return;

        if (navLinks && mobileNavContent && mobileNavContent.children.length === 0) {
            const links = navLinks.querySelectorAll('a');
            links.forEach(link => {
                const mobileLink = link.cloneNode(true);
                mobileLink.addEventListener('click', closeMenu);
                mobileNavContent.appendChild(mobileLink);
            });
        }

        function openMenu() {
            menu.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            menu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        burger.addEventListener('click', openMenu);
        if (closeBtn) closeBtn.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);

        window.addEventListener('resize', () => {
            if (window.innerWidth > 900) closeMenu();
        });
    };

    initMobileMenu();

    // 3. Testimonial Slider (for index.html)
    const testimonials = [
        {
            text: "I've been managing my diabetes at Focus Clinical for two years. The nutrition counselling and regular check-ups have significantly improved my quality of life.",
            author: "John Maina",
            role: "Kerugoya Patient",
            img: "assets/images/testimonial-1.png"
        },
        {
            text: "The ISO-accredited lab at Murang'a branch gave me accurate and fast results. Professional staff who truly care.",
            author: "Peter Kamau",
            role: "Murang'a Patient",
            img: "assets/images/testimonial-2.png"
        },
        {
            text: "Brought my newborn for CWC clinics here. The nurses are incredibly gentle and the immunisation schedule reminders are very helpful.",
            author: "Mary Wanjiku",
            role: "Embu Patient",
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
            const pEl = testCard.querySelector('.testimonial-text');
            const nameEl = testCard.querySelector('.testimonial-name');
            const roleEl = testCard.querySelector('.testimonial-role');
            const imgEl = testCard.querySelector('.testimonial-avatar');
            if (pEl) pEl.innerText = `"${t.text}"`;
            if (nameEl) nameEl.innerText = t.author;
            if (roleEl) roleEl.innerText = t.role;
            if (imgEl) imgEl.src = t.img;
            testCard.style.opacity = '1';
            testCard.style.transform = 'translateY(0)';
        }, 400);

        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    };

    if (testCard) {
        setInterval(updateTestimonial, 5000);
    }

    // ===========================================
    // 4. Appointment Form Handler (Supabase API)
    // ===========================================
    const appointmentForm = document.getElementById('appointmentForm') || document.getElementById('detailedResultForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            if (!btn) return;

            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<svg class="btn-spinner" viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.42" stroke-dashoffset="10"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></circle></svg> Please wait...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            const formData = {
                service: document.getElementById('service')?.value || '',
                branch: document.getElementById('branch')?.value || '',
                date: document.getElementById('date')?.value || '',
                time: document.getElementById('time')?.value || '',
                fullname: document.getElementById('fullname')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                email: document.getElementById('email')?.value || '',
                dob: document.getElementById('dob')?.value || '',
                reason: document.getElementById('reason')?.value || '',
                first_visit: document.getElementById('first_visit')?.checked || false,
                consent: document.getElementById('consent')?.checked || false
            };

            try {
                const response = await fetch('/api/submit-appointment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    const refId = result.id.substring(0, 8).toUpperCase();
                    const formContainer = document.querySelector('.appointment-form-container');
                    if (formContainer) {
                        formContainer.innerHTML = `
                            <div class="booking-success-card">
                                <div class="success-icon-wrap">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <h2>Booking Confirmed!</h2>
                                <p class="success-subtitle">Your appointment request has been received successfully.</p>
                                <div class="success-details">
                                    <div class="success-detail-row">
                                        <span class="detail-label"><i class="fas fa-user"></i> Patient</span>
                                        <span class="detail-value">${formData.fullname}</span>
                                    </div>
                                    <div class="success-detail-row">
                                        <span class="detail-label"><i class="fas fa-briefcase-medical"></i> Service</span>
                                        <span class="detail-value">${formData.service}</span>
                                    </div>
                                    <div class="success-detail-row">
                                        <span class="detail-label"><i class="fas fa-map-marker-alt"></i> Branch</span>
                                        <span class="detail-value">${formData.branch}</span>
                                    </div>
                                    <div class="success-detail-row">
                                        <span class="detail-label"><i class="fas fa-calendar"></i> Date</span>
                                        <span class="detail-value">${formData.date}</span>
                                    </div>
                                    <div class="success-detail-row">
                                        <span class="detail-label"><i class="fas fa-clock"></i> Time</span>
                                        <span class="detail-value">${formData.time}</span>
                                    </div>
                                    <div class="success-detail-row ref-row">
                                        <span class="detail-label"><i class="fas fa-hashtag"></i> Reference</span>
                                        <span class="detail-value ref-number">${refId}</span>
                                    </div>
                                </div>
                                <p class="success-note"><i class="fas fa-info-circle"></i> Our team will contact you within 24 hours to confirm your appointment.</p>
                                <div class="success-actions">
                                    <a href="appointment-status.html" class="btn btn-outline"><i class="fas fa-search"></i> Track Appointment</a>
                                    <a href="index.html" class="btn btn-primary"><i class="fas fa-home"></i> Back to Home</a>
                                </div>
                            </div>
                        `;
                        formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                } else {
                    if (typeof showToast === 'function') {
                        showToast(result.error || 'Something went wrong. Please try again.', 'error');
                    }
                    btn.innerHTML = originalHTML;
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }
            } catch (err) {
                console.error('Submit error:', err);
                if (typeof showToast === 'function') {
                    showToast('Network error. Please check your connection and try again.', 'error');
                }
                btn.innerHTML = originalHTML;
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        });
    }

    // ===========================================
    // 5. Contact Form Handler (Supabase API)
    // ===========================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            if (!btn) return;

            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<svg class="btn-spinner" viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.42" stroke-dashoffset="10"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></circle></svg> Sending...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            const formData = {
                name: document.getElementById('name')?.value || '',
                email: document.getElementById('email')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                subject: document.getElementById('subject')?.value || '',
                message: document.getElementById('message')?.value || ''
            };

            try {
                const response = await fetch('/api/submit-contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    showToast('Message sent! We\'ll get back to you soon.', 'success');
                    contactForm.reset();
                } else {
                    showToast(result.error || 'Could not send message. Please try again.', 'error');
                }
            } catch (err) {
                console.error('Submit error:', err);
                showToast('Network error. Please check your connection and try again.', 'error');
            } finally {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        });
    }

    // ===========================================
    // 6. Newsletter Form Handler (Supabase API)
    // ===========================================
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const emailInput = form.querySelector('input[type="email"]');
            if (!btn || !emailInput) return;

            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<svg class="btn-spinner" viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.42" stroke-dashoffset="10"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></circle></svg>';
            btn.disabled = true;

            try {
                const response = await fetch('/api/subscribe-newsletter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailInput.value })
                });

                const result = await response.json();

                if (result.success) {
                    showToast(result.message, 'success');
                    emailInput.value = '';
                } else {
                    showToast(result.error || 'Could not subscribe. Please try again.', 'error');
                }
            } catch (err) {
                showToast('Network error. Please try again.', 'error');
            } finally {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }
        });
    });

    // ===========================================
    // 7. Scroll Animations
    // ===========================================
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
