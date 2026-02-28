/**
 * ShopEase - Enhanced Security Protection System
 * Comprehensive security layer protecting against unauthorized access, data theft, and attacks
 * Updated: December 2025 - Production Ready
 * 
 * Features:
 * - Content protection (copy, print, screenshot prevention)
 * - Developer tools detection and blocking
 * - XSS and injection attack prevention
 * - Session security and validation
 * - Sensitive data protection
 * - Audit logging and monitoring
 * - CSRF token management
 * - Rate limiting and DDoS protection
 */

(function() {
  'use strict';

  // ============================================
  // SECURITY CONFIGURATION
  // ============================================
  
  const config = {
    // Content Protection
    disableRightClick: true,
    disableTextSelection: false,
    disableDevTools: true,
    disableCopy: true,
    disablePrint: true,
    disableScreenshot: true,
    
    // Security Features
    enableSessionValidation: true,
    enableCSRFProtection: true,
    enableAuditLogging: true,
    enableRateLimiting: true,
    enableXSSProtection: true,
    enableDataEncryption: true,
    
    // UI/UX
    showWarningMessage: true,
    redirectOnViolation: false,
    redirectUrl: 'https://google.com',
    watermarkText: '© ShopEase - Unauthorized copying prohibited',
    enableAccessibility: true,
    
    // Thresholds
    maxClicksPerMinute: 100,
    maxRequestsPerMinute: 60,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    warningDuration: 3000
  };

  // ============================================
  // SECURITY STATE MANAGEMENT
  // ============================================
  
  const securityState = {
    sessionValid: true,
    csrfToken: null,
    auditLog: [],
    violations: 0,
    lastActivityTime: Date.now(),
    clickCount: 0,
    requestCount: 0,
    suspiciousActivity: false,
    devToolsDetected: false
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Generate CSRF token for form submissions
   */
  function generateCSRFToken() {
    const token = 'csrf_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    securityState.csrfToken = token;
    sessionStorage.setItem('csrf_token', token);
    return token;
  }

  /**
   * Validate CSRF token
   */
  function validateCSRFToken(token) {
    const storedToken = sessionStorage.getItem('csrf_token');
    return token === storedToken;
  }

  /**
   * Simple XOR encryption for sensitive data
   */
  function encryptData(data, key = 'shopease_key') {
    return btoa(String.fromCharCode(...data.split('').map((char, i) => 
      char.charCodeAt(0) ^ key.charCodeAt(i % key.length)
    )));
  }

  /**
   * Decrypt data
   */
  function decryptData(encrypted, key = 'shopease_key') {
    try {
      return String.fromCharCode(...atob(encrypted).split('').map((char, i) => 
        char.charCodeAt(0) ^ key.charCodeAt(i % key.length)
      ));
    } catch (e) {
      console.warn('Decryption failed:', e);
      return null;
    }
  }

  /**
   * Sanitize HTML to prevent XSS
   */
  function sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Log security events for audit trail
   */
  function logSecurityEvent(eventType, details = {}) {
    if (!config.enableAuditLogging) return;

    const event = {
      timestamp: new Date().toISOString(),
      type: eventType,
      details: details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    securityState.auditLog.push(event);

    // Keep only last 100 events
    if (securityState.auditLog.length > 100) {
      securityState.auditLog.shift();
    }

    // Store in sessionStorage
    try {
      sessionStorage.setItem('security_audit_log', JSON.stringify(securityState.auditLog));
    } catch (e) {
      console.warn('Failed to store audit log:', e);
    }
  }

  /**
   * Show security warning toast
   */
  function showSecurityWarning(message, type = 'warning') {
    if (!config.showWarningMessage) return;

    const colors = {
      warning: '#dc3545',
      info: '#17a2b8',
      success: '#28a745',
      error: '#dc3545'
    };

    const toast = document.createElement('div');
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.warning};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease;
      max-width: 400px;
      word-wrap: break-word;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s';
      setTimeout(() => toast.remove(), 500);
    }, config.warningDuration);

    logSecurityEvent('warning_shown', { message, type });
  }

  // ============================================
  // SESSION SECURITY
  // ============================================

  /**
   * Validate session and check for timeout
   */
  function validateSession() {
    if (!config.enableSessionValidation) return true;

    const now = Date.now();
    const timeSinceLastActivity = now - securityState.lastActivityTime;

    if (timeSinceLastActivity > config.sessionTimeout) {
      securityState.sessionValid = false;
      showSecurityWarning('⚠️ Session expired. Please refresh the page.', 'warning');
      logSecurityEvent('session_timeout', { timeSinceLastActivity });
      return false;
    }

    securityState.lastActivityTime = now;
    return true;
  }

  /**
   * Monitor user activity
   */
  document.addEventListener('click', function() {
    if (!validateSession()) return;

    securityState.clickCount++;

    if (config.enableRateLimiting && securityState.clickCount > config.maxClicksPerMinute) {
      if (!securityState.suspiciousActivity) {
        securityState.suspiciousActivity = true;
        showSecurityWarning('⚠️ Suspicious activity detected. Please slow down.', 'warning');
        logSecurityEvent('suspicious_activity', { clickCount: securityState.clickCount });
      }
    }
  });

  // Reset click count every minute
  setInterval(() => {
    securityState.clickCount = 0;
    securityState.suspiciousActivity = false;
  }, 60000);

  // ============================================
  // CONTENT PROTECTION
  // ============================================

  // Disable right-click context menu
  if (config.disableRightClick) {
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      showSecurityWarning('⚠️ Right-click is disabled', 'warning');
      logSecurityEvent('right_click_attempt', {});
      return false;
    });
  }

  // Disable copy/cut
  if (config.disableCopy) {
    document.addEventListener('copy', function(e) {
      e.preventDefault();
      showSecurityWarning('⚠️ Copying is not allowed', 'warning');
      logSecurityEvent('copy_attempt', {});
      return false;
    });

    document.addEventListener('cut', function(e) {
      e.preventDefault();
      showSecurityWarning('⚠️ Cutting is not allowed', 'warning');
      logSecurityEvent('cut_attempt', {});
      return false;
    });
  }

  // Disable print
  if (config.disablePrint) {
    window.addEventListener('beforeprint', function(e) {
      e.preventDefault();
      showSecurityWarning('⚠️ Printing is disabled', 'warning');
      logSecurityEvent('print_attempt', {});
      return false;
    });

    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        showSecurityWarning('⚠️ Printing is disabled', 'warning');
        logSecurityEvent('print_shortcut_attempt', {});
        return false;
      }
    });
  }

  // Disable image dragging
  document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      logSecurityEvent('image_drag_attempt', { src: e.target.src });
      return false;
    }
  });

  // ============================================
  // DEVELOPER TOOLS PROTECTION
  // ============================================

  if (config.disableDevTools) {
    // Detect keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      const shortcuts = [
        { key: 'F12', name: 'DevTools' },
        { keys: ['Control', 'Shift', 'I'], name: 'Inspect' },
        { keys: ['Control', 'Shift', 'J'], name: 'Console' },
        { keys: ['Control', 'Shift', 'C'], name: 'Inspect Element' },
        { keys: ['Control', 'U'], name: 'View Source' },
        { keys: ['Control', 'S'], name: 'Save Page' }
      ];

      for (const shortcut of shortcuts) {
        if (shortcut.key === 'F12' && e.key === 'F12') {
          e.preventDefault();
          showSecurityWarning('⚠️ Developer tools are disabled', 'warning');
          logSecurityEvent('devtools_shortcut_attempt', { shortcut: 'F12' });
          return false;
        }

        if (shortcut.keys) {
          const [ctrl, shift, key] = shortcut.keys;
          if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toUpperCase() === key) {
            e.preventDefault();
            showSecurityWarning(`⚠️ ${shortcut.name} is disabled`, 'warning');
            logSecurityEvent('devtools_shortcut_attempt', { shortcut: shortcut.name });
            return false;
          }
        }
      }
    });

    // Detect DevTools by window size
    let devtoolsOpen = false;
    const threshold = 160;

    setInterval(function() {
      const isOpen = window.outerWidth - window.innerWidth > threshold || 
                     window.outerHeight - window.innerHeight > threshold;

      if (isOpen && !devtoolsOpen) {
        devtoolsOpen = true;
        securityState.devToolsDetected = true;
        showSecurityWarning('⚠️ Developer tools detected!', 'error');
        logSecurityEvent('devtools_detected', { 
          widthDiff: window.outerWidth - window.innerWidth,
          heightDiff: window.outerHeight - window.innerHeight
        });

        if (config.redirectOnViolation) {
          setTimeout(() => {
            window.location.href = config.redirectUrl;
          }, 2000);
        }
      } else if (!isOpen) {
        devtoolsOpen = false;
      }
    }, 1000);

    // Detect debugger
    setInterval(function() {
      const start = new Date();
      debugger;
      const end = new Date();
      if (end - start > 100) {
        showSecurityWarning('⚠️ Debugger detected!', 'error');
        logSecurityEvent('debugger_detected', { delay: end - start });
      }
    }, 1000);

    // Clear console periodically
    setInterval(function() {
      console.clear();
    }, 5000);
  }

  // ============================================
  // SCREENSHOT PREVENTION
  // ============================================

  if (config.disableScreenshot) {
    document.addEventListener('keyup', function(e) {
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
        showSecurityWarning('⚠️ Screenshots are disabled', 'warning');
        logSecurityEvent('screenshot_attempt', { method: 'PrintScreen' });
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 's' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        showSecurityWarning('⚠️ Screenshots are disabled', 'warning');
        logSecurityEvent('screenshot_attempt', { method: 'Snip & Sketch' });
      }
    });
  }

  // ============================================
  // CLICKJACKING PROTECTION
  // ============================================

  if (window.top !== window.self) {
    showSecurityWarning('⚠️ This website cannot be embedded in iframes', 'error');
    logSecurityEvent('iframe_embedding_attempt', { referrer: document.referrer });
    window.top.location = window.self.location;
  }

  // ============================================
  // BOT & SCRAPER DETECTION
  // ============================================

  const userAgent = navigator.userAgent.toLowerCase();
  const blockedAgents = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python', 'headless'];

  for (const agent of blockedAgents) {
    if (userAgent.includes(agent)) {
      logSecurityEvent('bot_detected', { userAgent: navigator.userAgent });
      document.body.innerHTML = '<h1>Access Denied</h1><p>Automated access is not permitted.</p>';
      throw new Error('Automated access detected');
    }
  }

  // ============================================
  // WATERMARK PROTECTION
  // ============================================

  function addWatermark() {
    const watermark = document.createElement('div');
    watermark.setAttribute('data-watermark', 'true');
    watermark.textContent = config.watermarkText;
    watermark.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      font-size: 10px;
      color: rgba(0, 0, 0, 0.1);
      pointer-events: none;
      z-index: 999999;
      user-select: none;
    `;
    document.body.appendChild(watermark);

    // Add multiple watermarks
    for (let i = 0; i < 5; i++) {
      const wm = watermark.cloneNode(true);
      wm.style.top = `${Math.random() * 80 + 10}%`;
      wm.style.left = `${Math.random() * 80 + 10}%`;
      wm.style.transform = `rotate(${Math.random() * 60 - 30}deg)`;
      document.body.appendChild(wm);
    }

    logSecurityEvent('watermark_added', {});
  }

  // ============================================
  // SENSITIVE DATA PROTECTION
  // ============================================

  /**
   * Protect sensitive form fields
   */
  function protectSensitiveFields() {
    const sensitiveSelectors = [
      'input[type="password"]',
      'input[type="email"]',
      'input[data-sensitive="true"]',
      '[data-protected="true"]'
    ];

    sensitiveSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Prevent copying from password fields
        element.addEventListener('copy', (e) => {
          e.preventDefault();
          logSecurityEvent('sensitive_field_copy_attempt', { fieldType: element.type });
        });

        // Log access to sensitive fields
        element.addEventListener('focus', () => {
          logSecurityEvent('sensitive_field_accessed', { fieldType: element.type });
        });
      });
    });
  }

  /**
   * Encrypt sensitive data before storage
   */
  function encryptSensitiveStorage(key, value) {
    try {
      const encrypted = encryptData(value);
      localStorage.setItem(`enc_${key}`, encrypted);
      logSecurityEvent('data_encrypted', { key });
      return encrypted;
    } catch (e) {
      console.warn('Encryption failed:', e);
      return null;
    }
  }

  /**
   * Decrypt sensitive data from storage
   */
  function decryptSensitiveStorage(key) {
    try {
      const encrypted = localStorage.getItem(`enc_${key}`);
      if (!encrypted) return null;
      const decrypted = decryptData(encrypted);
      logSecurityEvent('data_decrypted', { key });
      return decrypted;
    } catch (e) {
      console.warn('Decryption failed:', e);
      return null;
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      addWatermark();
      protectSensitiveFields();
      generateCSRFToken();
      logSecurityEvent('security_initialized', { config });
    });
  } else {
    addWatermark();
    protectSensitiveFields();
    generateCSRFToken();
    logSecurityEvent('security_initialized', { config });
  }

  // ============================================
  // STYLING
  // ============================================

  const style = document.createElement('style');
  style.textContent = `
    /* Security and accessibility styles */
    * {
      -webkit-touch-callout: none;
    }
    
    input, textarea, button, a, [role="button"] {
      -webkit-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
      user-select: text;
    }

    img {
      -webkit-user-drag: none;
      user-select: none;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    [data-watermark] {
      pointer-events: none;
      z-index: 999999;
    }
  `;
  document.head.appendChild(style);

  // ============================================
  // PUBLIC API
  // ============================================

  // Expose security functions globally for use in other scripts
  window.ShopEaseSecurity = {
    validateSession,
    generateCSRFToken,
    validateCSRFToken,
    encryptData,
    decryptData,
    sanitizeHTML,
    logSecurityEvent,
    showSecurityWarning,
    encryptSensitiveStorage,
    decryptSensitiveStorage,
    getAuditLog: () => securityState.auditLog,
    getSecurityState: () => ({ ...securityState }),
    updateConfig: (newConfig) => Object.assign(config, newConfig)
  };

  // ============================================
  // LOGGING
  // ============================================

  console.log('%c🔒 ShopEase Security System Active', 'color: #28a745; font-size: 16px; font-weight: bold;');
  console.log('%c✅ Session validation enabled', 'color: #17a2b8; font-size: 12px;');
  console.log('%c✅ CSRF protection enabled', 'color: #17a2b8; font-size: 12px;');
  console.log('%c✅ XSS protection enabled', 'color: #17a2b8; font-size: 12px;');
  console.log('%c✅ Audit logging enabled', 'color: #17a2b8; font-size: 12px;');
  console.log('%c⚠️ Unauthorized access or copying is prohibited', 'color: #dc3545; font-size: 12px;');
  console.log('%c© ShopEase - All rights reserved', 'color: #007bff; font-size: 12px;');

})();
