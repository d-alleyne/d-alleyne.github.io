// Theme Toggle Functionality
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = this.themeToggle.querySelector('.theme-icon');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }
    
    init() {
        // Set initial theme
        this.setTheme(this.currentTheme);
        
        // Add event listener
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
}

// Mobile Navigation
class MobileNavigation {
    constructor() {
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.init();
    }
    
    init() {
        // Toggle mobile menu
        this.navToggle.addEventListener('click', () => this.toggleMenu());
        
        // Close menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav')) {
                this.closeMenu();
            }
        });
    }
    
    toggleMenu() {
        this.navMenu.classList.toggle('active');
        this.animateHamburger();
    }
    
    closeMenu() {
        this.navMenu.classList.remove('active');
        this.resetHamburger();
    }
    
    animateHamburger() {
        const spans = this.navToggle.querySelectorAll('span');
        if (this.navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
        } else {
            this.resetHamburger();
        }
    }
    
    resetHamburger() {
        const spans = this.navToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

// Smooth Scrolling and Active Link Highlighting
class Navigation {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link, .footer-links a');
        this.sections = document.querySelectorAll('section[id]');
        
        this.init();
    }
    
    init() {
        // Add smooth scrolling to navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
        
        // Highlight active section in navigation
        window.addEventListener('scroll', () => this.highlightActiveSection());
    }
    
    highlightActiveSection() {
        const scrollY = window.pageYOffset;
        const navHeight = document.querySelector('.nav').offsetHeight;
        
        this.sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - navHeight - 50;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            
            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            }
        });
    }
}

// Form Handling
class ContactForm {
    constructor() {
        this.form = document.querySelector('.contact-form');
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.originalButtonText = this.submitButton.textContent;
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Add input validation
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const isValid = this.validateForm();
        if (!isValid) return;
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // For Formspree, we can submit directly to their endpoint
            const formData = new FormData(this.form);
            
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                this.showSuccess();
                this.form.reset();
            } else {
                const data = await response.json();
                if (data.errors) {
                    throw new Error(data.errors.map(error => error.message).join(', '));
                } else {
                    throw new Error('Form submission failed');
                }
            }
        } catch (error) {
            this.showError('Sorry, there was an error sending your message. Please try again.');
            console.error('Form submission error:', error);
        } finally {
            this.setLoadingState(false);
        }
    }
    
    validateForm() {
        const inputs = this.form.querySelectorAll('input, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Remove existing error
        this.clearFieldError(field);
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            errorMessage = 'This field is required.';
            isValid = false;
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errorMessage = 'Please enter a valid email address.';
                isValid = false;
            }
        }
        
        // Name validation (minimum 2 characters)
        if (field.name === 'name' && value && value.length < 2) {
            errorMessage = 'Name must be at least 2 characters long.';
            isValid = false;
        }
        
        // Message validation (minimum 10 characters)
        if (field.name === 'message' && value && value.length < 10) {
            errorMessage = 'Message must be at least 10 characters long.';
            isValid = false;
        }
        
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }
        
        return isValid;
    }
    
    showFieldError(field, message) {
        field.style.borderColor = '#ef4444';
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = '#ef4444';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
        errorElement.style.display = 'block';
        
        field.parentNode.appendChild(errorElement);
    }
    
    clearFieldError(field) {
        field.style.borderColor = '';
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    
    setLoadingState(loading) {
        if (loading) {
            this.submitButton.textContent = 'Sending...';
            this.submitButton.disabled = true;
            this.submitButton.style.opacity = '0.7';
        } else {
            this.submitButton.textContent = this.originalButtonText;
            this.submitButton.disabled = false;
            this.submitButton.style.opacity = '1';
        }
    }
    
    showSuccess() {
        this.showMessage('Thank you! Your message has been sent successfully. I\'ll get back to you soon.', 'success');
    }
    
    showError(message) {
        this.showMessage(message, 'error');
    }
    
    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageElement = document.createElement('div');
        messageElement.className = 'form-message';
        messageElement.textContent = message;
        
        messageElement.style.padding = '1rem';
        messageElement.style.borderRadius = '8px';
        messageElement.style.marginTop = '1rem';
        messageElement.style.fontWeight = '500';
        
        if (type === 'success') {
            messageElement.style.backgroundColor = '#dcfce7';
            messageElement.style.color = '#166534';
            messageElement.style.border = '1px solid #bbf7d0';
        } else {
            messageElement.style.backgroundColor = '#fef2f2';
            messageElement.style.color = '#dc2626';
            messageElement.style.border = '1px solid #fecaca';
        }
        
        this.form.appendChild(messageElement);
        
        // Auto-remove success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 5000);
        }
    }
}

