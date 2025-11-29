/**
 * Website Security Protection
 * Protects against unauthorized copying, right-click, inspect element, and other common attacks
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    disableRightClick: true,
    disableTextSelection: true,
    disableDevTools: true,
    disableCopy: true,
    disablePrint: true,
    disableScreenshot: true,
    showWarningMessage: true,
    redirectOnViolation: false,
    redirectUrl: 'https://google.com',
    watermarkText: '© ShopEase - Unauthorized copying prohibited'
  };

  // Show warning toast
  function showSecurityWarning(message) {
    if (!config.showWarningMessage) return;

    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s';
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

  // Disable right-click context menu
  if (config.disableRightClick) {
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      showSecurityWarning('⚠️ Right-click is disabled on this website');
      return false;
    });
  }

  // Disable text selection
  if (config.disableTextSelection) {
    document.addEventListener('selectstart', function(e) {
      e.preventDefault();
      return false;
    });

    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
  }

  // Disable copy/cut
  if (config.disableCopy) {
    document.addEventListener('copy', function(e) {
      e.preventDefault();
      showSecurityWarning('⚠️ Copying content is not allowed');
      return false;
    });

    document.addEventListener('cut', function(e) {
      e.preventDefault();
      showSecurityWarning('⚠️ Cutting content is not allowed');
      return false;
    });
  }

  // Disable print
  if (config.disablePrint) {
    window.addEventListener('beforeprint', function(e) {
      e.preventDefault();
      showSecurityWarning('⚠️ Printing is disabled on this website');
      return false;
    });

    // Disable Ctrl+P
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        showSecurityWarning('⚠️ Printing is disabled');
        return false;
      }
    });
  }

  // Disable developer tools
  if (config.disableDevTools) {
    // Detect F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    document.addEventListener('keydown', function(e) {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        showSecurityWarning('⚠️ Developer tools are disabled');
        return false;
      }

      // Ctrl+Shift+I (Inspect)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        showSecurityWarning('⚠️ Inspect element is disabled');
        return false;
      }

      // Ctrl+Shift+J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        showSecurityWarning('⚠️ Console is disabled');
        return false;
      }

      // Ctrl+Shift+C (Inspect element)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        showSecurityWarning('⚠️ Inspect element is disabled');
        return false;
      }

      // Ctrl+U (View source)
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        showSecurityWarning('⚠️ View source is disabled');
        return false;
      }

      // Ctrl+S (Save page)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        showSecurityWarning('⚠️ Saving page is disabled');
        return false;
      }
    });

    // Detect DevTools opening by checking window size changes
    let devtoolsOpen = false;
    const threshold = 160;

    setInterval(function() {
      if (window.outerWidth - window.innerWidth > threshold || 
          window.outerHeight - window.innerHeight > threshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          showSecurityWarning('⚠️ Developer tools detected!');
          
          if (config.redirectOnViolation) {
            setTimeout(() => {
              window.location.href = config.redirectUrl;
            }, 2000);
          }
        }
      } else {
        devtoolsOpen = false;
      }
    }, 1000);

    // Detect debugger
    setInterval(function() {
      const start = new Date();
      debugger;
      const end = new Date();
      if (end - start > 100) {
        showSecurityWarning('⚠️ Debugger detected!');
        if (config.redirectOnViolation) {
          window.location.href = config.redirectUrl;
        }
      }
    }, 1000);
  }

  // Disable drag and drop of images
  document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      showSecurityWarning('⚠️ Image dragging is disabled');
      return false;
    }
  });

  // Prevent screenshot via keyboard shortcuts
  if (config.disableScreenshot) {
    document.addEventListener('keyup', function(e) {
      // Print Screen
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
        showSecurityWarning('⚠️ Screenshots are discouraged');
      }
    });

    // Detect screenshot tools (Windows Snipping Tool, etc.)
    document.addEventListener('keydown', function(e) {
      // Windows + Shift + S (Windows Snip & Sketch)
      if (e.key === 's' && e.shiftKey && (e.metaKey || e.key === 'Meta')) {
        showSecurityWarning('⚠️ Screenshots are discouraged');
      }
    });
  }

  // Add invisible watermark to the page
  function addWatermark() {
    const watermark = document.createElement('div');
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

    // Add multiple watermarks across the page
    for (let i = 0; i < 5; i++) {
      const wm = watermark.cloneNode(true);
      wm.style.top = `${Math.random() * 80 + 10}%`;
      wm.style.left = `${Math.random() * 80 + 10}%`;
      wm.style.transform = `rotate(${Math.random() * 60 - 30}deg)`;
      document.body.appendChild(wm);
    }
  }

  // Disable iframe embedding (clickjacking protection)
  if (window.top !== window.self) {
    showSecurityWarning('⚠️ This website cannot be embedded in iframes');
    window.top.location = window.self.location;
  }

  // Detect and block common scraping tools
  const userAgent = navigator.userAgent.toLowerCase();
  const blockedAgents = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python'];
  
  for (const agent of blockedAgents) {
    if (userAgent.includes(agent)) {
      document.body.innerHTML = '<h1>Access Denied</h1><p>Automated access is not permitted.</p>';
      throw new Error('Automated access detected');
    }
  }

  // Obfuscate email addresses and phone numbers
  function obfuscateContactInfo() {
    const emails = document.querySelectorAll('a[href^="mailto:"]');
    emails.forEach(email => {
      email.addEventListener('click', function(e) {
        e.preventDefault();
        const addr = this.href.replace('mailto:', '');
        navigator.clipboard.writeText(addr);
        showSecurityWarning('📧 Email copied to clipboard');
      });
    });
  }

  // Monitor for suspicious activity
  let clickCount = 0;
  let suspiciousActivity = false;

  document.addEventListener('click', function() {
    clickCount++;
    if (clickCount > 100 && !suspiciousActivity) {
      suspiciousActivity = true;
      showSecurityWarning('⚠️ Suspicious activity detected');
      console.clear();
    }
  });

  // Clear console periodically
  if (config.disableDevTools) {
    setInterval(function() {
      console.clear();
    }, 5000);
  }

  // Initialize security features when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      addWatermark();
      obfuscateContactInfo();
    });
  } else {
    addWatermark();
    obfuscateContactInfo();
  }

  // Add CSS to prevent text selection
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    
    input, textarea {
      -webkit-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
      user-select: text;
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
  `;
  document.head.appendChild(style);

  // Log security initialization
  console.log('%c🔒 Security Protection Active', 'color: #28a745; font-size: 16px; font-weight: bold;');
  console.log('%c⚠️ Unauthorized access or copying is prohibited', 'color: #dc3545; font-size: 14px;');
  console.log('%c© ShopEase - All rights reserved', 'color: #007bff; font-size: 12px;');

})();
