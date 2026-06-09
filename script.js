// Theme Toggle Functionality
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        
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
        field.classList.add('field-error');
        field.setAttribute('aria-invalid', 'true');

        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.id = `${field.id}-error`;
        errorElement.textContent = message;
        field.setAttribute('aria-describedby', errorElement.id);

        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.classList.remove('field-error');
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
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
        messageElement.className = `form-message form-message-${type}`;
        messageElement.textContent = message;

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
            el.style.transform = 'translateY(8px)';
            el.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
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

// Ask Damien AI Chat
class AskDamien {
    constructor() {
        this.API_URL = 'https://ask-damien.yellow-glitter-8c53.workers.dev';
        this.mode = 'ask';
        this.conversation = [];
        this.isLoading = false;
        this.maxTurns = 3;

        this.tabs = document.querySelectorAll('.ask-tab');
        this.chips = document.querySelectorAll('.ask-chip');
        this.chipsContainer = document.getElementById('askChips');
        this.inputArea = document.getElementById('askInputArea');
        this.jdArea = document.getElementById('askJdArea');
        this.input = document.getElementById('askInput');
        this.jdInput = document.getElementById('askJdInput');
        this.sendBtn = document.getElementById('askSend');
        this.jdSendBtn = document.getElementById('askJdSend');
        this.conversationEl = document.getElementById('askConversation');
        this.charCount = document.getElementById('askCharCount');
        this.jdCharCount = document.getElementById('askJdCharCount');
        this.statusEl = document.getElementById('askStatus');

        this.init();
    }

