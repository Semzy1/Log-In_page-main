/**
 * ShopEase Frontend Utilities
 * Common functions and utilities for the frontend
 * Version 2.0.0
 */

class UIHelper {
  /**
   * Show toast notification
   */
  static showToast(message, type = 'info', duration = 3000) {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toastContainer';
      toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1050;
        pointer-events: none;
      `;
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
      min-width: 280px;
      margin-bottom: 12px;
      padding: 14px 18px;
      border-radius: 8px;
      color: #fff;
      font-weight: 500;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      opacity: 1;
      transition: opacity 0.3s ease;
      pointer-events: auto;
      animation: slideIn 0.3s ease;
    `;

    const bgColors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    toast.style.backgroundColor = bgColors[type] || bgColors.info;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  }

  /**
   * Show loading indicator
   */
  static showLoading(message = 'Loading...') {
    let loadingDiv = document.getElementById('loadingIndicator');
    if (!loadingDiv) {
      loadingDiv = document.createElement('div');
      loadingDiv.id = 'loadingIndicator';
      loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
      `;
      document.body.appendChild(loadingDiv);
    }

    loadingDiv.innerHTML = `
      <div style="
        background: white;
        padding: 32px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      ">
        <div style="
          border: 4px solid #f3f4f6;
          border-top-color: #0ea5a3;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        "></div>
        <p style="margin: 0; color: #111827; font-weight: 500;">${message}</p>
        <style>
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </div>
    `;

    return loadingDiv;
  }

  /**
   * Hide loading indicator
   */
  static hideLoading() {
    const loadingDiv = document.getElementById('loadingIndicator');
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }

  /**
   * Format currency (Nigerian Naira)
   */
  static formatCurrency(amount) {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    });
    return formatter.format(amount);
  }

  /**
   * Format number with commas
   */
  static formatNumber(number) {
    return new Intl.NumberFormat('en-NG').format(number);
  }

  /**
   * Format date
   */
  static formatDate(date, format = 'short') {
    const options = {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    };
    return new Date(date).toLocaleDateString('en-NG', options[format] || options.short);
  }

  /**
   * Set loading state on button
   */
  static setButtonLoading(button, isLoading = true) {
    if (!button) return;
    const originalText = button.getAttribute('data-original-text') || button.textContent;
    
    if (isLoading) {
      button.setAttribute('data-original-text', originalText);
      button.disabled = true;
      button.innerHTML = '<span style="display: inline-block; animation: spin 1s linear infinite;">⟳</span> Loading...';
    } else {
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  /**
   * Validate email
   */
  static isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password) {
    const strength = {
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasDigit: /\d/.test(password),
      isLongEnough: password.length >= 6
    };

    const score = Object.values(strength).filter(Boolean).length;
    
    return {
      score,
      strength: score === 4 ? 'strong' : score >= 3 ? 'medium' : 'weak',
      checks: strength
    };
  }

  /**
   * Sanitize input to prevent XSS
   */
  static sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Copy to clipboard
   */
  static copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Copied to clipboard!', 'success', 2000);
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.showToast('Copied to clipboard!', 'success', 2000);
    }
  }

  /**
   * Scroll to element
   */
  static scrollToElement(selector, offset = 0) {
    const element = document.querySelector(selector);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  /**
   * Debounce function
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function
   */
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

/**
 * Storage wrapper with expiration support
 */
class StorageManager {
  /**
   * Set item with optional expiration
   */
  static setItem(key, value, expirationMinutes = null) {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        expiration: expirationMinutes ? Date.now() + (expirationMinutes * 60 * 1000) : null
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }

  /**
   * Get item and check expiration
   */
  static getItem(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      if (parsed.expiration && Date.now() > parsed.expiration) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.value;
    } catch (e) {
      console.error('Storage error:', e);
      return null;
    }
  }

  /**
   * Remove item
   */
  static removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Storage error:', e);
    }
  }

  /**
   * Clear all items
   */
  static clear() {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Storage error:', e);
    }
  }
}

/**
 * Validation utilities
 */
class Validator {
  static rules = {
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    phone: (value) => /^\d{10,15}$/.test(value.replace(/\D/g, '')),
    zipcode: (value) => /^\d{5,10}$/.test(value.replace(/\D/g, '')),
    creditCard: (value) => {
      const sanitized = value.replace(/\D/g, '');
      if (sanitized.length < 13 || sanitized.length > 19) return false;
      // Simple Luhn check
      let sum = 0, double = false;
      for (let i = sanitized.length - 1; i >= 0; i--) {
        let digit = parseInt(sanitized.charAt(i), 10);
        if (double) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        sum += digit;
        double = !double;
      }
      return sum % 10 === 0;
    },
    cvv: (value) => /^\d{3,4}$/.test(value),
    url: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    username: (value) => /^[a-zA-Z0-9_]{3,50}$/.test(value),
    password: (value) => {
      return value.length >= 6 &&
             /[a-z]/.test(value) &&
             /[A-Z]/.test(value) &&
             /\d/.test(value);
    }
  };

  /**
   * Validate form
   */
  static validateForm(formElement) {
    const errors = {};
    const inputs = formElement.querySelectorAll('[data-validate]');

    inputs.forEach(input => {
      const rules = input.dataset.validate.split('|');
      const value = input.value.trim();

      for (const rule of rules) {
        if (this.rules[rule]) {
          if (!this.rules[rule](value)) {
            errors[input.name] = errors[input.name] || `Invalid ${input.name}`;
          }
        } else if (rule === 'required' && !value) {
          errors[input.name] = `${input.name} is required`;
        }
      }
    });

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Display form errors
   */
  static displayErrors(formElement, errors) {
    // Clear previous errors
    formElement.querySelectorAll('.form-error').forEach(el => el.remove());

    Object.entries(errors).forEach(([fieldName, errorMessage]) => {
      const input = formElement.querySelector(`[name="${fieldName}"]`);
      if (input) {
        input.classList.add('is-invalid');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.cssText = `
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
        `;
        errorDiv.textContent = errorMessage;
        input.parentElement.appendChild(errorDiv);
      }
    });
  }

  /**
   * Clear form errors
   */
  static clearErrors(formElement) {
    formElement.querySelectorAll('.is-invalid').forEach(el => {
      el.classList.remove('is-invalid');
    });
    formElement.querySelectorAll('.form-error').forEach(el => el.remove());
  }
}

// Expose utilities globally
if (typeof window !== 'undefined') {
  window.UIHelper = UIHelper;
  window.StorageManager = StorageManager;
  window.Validator = Validator;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UIHelper, StorageManager, Validator };
}
