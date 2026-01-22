/**
 * PathCare Diagnostics - JavaScript
 * Handles: Form validation, smooth scrolling, mobile menu, header scroll effect
 */

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // ============================================
  // Mobile Menu Toggle
  // ============================================
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const nav = document.getElementById('nav');

  if (mobileMenuToggle && nav) {
    mobileMenuToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      nav.classList.toggle('active');
      
      // Toggle aria-expanded for accessibility
      const isExpanded = this.classList.contains('active');
      this.setAttribute('aria-expanded', isExpanded);
    });

    // Close mobile menu when clicking on a nav link
    const navLinks = nav.querySelectorAll('.nav-link');
    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        mobileMenuToggle.classList.remove('active');
        nav.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!nav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        mobileMenuToggle.classList.remove('active');
        nav.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ============================================
  // Header Scroll Effect
  // ============================================
  const header = document.getElementById('header');
  
  if (header) {
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset;
      
      // Add/remove scrolled class for shadow effect
      if (currentScroll > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
    });
  }

  // ============================================
  // Smooth Scrolling for Anchor Links
  // ============================================
  const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
  
  smoothScrollLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Skip if it's just "#" or empty
      if (href === '#' || href === '') return;
      
      const target = document.querySelector(href);
      
      if (target) {
        e.preventDefault();
        
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================
  // Form Validation
  // ============================================
  const inquiryForm = document.getElementById('inquiryForm');
  const formSuccess = document.getElementById('formSuccess');

  if (inquiryForm) {
    // Validation patterns
    const patterns = {
      name: /^[a-zA-Z\s]{2,50}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\d\s\-\+\(\)]{10,15}$/
    };

    // Validate individual field
    function validateField(field) {
      const value = field.value.trim();
      const fieldName = field.name;
      const formGroup = field.closest('.form-group');
      let isValid = true;

      // Required field check
      if (field.hasAttribute('required') && value === '') {
        isValid = false;
      }

      // Pattern validation
      if (value !== '' && patterns[fieldName]) {
        isValid = patterns[fieldName].test(value);
      }

      // Update UI
      if (formGroup) {
        if (!isValid) {
          formGroup.classList.add('has-error');
          field.classList.add('error');
        } else {
          formGroup.classList.remove('has-error');
          field.classList.remove('error');
        }
      }

      return isValid;
    }

    // Real-time validation on blur
    const formFields = inquiryForm.querySelectorAll('input, select, textarea');
    formFields.forEach(function(field) {
      field.addEventListener('blur', function() {
        validateField(this);
      });

      // Remove error on input
      field.addEventListener('input', function() {
        const formGroup = this.closest('.form-group');
        if (formGroup && formGroup.classList.contains('has-error')) {
          if (this.value.trim() !== '') {
            formGroup.classList.remove('has-error');
            this.classList.remove('error');
          }
        }
      });
    });

    // Form submission
    inquiryForm.addEventListener('submit', function(e) {
      e.preventDefault();

      let isFormValid = true;

      // Validate all required fields
      const requiredFields = this.querySelectorAll('[required]');
      requiredFields.forEach(function(field) {
        if (!validateField(field)) {
          isFormValid = false;
        }
      });

      if (!isFormValid) {
        // Focus first error field
        const firstError = this.querySelector('.error');
        if (firstError) {
          firstError.focus();
        }
        return;
      }

      // Collect form data (ready for Google Sheets integration)
      const formData = new FormData(this);
      const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        testRequirement: formData.get('testRequirement'),
        message: formData.get('message'),
        homeCollection: formData.get('homeCollection') === 'yes' ? 'Yes' : 'No',
        timestamp: new Date().toISOString()
      };

      // Log data (for development)
      console.log('Form Data:', data);

      /**
       * Google Sheets Integration
       * 
       * To integrate with Google Sheets:
       * 1. Create a Google Sheet
       * 2. Go to Extensions > Apps Script
       * 3. Create a web app that handles POST requests
       * 4. Deploy as web app and get the URL
       * 5. Uncomment and update the fetch call below
       * 
       * Example Apps Script code:
       * 
       * function doPost(e) {
       *   var sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
       *   var data = JSON.parse(e.postData.contents);
       *   sheet.appendRow([
       *     data.timestamp,
       *     data.name,
       *     data.phone,
       *     data.email,
       *     data.testRequirement,
       *     data.message,
       *     data.homeCollection
       *   ]);
       *   return ContentService.createTextOutput(JSON.stringify({result: 'success'}))
       *     .setMimeType(ContentService.MimeType.JSON);
       * }
       */

      /*
      // Uncomment to enable Google Sheets submission
      fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        console.log('Form submitted successfully');
      })
      .catch(error => {
        console.error('Error:', error);
      });
      */

      // Show success message
      this.style.display = 'none';
      if (formSuccess) {
        formSuccess.classList.add('show');
      }

      // Optional: Reset form after delay
      setTimeout(function() {
        inquiryForm.reset();
        inquiryForm.style.display = 'block';
        if (formSuccess) {
          formSuccess.classList.remove('show');
        }
      }, 5000);
    });
  }

  // ============================================
  // Scroll Animation (Intersection Observer)
  // ============================================
  const animatedElements = document.querySelectorAll('.service-card, .value-card, .team-card, .testimonial-card, .package-card, .certification-card, .test-card');
  
  if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(function(el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  }

  // ============================================
  // Phone Number Formatting
  // ============================================
  const phoneInput = document.getElementById('phone');
  
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      // Allow only numbers, spaces, dashes, plus, and parentheses
      this.value = this.value.replace(/[^\d\s\-\+\(\)]/g, '');
    });
  }

  // ============================================
  // Active Navigation Link
  // ============================================
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(function(link) {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // ============================================
  // Accessibility: Focus visible polyfill
  // ============================================
  function handleFirstTab(e) {
    if (e.keyCode === 9) {
      document.body.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
    }
  }
  
  window.addEventListener('keydown', handleFirstTab);

});