// Intersection Observer for Animations
class AnimationObserver {
    constructor() {
        this.observer = null;
        this.init();
    }
    
    init() {
        // Only animate if user hasn't requested reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );
        
        // Observe elements that should animate on scroll
        const animatedElements = document.querySelectorAll(
            '.building-card, .link-card, .about-text, .section-title'
        );
        
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            this.observer.observe(el);
        });
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                this.observer.unobserve(entry.target);
            }
        });
    }
}

// Performance Optimization
class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Optimize images
        this.optimizeImages();
        
        // Add loading states for external resources
        this.handleExternalResources();
    }
    
    preloadCriticalResources() {
        // Preload GitHub profile image
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = 'https://github.com/d-alleyne.png';
        document.head.appendChild(link);
    }
    
    optimizeImages() {
        const profilePic = document.querySelector('.profile-pic');
        if (profilePic) {
            // Add loading state
            profilePic.style.backgroundColor = '#f3f4f6';
            
            // Handle loading and error states
            profilePic.addEventListener('load', () => {
                profilePic.style.backgroundColor = 'transparent';
            });
            
            profilePic.addEventListener('error', () => {
                profilePic.alt = 'Profile picture unavailable';
                profilePic.style.backgroundColor = '#e5e7eb';
            });
        }
    }
    
    handleExternalResources() {
        // Monitor external link performance
        const externalLinks = document.querySelectorAll('a[target="_blank"]');
        externalLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Add analytics or performance tracking here if needed
                console.log(`External link clicked: ${link.href}`);
            });
        });
    }
}

// Mobile-only Floating CTA
class MobileFloatingCTA {
    constructor() {
        this.mobileFloatingCta = document.getElementById('mobileFloatingCta');
        this.init();
    }
    
    init() {
        if (!this.mobileFloatingCta) return;
        
        // Always add event listeners, but check screen size in handlers
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());
        
        // Initial check
        this.handleScroll();
    }
    
    isMobileScreen() {
        return window.innerWidth <= 768;
    }
    
    handleScroll() {
        const scrollY = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const showThreshold = 100;
        
        // Only show on mobile screens
        if (!this.isMobileScreen()) {
            this.mobileFloatingCta.classList.remove('visible');
            return;
        }
        
        // Check if contact section is visible
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            const contactRect = contactSection.getBoundingClientRect();
            const isContactVisible = contactRect.top < windowHeight && contactRect.bottom > 0;
            
            if (isContactVisible) {
                this.mobileFloatingCta.classList.remove('visible');
                return;
            }
        }
        
        if (scrollY > showThreshold) {
            this.mobileFloatingCta.classList.add('visible');
        } else {
            this.mobileFloatingCta.classList.remove('visible');
        }
    }
    
    handleResize() {
        // Re-evaluate on resize
        this.handleScroll();
    }
}

// Initialize all modules when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize core functionality
    new ThemeManager();
    new MobileNavigation();
    new Navigation();
    new ContactForm();
    
    // Initialize enhancements
    new AnimationObserver();
    new PerformanceOptimizer();
    new MobileFloatingCTA();
    
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        // ESC key closes mobile menu
        if (e.key === 'Escape') {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        }
    });
    
    // Handle resize events for responsive behavior
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Close mobile menu on resize to larger screens
            if (window.innerWidth > 768) {
                const navMenu = document.querySelector('.nav-menu');
                navMenu.classList.remove('active');
            }
        }, 250);
    });
    
    // Add print styles support
    window.addEventListener('beforeprint', () => {
        document.body.classList.add('printing');
    });
    
    window.addEventListener('afterprint', () => {
        document.body.classList.remove('printing');
    });
});

// Service Worker registration for PWA capabilities (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment if you want to add PWA functionality later
        // navigator.serviceWorker.register('/sw.js');
    });
}

// Export for testing purposes (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ThemeManager,
        MobileNavigation,
        Navigation,
        ContactForm,
        AnimationObserver,
        PerformanceOptimizer
    };
}
