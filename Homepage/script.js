// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const t = document.querySelector(a.getAttribute('href'));
        t?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// Scroll animations using Intersection Observer
const obs = new IntersectionObserver(e => {
    e.forEach(i => {
        if (i.isIntersecting) {
            i.target.style.opacity = '1';
            i.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

// Initialize animations on page load
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.feature-item, .kitchen-text, .kitchen-image, .why-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        obs.observe(el);
    });
});

