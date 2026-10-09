document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const mobileLayout = window.matchMedia('(max-width: 1100px)');

    function setMenuOpen(isOpen, restoreFocus = false) {
        navMenu.classList.toggle('active', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
        mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
        navMenu.inert = mobileLayout.matches && !isOpen;

        if (restoreFocus) {
            mobileMenuBtn.focus();
        }
    }

    setMenuOpen(false);

    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        setMenuOpen(!isOpen);
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            setMenuOpen(false);
        });
    });

    document.addEventListener('keydown', event => {
        if (mobileMenuBtn.getAttribute('aria-expanded') !== 'true') {
            return;
        }

        if (event.key === 'Escape') {
            setMenuOpen(false, true);
        }
    });

    document.addEventListener('click', event => {
        if (!event.target.closest('#header')) {
            setMenuOpen(false);
        }
    });

    mobileLayout.addEventListener('change', () => setMenuOpen(false));

    const header = document.getElementById('header');

    function updateHeader() {
        header.classList.toggle('scrolled', window.scrollY > 20);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!reducedMotion.matches && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('is-pending');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        document.querySelectorAll('.about-text, .about-image, .section-header, .structure-item, .crossfit-text, .crossfit-image, .schedule-text, .schedule-card, .result-card, .product-card, .plan-card, .cta-content').forEach(element => {
            element.classList.add('reveal');
            if (element.getBoundingClientRect().top >= window.innerHeight) {
                element.classList.add('is-pending');
            }
            observer.observe(element);
        });
    }
});
