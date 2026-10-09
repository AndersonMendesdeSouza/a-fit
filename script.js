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
        if (!isOpen) {
            navMenu.querySelector('a').focus();
        }
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

    document.addEventListener('focusin', event => {
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

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        const target = document.getElementById(link.hash.slice(1));
        if (!target) {
            return;
        }

        link.addEventListener('click', event => {
            const modifiedClick = event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;
            if (event.defaultPrevented || event.button !== 0 || modifiedClick) {
                return;
            }
            if (link.target && link.target !== '_self') {
                return;
            }

            event.preventDefault();
            setMenuOpen(false);

            // Start after the mobile menu releases the page's scroll lock.
            requestAnimationFrame(() => {
                const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 24);

                if (window.location.hash !== link.hash) {
                    window.history.pushState(null, '', link.hash);
                }

                if (!target.hasAttribute('tabindex')) {
                    target.setAttribute('tabindex', '-1');
                    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
                }
                target.focus({ preventScroll: true });

                window.scrollTo({
                    top,
                    behavior: reducedMotion.matches ? 'instant' : 'smooth'
                });
            });
        });
    });

    document.querySelectorAll('.facilities-carousel, .results-carousel').forEach(carousel => {
        const carouselTrack = carousel.querySelector('.carousel-track');
        const carouselSlides = Array.from(carouselTrack.children);
        const carouselDots = carousel.querySelector('.carousel-dots');
        const carouselCounter = carousel.querySelector('.carousel-counter');
        const previousPageBtn = carousel.querySelector('.carousel-prev');
        const nextPageBtn = carousel.querySelector('.carousel-next');
        const isResults = carousel.classList.contains('results-carousel');
        let slidesPerView = 1;
        let currentPage = 0;
        let pageButtons = [];

        function getPageOffset(index) {
            const firstSlide = carouselSlides[index * slidesPerView];
            return firstSlide.offsetLeft - carouselSlides[0].offsetLeft;
        }

        function goToPage(index, behavior = reducedMotion.matches ? 'instant' : 'smooth') {
            const pageIndex = Math.max(0, Math.min(index, pageButtons.length - 1));
            carouselTrack.scrollTo({
                left: getPageOffset(pageIndex),
                behavior
            });
        }

        function updateCarousel() {
            const pageWidth = pageButtons.length > 1 ? getPageOffset(1) : carouselTrack.clientWidth;
            currentPage = Math.max(0, Math.min(Math.round(carouselTrack.scrollLeft / pageWidth), pageButtons.length - 1));
            previousPageBtn.disabled = currentPage === 0;
            nextPageBtn.disabled = currentPage === pageButtons.length - 1;
            carouselCounter.textContent = `${String(currentPage + 1).padStart(2, '0')} / ${String(pageButtons.length).padStart(2, '0')}`;

            const firstVisibleSlide = currentPage * slidesPerView;
            carouselSlides.forEach((slide, index) => {
                slide.inert = index < firstVisibleSlide || index >= firstVisibleSlide + slidesPerView;
            });
            pageButtons.forEach((button, index) => {
                button.setAttribute('aria-current', String(index === currentPage));
            });
        }

        function updateLayout() {
            const firstVisibleSlide = currentPage * slidesPerView;
            slidesPerView = Number.parseInt(getComputedStyle(carouselTrack).getPropertyValue('--slides-per-view'), 10) || 1;
            const pageCount = Math.ceil(carouselSlides.length / slidesPerView);

            if (pageButtons.length !== pageCount) {
                carouselDots.replaceChildren();
                pageButtons = Array.from({ length: pageCount }, (_, index) => {
                    const button = document.createElement('button');
                    const firstResult = index * slidesPerView + 1;
                    const lastResult = Math.min(firstResult + slidesPerView - 1, carouselSlides.length);
                    let label = `Ver foto ${index + 1}`;
                    if (isResults) {
                        label = slidesPerView === 1 ? `Ver resultado ${firstResult}` : `Ver resultados ${firstResult} a ${lastResult}`;
                    }
                    button.type = 'button';
                    button.className = 'carousel-dot';
                    button.setAttribute('aria-label', label);
                    button.setAttribute('title', label);
                    button.setAttribute('aria-controls', carouselTrack.id);
                    button.addEventListener('click', () => goToPage(index));
                    carouselDots.append(button);
                    return button;
                });
            }

            currentPage = Math.min(Math.floor(firstVisibleSlide / slidesPerView), pageCount - 1);
            goToPage(currentPage, 'instant');
            updateCarousel();
        }

        previousPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
        nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
        carouselTrack.addEventListener('scroll', updateCarousel, { passive: true });
        carouselTrack.addEventListener('keydown', event => {
            if (event.target !== carouselTrack) {
                return;
            }

            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                goToPage(currentPage + (event.key === 'ArrowRight' ? 1 : -1));
            }

            if (event.key === 'Home' || event.key === 'End') {
                event.preventDefault();
                goToPage(event.key === 'Home' ? 0 : pageButtons.length - 1);
            }
        });

        updateLayout();
        const resizeObserver = new ResizeObserver(updateLayout);
        resizeObserver.observe(carouselTrack);
        carousel.querySelector('.carousel-controls').hidden = false;
    });

    if (!reducedMotion.matches && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('is-pending');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        const revealElements = document.querySelectorAll(`
            .about-text, .about-image, .section-header, .training-text,
            .training-photo, .facilities-carousel, .results-carousel,
            .schedule-text, .schedule-card,
            .product-card, .plan-card, .cta-content
        `);

        revealElements.forEach(element => {
            element.classList.add('reveal');
            if (element.getBoundingClientRect().top >= window.innerHeight) {
                element.classList.add('is-pending');
            }
            observer.observe(element);
        });
    }
});
