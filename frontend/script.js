// ── FADE-UP ON SCROLL ──
const fadeEls = document.querySelectorAll('.fade-up');
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => fadeObserver.observe(el));

// Trigger hero elements immediately (already in view on load)
document.querySelectorAll('.hero .fade-up').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 100 + i * 120);
});

// ── MOBILE NAV ──
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── ACTIVE NAV LINK ON SCROLL ──
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navItems.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
            });
        }
    });
}, { threshold: 0.4 });

sections.forEach(s => navObserver.observe(s));

// ── SKILL RING ANIMATION ──
const skillCards = document.querySelectorAll('.skill-card');

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        const target = Number(card.dataset.percent) || 0;
        const ringFill = card.querySelector('.ring-fill');
        const pctLabel = card.querySelector('.ring-pct');

        let current = 0;
        const step = target / 50;
        const id = setInterval(() => {
            current = Math.min(current + step, target);
            ringFill.setAttribute('stroke-dasharray', `${current.toFixed(1)},100`);
            pctLabel.textContent = Math.round(current) + '%';
            if (current >= target) clearInterval(id);
        }, 20);

        skillObserver.unobserve(card);
    });
}, { threshold: 0.3 });

skillCards.forEach(card => skillObserver.observe(card));

// ── CONTACT FORM ──
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Sending...';

    const payload = {
        name: contactForm.name.value,
        email: contactForm.email.value,
        subject: contactForm.subject.value,
        message: contactForm.message.value,
    };

    try {
        const res = await fetch('http://127.0.0.1:8000/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            formStatus.className = 'form-status success';
            formStatus.textContent = "Message sent! I'll get back to you soon.";
            contactForm.reset();
        } else {
            throw new Error('Server error');
        }
    } catch {
        formStatus.className = 'form-status error';
        formStatus.textContent = 'Something went wrong. Please email me directly at varunsg118@gmail.com';
    } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Send Message';
    }
});
