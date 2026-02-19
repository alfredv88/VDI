// Contenido completo para js/main.js (CON AJUSTE DE SCROLL REVISADO)

// --- Header Scroll Effect con animación progresiva ---
const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const logoImg = document.querySelector('.logo img');
const minHeaderPadding = 4;
const maxHeaderPadding = 8;
const minLogoHeight = 45;
const maxLogoHeight = 80;
const scrollMax = 60; // Match --header-scroll-threshold


// Throttling function for performance
function throttle(callback, limit) {
    let waiting = false;
    return function () {
        if (!waiting) {
            callback.apply(this, arguments);
            waiting = true;
            setTimeout(function () {
                waiting = false;
            }, limit);
        }
    }
}

function handleHeaderScroll() {
    const scrollY = Math.min(window.pageYOffset, scrollMax);
    // Interpolación lineal
    const padding = maxHeaderPadding - ((maxHeaderPadding - minHeaderPadding) * (scrollY / scrollMax));
    const logoHeight = maxLogoHeight - ((maxLogoHeight - minLogoHeight) * (scrollY / scrollMax));

    if (header) {
        header.style.padding = padding + 'px 0';
    }
    if (logoImg) {
        logoImg.style.maxHeight = logoHeight + 'px';
        logoImg.style.transition = 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)';
    }
    // Cambia la clase para colores de fondo, etc.
    if (window.pageYOffset > 1) {
        header.classList.remove('initial-state');
        header.classList.add('scrolled-state');
    } else {
        header.classList.remove('scrolled-state');
        header.classList.add('initial-state');
    }
}
window.addEventListener('scroll', throttle(handleHeaderScroll, 10), { passive: true });
document.addEventListener('DOMContentLoaded', () => {
    handleHeaderScroll();

    // --- Toggle Mobile Menu ---
    if (menuToggle && header) {
        menuToggle.addEventListener('click', () => {
            header.classList.toggle('menu-open');
            const isExpanded = header.classList.contains('menu-open');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // --- Smooth Scroll for Anchor Links ---
    // AJUSTA ESTE VALOR:
    // Si la sección de destino se ve "muy alta" (cortada por el header), aumenta este valor.
    // Si hay "demasiado espacio" encima de la sección, disminuye este valor (puede ser negativo).
    const scrollFineTune = 0; // Empecemos con 10px para bajar un poco más la vista.

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            if (targetId && targetId.length > 1) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    let headerToOffsetForScroll = 0;
                    const siteHeader = document.querySelector('.site-header');

                    if (siteHeader) {
                        // Siempre calcular el offset basado en las dimensiones del header ENCOGIDO (scrolled-state)
                        // ya que esa es la altura que obstruirá la vista al llegar a la sección.
                        const scrolledPadding = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--scrolled-header-padding')) || 1;
                        const scrolledLogoHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--scrolled-logo-height')) || 70;
                        // Asumiendo 1px de borde inferior en el header encogido
                        headerToOffsetForScroll = scrolledLogoHeight + (scrolledPadding * 2) + 1;
                    }

                    // Si el destino es la sección hero (o el tope de la página), no aplicar offset.
                    if (targetId === '#hero') {
                        headerToOffsetForScroll = 0;
                    }

                    // targetElement.offsetTop es la distancia desde el tope del documento al tope del elemento destino.
                    // Restamos la altura del header para que el tope del elemento quede justo debajo del header.
                    // Sumamos scrollFineTune para bajar la vista un poco más.
                    const offsetPosition = targetElement.offsetTop - headerToOffsetForScroll + scrollFineTune;

                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

                    // Cerrar menú móvil si está abierto
                    if (header && header.classList.contains('menu-open') && menuToggle) {
                        header.classList.remove('menu-open');
                        menuToggle.setAttribute('aria-expanded', 'false');
                    }
                }
            } else if (targetId === "#" || this.pathname === window.location.pathname && this.hash === "") {
                // Manejar enlaces como <a href="#"> o <a href="index.html"> para ir al tope
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (header && header.classList.contains('menu-open') && menuToggle) {
                    header.classList.remove('menu-open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    // --- Sliders (Hero & Testimonials) ---
    function initializeSlider(sliderSelector, slidesSelector, dotsSelector, prevButtonSelector, nextButtonSelector, activeSlideClass, activeDotClass, autoplayIntervalTime) {
        const slides = document.querySelectorAll(slidesSelector);
        const dots = document.querySelectorAll(dotsSelector);
        const prevButton = prevButtonSelector ? document.querySelector(prevButtonSelector) : null;
        const nextButton = nextButtonSelector ? document.querySelector(nextButtonSelector) : null;
        let currentSlide = 0;
        let autoplayInterval;
        let lastDirection = 'right';

        if (slides.length === 0) return;

        function showSlide(index, direction = 'right') {
            if (!slides[index]) return;
            slides.forEach((slide, i) => {
                slide.classList.remove(activeSlideClass, 'slide-in-left');
                slide.style.zIndex = 1;
                slide.style.opacity = 0;
                slide.style.pointerEvents = 'none';
            });
            if (direction === 'left') {
                slides[index].classList.add('slide-in-left');
            } else {
                slides[index].classList.add(activeSlideClass);
            }
            slides[index].style.zIndex = 2;
            slides[index].style.opacity = 1;
            slides[index].style.pointerEvents = 'auto';

            // --- Control de Videos en el Slider ---
            // Solo reproducir el video de la diapositiva activa y pausar los demás
            slides.forEach((slide, i) => {
                const video = slide.querySelector('video');
                if (video) {
                    if (i === index) {
                        // Reproducir con manejo de promesa para evitar errores de interrupción
                        video.play().catch(() => { /* Silenciar error de reproducción interrumpida */ });
                    } else {
                        video.pause();
                    }
                }
            });

            // Eliminar la clase de animación después de la animación
            setTimeout(() => {
                slides[index].classList.remove('slide-in-left');
            }, 800);
            if (dots.length > 0 && dots[index]) {
                dots.forEach(d => d.classList.remove(activeDotClass));
                dots[index].classList.add(activeDotClass);
            }
            currentSlide = index;

            // Swap hero text if this is the hero slider
            const heroTitle = document.querySelector('.hero-title-main');
            const heroSubtitle = document.querySelector('.hero-subtitle');
            const activeSlide = slides[index];
            if (heroTitle && heroSubtitle && activeSlide.dataset.title) {
                heroTitle.style.opacity = '0';
                heroSubtitle.style.opacity = '0';
                setTimeout(() => {
                    heroTitle.innerHTML = activeSlide.dataset.title;
                    heroSubtitle.innerHTML = activeSlide.dataset.subtitle || '';
                    heroTitle.style.opacity = '1';
                    heroSubtitle.style.opacity = '1';
                }, 350);
            }
        }

        function nextSlide() {
            let next = (currentSlide + 1) % slides.length;
            showSlide(next, 'right');
            lastDirection = 'right';
        }

        function prevSlide() {
            let prev = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prev, 'left');
            lastDirection = 'left';
        }

        function startAutoplay() {
            if (!autoplayIntervalTime) return;
            stopAutoplay();
            autoplayInterval = setInterval(nextSlide, autoplayIntervalTime);
        }

        function stopAutoplay() {
            if (!autoplayIntervalTime) return;
            clearInterval(autoplayInterval);
        }

        if (dots.length > 0 && dots.length === slides.length) {
            dots.forEach((dot, index) => {
                const slideIndex = dot.dataset.slideIndex || dot.dataset.testimonialIndex || index;
                dot.addEventListener('click', () => {
                    if (parseInt(slideIndex) > currentSlide) {
                        showSlide(parseInt(slideIndex), 'right');
                        lastDirection = 'right';
                    } else if (parseInt(slideIndex) < currentSlide) {
                        showSlide(parseInt(slideIndex), 'left');
                        lastDirection = 'left';
                    }
                    startAutoplay();
                });
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                prevSlide();
                startAutoplay();
            });
        }
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                nextSlide();
                startAutoplay();
            });
        }
        showSlide(0);
        startAutoplay();
    }

    initializeSlider(
        '.hero-section',
        '.hero-section .hero-slide',
        '.hero-section .hero-dots .dot',
        null,
        null,
        'active-slide',
        'active-dot',
        5000                                 // Cambiado a 5 segundos
    );

    initializeSlider(
        '.testimonials-slider-wrapper',
        '.testimonials-slider .testimonial-slide',
        '.testimonial-dots-container .dot',
        '.testimonial-nav.prev',
        '.testimonial-nav.next',
        'active-testimonial',
        'active-dot',
        5000
    );

    // --- Scroll Animations ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (typeof IntersectionObserver !== 'undefined') {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');

                    // --- Manejo Inteligente de Videos Pesados ---
                    const lazyVideo = entry.target.querySelector('video.divider-video');
                    if (lazyVideo) {
                        lazyVideo.play().catch(() => { });
                    } else {
                        // Si no es un video, dejar de observar para ahorrar recursos y que la animación sea permanente
                        observer.unobserve(entry.target);
                    }
                } else {
                    // Pausar video si sale de la vista para ahorrar recursos
                    const lazyVideo = entry.target.querySelector('video.divider-video');
                    if (lazyVideo) {
                        lazyVideo.pause();
                    }
                }
            });
        }, {
            threshold: 0.1
        });

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    } else {
        animatedElements.forEach(el => {
            el.classList.add('is-visible');
        });
    }

    // --- Back to Top con Progreso ---
    const progressWrap = document.querySelector('.progress-wrap');
    const path = document.querySelector('.progress-wrap path');

    if (progressWrap && path) {
        const pathLength = path.getTotalLength();
        path.style.transition = path.style.WebkitTransition = 'none';
        path.style.strokeDasharray = pathLength + ' ' + pathLength;
        path.style.strokeDashoffset = pathLength;
        path.getBoundingClientRect();
        path.style.transition = path.style.WebkitTransition = 'stroke-dashoffset 10ms linear';

        const updateProgress = function () {
            const scroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = pathLength - (scroll * pathLength / height);
            path.style.strokeDashoffset = progress;

            // Mostrar después de 50px de scroll
            if (scroll > 50) {
                progressWrap.classList.add('active-progress');
            } else {
                progressWrap.classList.remove('active-progress');
            }
        };

        window.addEventListener('scroll', throttle(updateProgress, 10), { passive: true });

        progressWrap.addEventListener('click', function (event) {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        updateProgress();
    }

    // --- Active Link Highlighting (ScrollSpy & Multi-page) ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.main-navigation a');

    function highlightNavItems() {
        const scrollY = window.pageYOffset;
        let headerHeight = header ? header.offsetHeight : 0;
        let currentSectionId = '';

        // 1. Determinar qué sección está en vista (para anclas internas)
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - (headerHeight + 120);
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSectionId = current.getAttribute('id');
            }
        });

        // Caso especial para el Hero/Top
        if (scrollY < 150) currentSectionId = 'hero';

        // 2. Obtener el nombre de la página actual
        const path = window.location.pathname;
        const currentPage = path.split('/').pop() || 'index.html';

        // 3. Aplicar clases active de forma inteligente
        navLinks.forEach(link => {
            const href = link.getAttribute('href');

            if (href.startsWith('#')) {
                // Si es un ancla (Inicio, Nosotros, Contacto en la landing)
                link.classList.toggle('active', href === '#' + currentSectionId);
            } else {
                // Si es un link a otra página (Servicios.html, Clientes-socios.html)
                // Se activa si el href coincide con la página actual
                const isMatch = href === currentPage ||
                    (currentPage === 'index.html' && (href === '' || href === 'index.html'));
                link.classList.toggle('active', isMatch);
            }
        });
    }

    window.addEventListener('scroll', throttle(highlightNavItems, 100), { passive: true });
    highlightNavItems(); // Run once to set initial state
});