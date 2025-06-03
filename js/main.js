// Contenido completo para js/main.js (CON AJUSTE DE SCROLL REVISADO)

// --- Header Scroll Effect ---
const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle'); 
const scrollThreshold = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-scroll-threshold')) || 50;

function handleHeaderScroll() {
    if (window.pageYOffset > scrollThreshold) {
        if (header) { 
            header.classList.remove('initial-state');
            header.classList.add('scrolled-state');
        }
    } else {
        if (header) { 
            header.classList.remove('scrolled-state');
            header.classList.add('initial-state');
        }
    }
}
window.addEventListener('scroll', handleHeaderScroll);
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

        if (slides.length === 0) return; 

        function showSlide(index) {
            if (!slides[index]) return;
            
            if (sliderSelector.includes('testimonials')) {
                 slides.forEach((slide) => {
                    slide.style.display = 'none'; 
                    slide.classList.remove(activeSlideClass);
                });
                slides[index].style.display = 'block'; 
                requestAnimationFrame(() => { 
                    slides[index].classList.add(activeSlideClass);
                });
            } else { 
                slides.forEach((slide) => {
                    slide.classList.remove(activeSlideClass);
                });
                slides[index].classList.add(activeSlideClass);
            }
            
            if (dots.length > 0 && dots[index]) {
                 dots.forEach(d => d.classList.remove(activeDotClass));
                 dots[index].classList.add(activeDotClass);
            }
            currentSlide = index;
        }

        function nextSlide() {
            let next = (currentSlide + 1) % slides.length;
            showSlide(next);
        }

        function prevSlide() {
            let prev = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prev);
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
                    showSlide(parseInt(slideIndex));
                    startAutoplay();
                });
            });
        } else if (dots.length > 0) {
            // console.warn("Slider dots count does not match slides count for:", sliderSelector);
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
        3000                                 
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
                    observer.unobserve(entry.target); 
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
});