    init() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchMode(tab.dataset.mode));
        });

        this.chips.forEach(chip => {
            chip.addEventListener('click', () => this.askQuestion(chip.textContent));
        });

        this.sendBtn.addEventListener('click', () => this.submitQuestion());
        this.jdSendBtn.addEventListener('click', () => this.submitJd());

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.submitQuestion();
            }
        });

        this.input.addEventListener('input', () => this.updateCharCount(this.input, this.charCount, 2000));
        this.jdInput.addEventListener('input', () => this.updateCharCount(this.jdInput, this.jdCharCount, 5000));

    }

    switchMode(mode) {
        this.mode = mode;
        this.tabs.forEach(tab => {
            const isActive = tab.dataset.mode === mode;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
        });

        if (mode === 'ask') {
            this.inputArea.style.display = 'flex';
            this.jdArea.style.display = 'none';
            this.chipsContainer.style.display = 'flex';
        } else {
            this.inputArea.style.display = 'none';
            this.jdArea.style.display = 'block';
            this.chipsContainer.style.display = 'none';
        }
    }

    updateCharCount(inputEl, countEl, max) {
        const len = inputEl.value.length;
        if (len > max * 0.8) {
            countEl.textContent = `${len}/${max}`;
            countEl.classList.toggle('warn', len > max * 0.95);
        } else {
            countEl.textContent = '';
        }
    }

    submitQuestion() {
        const question = this.input.value.trim();
        if (!question || this.isLoading) return;
        this.input.value = '';
        this.charCount.textContent = '';
        this.askQuestion(question);
    }

    submitJd() {
        const jd = this.jdInput.value.trim();
        if (!jd || this.isLoading) return;
        this.askQuestion(jd, true);
    }

    async askQuestion(question, isJd = false) {
        if (this.isLoading) return;
        this.isLoading = true;
        this.setButtonsDisabled(true);

        this.addMessage('user', isJd ? 'Analyze this job description for fit:' : question);
        this.showTypingIndicator();

        const history = this.conversation.slice(-this.maxTurns * 2);

        try {
            await this.askWorker(question, isJd, history);
        } catch (err) {
            this.removeTypingIndicator();
            if (err.name === 'AbortError') {
                this.addMessage('error', 'Response timed out. Try a simpler question.');
            } else {
                this.addMessage('error', 'This feature is temporarily unavailable. Please try again later.');
            }
        } finally {
            this.isLoading = false;
            this.setButtonsDisabled(false);
            this.input.focus();
        }
    }

    async askWorker(question, isJd, history) {
        const response = await fetch(`${this.API_URL}/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: question,
                is_jd: isJd,
                history: history
            })
        });

        if (response.status === 429) {
            this.removeTypingIndicator();
            this.addMessage('error', "You've reached the question limit (10/hour). Please try again later.");
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('text/event-stream')) {
            await this.handleStream(response);
        } else {
            const data = await response.json();
            this.removeTypingIndicator();
            this.addMessage('bot', data.answer || data.message || 'No response received.');
        }
    }

    async handleStream(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let botText = '';
        let buffer = '';

        this.removeTypingIndicator();
        const msgEl = this.addMessage('bot', '');

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') break;
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.token || '';
                            if (content) {
                                botText += content;
                                msgEl.innerHTML = this.formatResponse(botText);
                                this.scrollToBottomThrottled();
                            }
                            if (parsed.error) {
                                msgEl.innerHTML = this.formatResponse(parsed.error);
                            }
                        } catch {
                            // Non-JSON chunk, skip
                        }
                    }
                }
            }
        } catch (err) {
            if (!botText) {
                msgEl.innerHTML = 'Response interrupted. Try again.';
            }
        }

        this.conversation.push({ role: 'assistant', content: botText });
    }

    addMessage(type, content) {
        const msgEl = document.createElement('div');

        if (type === 'user') {
            msgEl.className = 'ask-msg ask-msg-user';
            msgEl.textContent = content;
            this.conversation.push({ role: 'user', content: content });
        } else if (type === 'bot') {
            msgEl.className = 'ask-msg ask-msg-bot';
            msgEl.innerHTML = content ? this.formatResponse(content) : '';
            if (content) {
                this.conversation.push({ role: 'assistant', content: content });
            }
        } else if (type === 'error') {
            msgEl.className = 'ask-msg ask-msg-error';
            msgEl.textContent = content;
        }

        this.conversationEl.appendChild(msgEl);
        this.scrollToBottom();
        return msgEl;
    }

    formatResponse(text) {
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // URLs to links (restricted to known safe domains)
        const safeDomains = ['alleyne.dev', 'bankinginbim.com', 'github.com/d-alleyne', 'linkedin.com/in/damienalleyne', 'blog.alleyne.dev', 'jobs.alleyne.dev', 'app.bankinginbim.com'];
        const linkify = (url) => {
            try {
                const hostname = new URL(url).hostname;
                const isSafe = safeDomains.some(d => hostname === d || hostname.endsWith('.' + d) || url.includes(d));
                return isSafe ? `<a href="${url}" target="_blank" rel="noopener" class="ask-link">${url}</a>` : url;
            } catch { return url; }
        };
        html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, (_, text, url) => {
            try {
                const hostname = new URL(url).hostname;
                const isSafe = safeDomains.some(d => hostname === d || hostname.endsWith('.' + d) || url.includes(d));
                return isSafe ? `<a href="${url}" target="_blank" rel="noopener" class="ask-link">${text}</a>` : text;
            } catch { return text; }
        });
        html = html.replace(/(^|[\s(])(https?:\/\/[^\s)<]+)/g, (_, pre, url) => pre + linkify(url));

        // Markdown tables
        html = html.replace(/((?:^\|.+\|$\n?)+)/gm, (tableBlock) => {
            const rows = tableBlock.trim().split('\n').filter(r => r.trim());
            if (rows.length < 2) return tableBlock;

            let table = '<table class="ask-table">';
            let headerDone = false;
            rows.forEach((row) => {
                // Skip separator rows (|---|---|)
                if (/^\|[\s\-:|]+\|$/.test(row)) return;
                const cells = row.split('|').filter(c => c !== '').map(c => c.trim());
                if (!cells.length) return;
                const tag = !headerDone ? 'th' : 'td';
                table += '<tr>' + cells.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
                if (!headerDone) headerDone = true;
            });
            table += '</table>';
            return table;
        });

        // Horizontal rules
        html = html.replace(/^---+$/gm, '<hr class="ask-hr">');

        // Headings
        html = html.replace(/^####\s+(.+)$/gm, '<h6>$1</h6>');
        html = html.replace(/^###\s+(.+)$/gm, '<h5>$1</h5>');
        html = html.replace(/^##\s+(.+)$/gm, '<h4>$1</h4>');

        // Bullet lists (must run before bold/italic since * conflicts)
        html = html.replace(/^[*\-•]\s+(.+)$/gm, '<li>$1</li>');
        html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

        // Match verdicts (before bold processing eats the **)
        html = html.replace(/\*{0,2}Strong match\.?\*{0,2}/g, '<span class="ask-verdict ask-verdict-strong">Strong match</span>');
        html = html.replace(/\*{0,2}Partial match\.?\*{0,2}/g, '<span class="ask-verdict ask-verdict-partial">Partial match</span>');
        html = html.replace(/\*{0,2}No evidence\.?\*{0,2}/g, '<span class="ask-verdict ask-verdict-none">No evidence</span>');

        // Bold and italic
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Paragraphs
        html = html.replace(/\n\n+/g, '</p><p>');
        html = '<p>' + html + '</p>';
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<p>(<ul>)/g, '$1');
        html = html.replace(/(<\/ul>)<\/p>/g, '$1');
        html = html.replace(/<p>(<table)/g, '$1');
        html = html.replace(/(<\/table>)<\/p>/g, '$1');
        html = html.replace(/<p>(<h[456]>)/g, '$1');
        html = html.replace(/(<\/h[456]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<hr[^>]*>)<\/p>/g, '$1');
        html = html.replace(/<p>(<hr[^>]*>)/g, '$1');
        html = html.replace(/(<hr[^>]*>)<\/p>/g, '$1');

        return html;
    }

    showTypingIndicator() {
        const el = document.createElement('div');
        el.className = 'ask-msg ask-msg-loading';
        el.id = 'askTyping';
        el.innerHTML = '<div class="ask-typing-indicator"><span class="ask-typing-dot"></span><span class="ask-typing-dot"></span><span class="ask-typing-dot"></span></div>';
        this.conversationEl.appendChild(el);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const el = document.getElementById('askTyping');
        if (el) el.remove();
    }

    scrollToBottom() {
        const last = this.conversationEl.lastElementChild;
        if (last) {
            last.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }

    scrollToBottomThrottled() {
        if (this._scrollTimer) return;
        this._scrollTimer = setTimeout(() => {
            this.scrollToBottom();
            this._scrollTimer = null;
        }, 150);
    }

    setButtonsDisabled(disabled) {
        this.sendBtn.disabled = disabled;
        this.jdSendBtn.disabled = disabled;
        this.chips.forEach(c => c.disabled = disabled);
    }

}

// Initialize all modules when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Initialize core functionality
    new ThemeManager();
    new MobileNavigation();
    new Navigation();
    new ContactForm();
    
    // Initialize enhancements
    new AnimationObserver();
    new PerformanceOptimizer();
    new MobileFloatingCTA();
    new AskDamien();
    
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
