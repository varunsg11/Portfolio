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
        const res = await fetch('https://portfolio-9s06.onrender.com/api/contact', {
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

// ── PRELOADER ──
const preloader = document.getElementById('preloader');
window.addEventListener('load', () => {
    setTimeout(() => preloader.classList.add('hidden'), 1500);
});

// ── SCROLL PROGRESS BAR ──
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
}, { passive: true });


// ── TYPEWRITER HERO TAGLINE ──
const typewriterEl = document.getElementById('typewriter');
const roles = [
    'Agentic AI Developer',
    'Multi-Agent Systems Engineer',
    'LLM Infrastructure Builder',
    'Full Stack Developer',
    'Claude Max Plan Enjoyer 🤌',
];
let roleIndex = 0, charIndex = 0, isDeleting = false;

function typeLoop() {
    const current = roles[roleIndex];
    if (isDeleting) {
        typewriterEl.textContent = current.slice(0, --charIndex);
    } else {
        typewriterEl.textContent = current.slice(0, ++charIndex);
    }

    let delay = isDeleting ? 40 : 70;
    if (!isDeleting && charIndex === current.length) {
        delay = 1800;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 350;
    }
    setTimeout(typeLoop, delay);
}

// start typewriter after preloader + hero fade-in delay
setTimeout(typeLoop, 2000);
