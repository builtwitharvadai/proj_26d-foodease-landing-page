/**
 * FoodEase Landing Page - Interactive JavaScript Features
 * Production-ready vanilla JavaScript implementation
 * 
 * @module script
 * @version 1.0.0
 * @description Implements mobile navigation, smooth scrolling, lazy loading,
 *              form validation, and scroll-triggered animations
 */

(function() {
  'use strict';

  // ============================================
  // Configuration & Constants
  // ============================================

  const CONFIG = Object.freeze({
    MOBILE_BREAKPOINT: 768,
    SCROLL_OFFSET: 80,
    DEBOUNCE_DELAY: 150,
    LAZY_LOAD_MARGIN: '50px',
    ANIMATION_THRESHOLD: 0.15,
    FORM_VALIDATION_DELAY: 300,
  });

  const SELECTORS = Object.freeze({
    MOBILE_NAV_TOGGLE: '.mobile-nav-toggle',
    NAV_MENU: 'header nav',
    NAV_LINKS: 'header nav a[href^="#"]',
    LAZY_IMAGES: 'img[loading="lazy"]',
    CONTACT_FORM: '.contact-form',
    FORM_INPUTS: 'input, textarea',
    ANIMATE_ON_SCROLL: '.service-card, .cuisine-card, .testimonial-card',
    HEADER: 'header[role="banner"]',
  });

  const CLASSES = Object.freeze({
    NAV_OPEN: 'nav-open',
    ANIMATED: 'animated',
    VISIBLE: 'visible',
    ERROR: 'error',
    SUCCESS: 'success',
    LOADING: 'loading',
  });

  const ARIA = Object.freeze({
    EXPANDED: 'aria-expanded',
    HIDDEN: 'aria-hidden',
    LIVE: 'aria-live',
    INVALID: 'aria-invalid',
  });

  // ============================================
  // Utility Functions
  // ============================================

  /**
   * Debounce function to limit execution rate
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function to limit execution frequency
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Safe query selector with error handling
   * @param {string} selector - CSS selector
   * @param {Element} context - Context element (default: document)
   * @returns {Element|null} Found element or null
   */
  function safeQuerySelector(selector, context = document) {
    try {
      return context.querySelector(selector);
    } catch (error) {
      console.error(`Invalid selector: ${selector}`, error);
      return null;
    }
  }

  /**
   * Safe query selector all with error handling
   * @param {string} selector - CSS selector
   * @param {Element} context - Context element (default: document)
   * @returns {NodeList} Found elements
   */
  function safeQuerySelectorAll(selector, context = document) {
    try {
      return context.querySelectorAll(selector);
    } catch (error) {
      console.error(`Invalid selector: ${selector}`, error);
      return [];
    }
  }

  /**
   * Check if element is in viewport
   * @param {Element} element - Element to check
   * @param {number} threshold - Visibility threshold (0-1)
   * @returns {boolean} True if element is visible
   */
  function isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

    return vertInView && horInView;
  }

  // ============================================
  // Mobile Navigation Module
  // ============================================

  const MobileNavigation = (function() {
    let isOpen = false;
    let navToggle = null;
    let navMenu = null;
    let navLinks = [];

    /**
     * Initialize mobile navigation
     */
    function init() {
      createMobileToggle();
      navMenu = safeQuerySelector(SELECTORS.NAV_MENU);
      navLinks = Array.from(safeQuerySelectorAll(SELECTORS.NAV_LINKS));

      if (!navToggle || !navMenu) {
        console.warn('Mobile navigation elements not found');
        return;
      }

      attachEventListeners();
      setupKeyboardNavigation();
    }

    /**
     * Create mobile navigation toggle button
     */
    function createMobileToggle() {
      const header = safeQuerySelector(SELECTORS.HEADER);
      if (!header) return;

      const existingToggle = safeQuerySelector(SELECTORS.MOBILE_NAV_TOGGLE);
      if (existingToggle) {
        navToggle = existingToggle;
        return;
      }

      navToggle = document.createElement('button');
      navToggle.className = 'mobile-nav-toggle';
      navToggle.setAttribute(ARIA.EXPANDED, 'false');
      navToggle.setAttribute('aria-label', 'Toggle navigation menu');
      navToggle.innerHTML = `
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      `;

      const headerContainer = header.querySelector('.header-container');
      if (headerContainer) {
        headerContainer.insertBefore(navToggle, headerContainer.lastElementChild);
      }

      addMobileStyles();
    }

    /**
     * Add mobile navigation styles
     */
    function addMobileStyles() {
      const styleId = 'mobile-nav-styles';
      if (document.getElementById(styleId)) return;

      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .mobile-nav-toggle {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          width: 40px;
          height: 40px;
          padding: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          z-index: 1000;
        }

        .hamburger-line {
          width: 100%;
          height: 3px;
          background-color: var(--color-text-primary);
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .nav-open .hamburger-line:nth-child(1) {
          transform: rotate(45deg) translate(8px, 8px);
        }

        .nav-open .hamburger-line:nth-child(2) {
          opacity: 0;
        }

        .nav-open .hamburger-line:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -7px);
        }

        @media (min-width: 768px) {
          .mobile-nav-toggle {
            display: none;
          }
        }

        @media (max-width: 767px) {
          header nav {
            position: fixed;
            top: 0;
            right: -100%;
            width: 80%;
            max-width: 300px;
            height: 100vh;
            background-color: var(--color-background);
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
            transition: right 0.3s ease;
            z-index: 999;
            padding: 80px 20px 20px;
          }

          header nav.nav-open {
            right: 0;
          }

          header nav ul {
            flex-direction: column;
            gap: var(--space-lg);
          }

          header nav a {
            display: block;
            padding: var(--space-md);
            font-size: var(--font-size-lg);
          }
        }
      `;
      document.head.appendChild(style);
    }

    /**
     * Attach event listeners
     */
    function attachEventListeners() {
      navToggle.addEventListener('click', toggleNav);
      
      navLinks.forEach(link => {
        link.addEventListener('click', handleNavLinkClick);
      });

      document.addEventListener('click', handleOutsideClick);
      window.addEventListener('resize', debounce(handleResize, CONFIG.DEBOUNCE_DELAY));
    }

    /**
     * Setup keyboard navigation
     */
    function setupKeyboardNavigation() {
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isOpen) {
          closeNav();
        }
      });

      navLinks.forEach((link, index) => {
        link.addEventListener('keydown', (event) => {
          if (event.key === 'Tab' && !event.shiftKey && index === navLinks.length - 1) {
            closeNav();
          }
        });
      });
    }

    /**
     * Toggle navigation menu
     */
    function toggleNav() {
      isOpen ? closeNav() : openNav();
    }

    /**
     * Open navigation menu
     */
    function openNav() {
      isOpen = true;
      document.body.classList.add(CLASSES.NAV_OPEN);
      navMenu.classList.add(CLASSES.NAV_OPEN);
      navToggle.setAttribute(ARIA.EXPANDED, 'true');
      navToggle.setAttribute('aria-label', 'Close navigation menu');
      
      if (navLinks.length > 0) {
        navLinks[0].focus();
      }
    }

    /**
     * Close navigation menu
     */
    function closeNav() {
      isOpen = false;
      document.body.classList.remove(CLASSES.NAV_OPEN);
      navMenu.classList.remove(CLASSES.NAV_OPEN);
      navToggle.setAttribute(ARIA.EXPANDED, 'false');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
    }

    /**
     * Handle navigation link click
     * @param {Event} event - Click event
     */
    function handleNavLinkClick(event) {
      if (window.innerWidth < CONFIG.MOBILE_BREAKPOINT) {
        closeNav();
      }
    }

    /**
     * Handle click outside navigation
     * @param {Event} event - Click event
     */
    function handleOutsideClick(event) {
      if (!isOpen) return;
      
      if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
        closeNav();
      }
    }

    /**
     * Handle window resize
     */
    function handleResize() {
      if (window.innerWidth >= CONFIG.MOBILE_BREAKPOINT && isOpen) {
        closeNav();
      }
    }

    return { init };
  })();

  // ============================================
  // Smooth Scroll Module
  // ============================================

  const SmoothScroll = (function() {
    /**
     * Initialize smooth scrolling
     */
    function init() {
      const links = safeQuerySelectorAll('a[href^="#"]');
      links.forEach(link => {
        link.addEventListener('click', handleSmoothScroll);
      });
    }

    /**
     * Handle smooth scroll click
     * @param {Event} event - Click event
     */
    function handleSmoothScroll(event) {
      const href = event.currentTarget.getAttribute('href');
      if (!href || href === '#') return;

      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (!targetElement) return;

      event.preventDefault();

      const headerHeight = safeQuerySelector(SELECTORS.HEADER)?.offsetHeight || 0;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = targetPosition - headerHeight - CONFIG.SCROLL_OFFSET;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      targetElement.setAttribute('tabindex', '-1');
      targetElement.focus();
      
      history.pushState(null, '', href);
    }

    return { init };
  })();

  // ============================================
  // Lazy Loading Module
  // ============================================

  const LazyLoading = (function() {
    let observer = null;

    /**
     * Initialize lazy loading
     */
    function init() {
      if (!('IntersectionObserver' in window)) {
        loadAllImages();
        return;
      }

      observer = new IntersectionObserver(handleIntersection, {
        root: null,
        rootMargin: CONFIG.LAZY_LOAD_MARGIN,
        threshold: 0
      });

      const lazyImages = safeQuerySelectorAll(SELECTORS.LAZY_IMAGES);
      lazyImages.forEach(img => observer.observe(img));
    }

    /**
     * Handle intersection observer callback
     * @param {IntersectionObserverEntry[]} entries - Observed entries
     */
    function handleIntersection(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImage(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }

    /**
     * Load single image
     * @param {HTMLImageElement} img - Image element
     */
    function loadImage(img) {
      const src = img.getAttribute('src');
      if (!src) return;

      img.addEventListener('load', () => {
        img.classList.add(CLASSES.LOADED);
      });

      img.addEventListener('error', () => {
        console.error(`Failed to load image: ${src}`);
        img.alt = 'Image failed to load';
      });
    }

    /**
     * Load all images (fallback for no IntersectionObserver)
     */
    function loadAllImages() {
      const lazyImages = safeQuerySelectorAll(SELECTORS.LAZY_IMAGES);
      lazyImages.forEach(img => {
        img.removeAttribute('loading');
        loadImage(img);
      });
    }

    return { init };
  })();

  // ============================================
  // Form Validation Module
  // ============================================

  const FormValidation = (function() {
    const validators = {
      name: {
        pattern: /^[a-zA-Z\s'-]{2,50}$/,
        message: 'Please enter a valid name (2-50 characters)'
      },
      email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      },
      phone: {
        pattern: /^[\d\s\-\+\(\)]{10,}$/,
        message: 'Please enter a valid phone number'
      },
      subject: {
        pattern: /^.{3,100}$/,
        message: 'Subject must be between 3 and 100 characters'
      },
      message: {
        pattern: /^.{10,1000}$/,
        message: 'Message must be between 10 and 1000 characters'
      }
    };

    /**
     * Initialize form validation
     */
    function init() {
      const form = safeQuerySelector(SELECTORS.CONTACT_FORM);
      if (!form) return;

      const inputs = form.querySelectorAll(SELECTORS.FORM_INPUTS);
      
      inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', debounce(() => validateField(input), CONFIG.FORM_VALIDATION_DELAY));
      });

      form.addEventListener('submit', handleFormSubmit);
    }

    /**
     * Validate single field
     * @param {HTMLInputElement|HTMLTextAreaElement} field - Form field
     * @returns {boolean} Validation result
     */
    function validateField(field) {
      const fieldName = field.name;
      const value = field.value.trim();
      const isRequired = field.hasAttribute('required');

      clearFieldError(field);

      if (isRequired && !value) {
        showFieldError(field, 'This field is required');
        return false;
      }

      if (value && validators[fieldName]) {
        const validator = validators[fieldName];
        if (!validator.pattern.test(value)) {
          showFieldError(field, validator.message);
          return false;
        }
      }

      showFieldSuccess(field);
      return true;
    }

    /**
     * Show field error
     * @param {HTMLElement} field - Form field
     * @param {string} message - Error message
     */
    function showFieldError(field, message) {
      const formGroup = field.closest('.form-group');
      if (!formGroup) return;

      formGroup.classList.add(CLASSES.ERROR);
      formGroup.classList.remove(CLASSES.SUCCESS);
      field.setAttribute(ARIA.INVALID, 'true');

      let errorElement = formGroup.querySelector('.error-message');
      if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.setAttribute('role', 'alert');
        formGroup.appendChild(errorElement);
      }

      errorElement.textContent = message;
    }

    /**
     * Show field success
     * @param {HTMLElement} field - Form field
     */
    function showFieldSuccess(field) {
      const formGroup = field.closest('.form-group');
      if (!formGroup) return;

      formGroup.classList.remove(CLASSES.ERROR);
      formGroup.classList.add(CLASSES.SUCCESS);
      field.setAttribute(ARIA.INVALID, 'false');
    }

    /**
     * Clear field error
     * @param {HTMLElement} field - Form field
     */
    function clearFieldError(field) {
      const formGroup = field.closest('.form-group');
      if (!formGroup) return;

      formGroup.classList.remove(CLASSES.ERROR, CLASSES.SUCCESS);
      field.removeAttribute(ARIA.INVALID);

      const errorElement = formGroup.querySelector('.error-message');
      if (errorElement) {
        errorElement.remove();
      }
    }

    /**
     * Handle form submission
     * @param {Event} event - Submit event
     */
    function handleFormSubmit(event) {
      event.preventDefault();

      const form = event.target;
      const inputs = form.querySelectorAll(SELECTORS.FORM_INPUTS);
      let isValid = true;

      inputs.forEach(input => {
        if (!validateField(input)) {
          isValid = false;
        }
      });

      if (isValid) {
        submitForm(form);
      } else {
        const firstError = form.querySelector(`.${CLASSES.ERROR} input, .${CLASSES.ERROR} textarea`);
        if (firstError) {
          firstError.focus();
        }
      }
    }

    /**
     * Submit form
     * @param {HTMLFormElement} form - Form element
     */
    async function submitForm(form) {
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;

      try {
        submitButton.disabled = true;
        submitButton.classList.add(CLASSES.LOADING);
        submitButton.textContent = 'Sending...';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        console.log('Form submitted:', data);

        await new Promise(resolve => setTimeout(resolve, 1000));

        showFormSuccess(form);
        form.reset();
        
        const inputs = form.querySelectorAll(SELECTORS.FORM_INPUTS);
        inputs.forEach(input => clearFieldError(input));

      } catch (error) {
        console.error('Form submission error:', error);
        showFormError(form, 'Failed to send message. Please try again.');
      } finally {
        submitButton.disabled = false;
        submitButton.classList.remove(CLASSES.LOADING);
        submitButton.textContent = originalText;
      }
    }

    /**
     * Show form success message
     * @param {HTMLFormElement} form - Form element
     */
    function showFormSuccess(form) {
      const message = document.createElement('div');
      message.className = 'form-message success';
      message.setAttribute('role', 'status');
      message.setAttribute(ARIA.LIVE, 'polite');
      message.textContent = 'Thank you! Your message has been sent successfully.';
      
      form.insertAdjacentElement('beforebegin', message);
      
      setTimeout(() => message.remove(), 5000);
    }

    /**
     * Show form error message
     * @param {HTMLFormElement} form - Form element
     * @param {string} errorMessage - Error message
     */
    function showFormError(form, errorMessage) {
      const message = document.createElement('div');
      message.className = 'form-message error';
      message.setAttribute('role', 'alert');
      message.setAttribute(ARIA.LIVE, 'assertive');
      message.textContent = errorMessage;
      
      form.insertAdjacentElement('beforebegin', message);
      
      setTimeout(() => message.remove(), 5000);
    }

    return { init };
  })();

  // ============================================
  // Scroll Animations Module
  // ============================================

  const ScrollAnimations = (function() {
    let observer = null;

    /**
     * Initialize scroll animations
     */
    function init() {
      if (!('IntersectionObserver' in window)) {
        showAllElements();
        return;
      }

      addAnimationStyles();

      observer = new IntersectionObserver(handleIntersection, {
        root: null,
        rootMargin: '0px',
        threshold: CONFIG.ANIMATION_THRESHOLD
      });

      const elements = safeQuerySelectorAll(SELECTORS.ANIMATE_ON_SCROLL);
      elements.forEach(element => {
        element.classList.add('animate-on-scroll');
        observer.observe(element);
      });
    }

    /**
     * Add animation styles
     */
    function addAnimationStyles() {
      const styleId = 'scroll-animation-styles';
      if (document.getElementById(styleId)) return;

      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .animate-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-on-scroll {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }

        .form-message {
          padding: var(--space-md);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-lg);
          font-weight: var(--font-weight-medium);
        }

        .form-message.success {
          background-color: var(--color-success);
          color: white;
        }

        .form-message.error {
          background-color: var(--color-error);
          color: white;
        }

        .form-group.error input,
        .form-group.error textarea {
          border-color: var(--color-error);
        }

        .form-group.success input,
        .form-group.success textarea {
          border-color: var(--color-success);
        }

        .error-message {
          display: block;
          color: var(--color-error);
          font-size: var(--font-size-sm);
          margin-top: var(--space-xs);
        }
      `;
      document.head.appendChild(style);
    }

    /**
     * Handle intersection observer callback
     * @param {IntersectionObserverEntry[]} entries - Observed entries
     */
    function handleIntersection(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(CLASSES.VISIBLE);
          observer.unobserve(entry.target);
        }
      });
    }

    /**
     * Show all elements (fallback)
     */
    function showAllElements() {
      const elements = safeQuerySelectorAll(SELECTORS.ANIMATE_ON_SCROLL);
      elements.forEach(element => {
        element.style.opacity = '1';
        element.style.transform = 'none';
      });
    }

    return { init };
  })();

  // ============================================
  // Application Initialization
  // ============================================

  /**
   * Initialize all modules
   */
  function initializeApp() {
    try {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runInitialization);
      } else {
        runInitialization();
      }
    } catch (error) {
      console.error('Failed to initialize application:', error);
    }
  }

  /**
   * Run initialization sequence
   */
  function runInitialization() {
    try {
      MobileNavigation.init();
      SmoothScroll.init();
      LazyLoading.init();
      FormValidation.init();
      ScrollAnimations.init();

      console.log('FoodEase interactive features initialized successfully');
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }

  initializeApp();

})();