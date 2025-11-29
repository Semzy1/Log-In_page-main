(function(){
  const themeToggle = document.getElementById('themeToggle');

  // Show toast container and toast function
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '1050';
    document.body.appendChild(toastContainer);
  }
  function showToast(message, type='info', duration=3000) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.minWidth = '200px';
    toast.style.marginBottom = '10px';
    toast.style.padding = '12px 18px';
    toast.style.borderRadius = '6px';
    toast.style.color = '#fff';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toast.style.opacity = '1';
    toast.style.transition = 'opacity 0.5s ease';

    switch(type) {
      case 'success': toast.style.backgroundColor = '#28a745'; break;
      case 'error': toast.style.backgroundColor = '#dc3545'; break;
      case 'warning': toast.style.backgroundColor = '#ffc107'; toast.style.color = '#212529'; break;
      default: toast.style.backgroundColor = '#007bff'; break;
    }

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 500);
    }, duration);
  }

  // Dark/light theme toggle implementation
  function setTheme(isDark) {
    if(isDark){
      document.documentElement.setAttribute('data-theme', 'dark');
      if(themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      try { localStorage.setItem('theme', 'dark'); } catch (_) {}
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      if(themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      try { localStorage.setItem('theme', 'light'); } catch (_) {}
    }
  }

  // Initialize theme on page load
  const savedTheme = (function(){
    try {
      return localStorage.getItem('theme') || 'light';
    } catch (e) {
      return 'light';
    }
  })();
  setTheme(savedTheme === 'dark');

  // Theme toggle button click event
  if(themeToggle){
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      setTheme(currentTheme !== 'dark');
    });
  }

  // Payment method toggle using dynamic payment panels
  const paymentForm = document.getElementById('paymentForm');
  const paymentTabsContainer = document.getElementById('paymentTabsContainer');
  const paymentPanelsContainer = document.getElementById('paymentPanelsContainer');

  function updatePaymentMethodVisibility() {
    const method = paymentForm.paymentMethod.value;
    if (!paymentPanelsContainer) return;
    const panels = paymentPanelsContainer.querySelectorAll('.payment-panel');

    panels.forEach(panel => {
      if (panel.id === method) {
        panel.classList.add('active');
        panel.hidden = false;
      } else {
        panel.classList.remove('active');
        panel.hidden = true;
      }
    });

    // Update active tab
    const tabs = paymentTabsContainer.querySelectorAll('.payment-tab');
    tabs.forEach(tab => {
      if (tab.dataset.tab === method) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  if(paymentTabsContainer){
    paymentTabsContainer.querySelectorAll('.payment-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const method = tab.dataset.tab;
        if(paymentForm){
          const radio = paymentForm.querySelector(`input[name="paymentMethod"][value="${method}"]`);
          if(radio){
            radio.checked = true;
            updatePaymentMethodVisibility();
          }
        }
      });
    });
  }

  if (paymentForm) {
    // Initialize payment method visibility on page load
    updatePaymentMethodVisibility();

    // Load order id from URL query param
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    const orderItemsDiv = document.getElementById('orderItems');
    const orderTotalSpan = document.querySelector('.order-total');
    const orderErrorDiv = document.getElementById('orderError');

    let currentOrder = null;

    if (orderId) {
      const orders = JSON.parse(localStorage.getItem('shop_orders') || '[]');
      currentOrder = orders.find(o => o.id === orderId);
      if (currentOrder) {
        if (orderItemsDiv) {
          const formatter = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 });
          orderItemsDiv.innerHTML = currentOrder.items.map(it =>
            `<div>${it.qty}× ${it.title} (₦${formatter.format(Math.round(it.price))})</div>`
          ).join('');
        }
        if (orderTotalSpan) {
          const total = currentOrder.items.reduce((sum, it) => sum + (it.qty * it.price), 0);
          orderTotalSpan.textContent = `Total: ₦${total.toLocaleString('en-NG')}`;
        }
        if (orderErrorDiv) {
          orderErrorDiv.style.display = 'none';
          orderErrorDiv.textContent = '';
        }
      } else {
        if (orderItemsDiv) orderItemsDiv.textContent = '';
        if (orderTotalSpan) orderTotalSpan.textContent = 'Total: ₦0.00';
        if (orderErrorDiv) {
          orderErrorDiv.style.display = 'block';
          orderErrorDiv.textContent = 'Order not found. Please check the order ID.';
        }
      }
    } else {
      if (orderItemsDiv) orderItemsDiv.textContent = '';
      if (orderTotalSpan) orderTotalSpan.textContent = 'Total: ₦0.00';
      if (orderErrorDiv) {
        orderErrorDiv.style.display = 'block';
        orderErrorDiv.textContent = 'No order selected. Please select an order to pay for.';
      }
    }

    // PayPal button handler
    const paypalBtn = document.getElementById('paypalPayBtn');
    if (paypalBtn) {
      paypalBtn.addEventListener('click', () => {
        if (!currentOrder) {
          showToast('No valid order selected to pay for.', 'error');
          return;
        }
        showToast('Redirecting to PayPal...', 'info', 1500);
        setTimeout(() => {
          showToast('Payment completed via PayPal (simulated)', 'success');
          paymentForm.reset();
          updatePaymentMethodVisibility();

          const orders = JSON.parse(localStorage.getItem('shop_orders') || '[]');
          const index = orders.findIndex(o => o.id === orderId);
          if (index !== -1) {
            orders[index].status = 'paid';
            localStorage.setItem('shop_orders', JSON.stringify(orders));
          }
        }, 3000);
      });
    }

    // Apple Pay button handler
    const applePayBtn = document.getElementById('applePayBtn');
    if (applePayBtn) {
      applePayBtn.addEventListener('click', () => {
        if (!currentOrder) {
          showToast('No valid order selected to pay for.', 'error');
          return;
        }
        showToast('Processing Apple Pay payment...', 'info', 1500);
        setTimeout(() => {
          showToast('Payment completed via Apple Pay (simulated)', 'success');
          paymentForm.reset();
          updatePaymentMethodVisibility();

          const orders = JSON.parse(localStorage.getItem('shop_orders') || '[]');
          const index = orders.findIndex(o => o.id === orderId);
          if (index !== -1) {
            orders[index].status = 'paid';
            localStorage.setItem('shop_orders', JSON.stringify(orders));
          }
        }, 3000);
      });
    }

    // Google Pay button handler
    const googlePayBtn = document.getElementById('googlePayBtn');
    if (googlePayBtn) {
      googlePayBtn.addEventListener('click', () => {
        if (!currentOrder) {
          showToast('No valid order selected to pay for.', 'error');
          return;
        }
        showToast('Processing Google Pay payment...', 'info', 1500);
        setTimeout(() => {
          showToast('Payment completed via Google Pay (simulated)', 'success');
          paymentForm.reset();
          updatePaymentMethodVisibility();

          const orders = JSON.parse(localStorage.getItem('shop_orders') || '[]');
          const index = orders.findIndex(o => o.id === orderId);
          if (index !== -1) {
            orders[index].status = 'paid';
            localStorage.setItem('shop_orders', JSON.stringify(orders));
          }
        }, 3000);
      });
    }

    paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const method = paymentForm.paymentMethod.value;
      if (!currentOrder) {
        showToast('No valid order selected to pay for.', 'error');
        return;
      }

      if (method === 'flutterwave') {
        const total = currentOrder.items.reduce((sum, it) => sum + (it.qty * it.price), 0);
        const config = {
          public_key: 'FLWPUBK_TEST-9db28ff78f60b9570e65e4080e83b795-X',
          tx_ref: `shopEase-${orderId}-${Date.now()}`,
          amount: total,
          currency: 'NGN',
          payment_options: 'card,mobilemoney,ussd',
          customer: {
            email: 'customer@example.com', // In real app, get from user data
            phone_number: '08012345678', // Placeholder
            name: 'Customer Name', // Placeholder
          },
          customizations: {
            title: 'ShopEase Payment',
            description: 'Payment for order ' + orderId,
            logo: 'https://via.placeholder.com/150', // Placeholder logo
          },
          callback: function (data) {
            console.log(data);
            showToast('Payment successful via Flutterwave!', 'success');
            paymentForm.reset();
            updatePaymentMethodVisibility();

            const orders = JSON.parse(localStorage.getItem('shop_orders') || '[]');
            const index = orders.findIndex(o => o.id === orderId);
            if (index !== -1) {
              orders[index].status = 'paid';
              localStorage.setItem('shop_orders', JSON.stringify(orders));
            }

            // Redirect to dashboard page after successful payment
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 2000);
          },
          onclose: function () {
            showToast('Payment cancelled.', 'warning');
          },
        };
        FlutterwaveCheckout(config);
      } else if (method === 'paystack') {
        // Simulated Paystack payment (demo mode)
        const total = currentOrder.items.reduce((sum, it) => sum + (it.qty * it.price), 0);
        
        showToast('Processing Paystack payment...', 'info', 1500);
        console.log('Simulating Paystack payment for amount:', total);
        
        setTimeout(() => {
          const reference = 'PSK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
          console.log('Paystack payment completed (simulated). Reference:', reference);
          
          showToast('Payment successful via Paystack! Reference: ' + reference, 'success');
          paymentForm.reset();
          updatePaymentMethodVisibility();

          const orders = JSON.parse(localStorage.getItem('shop_orders') || '[]');
          const index = orders.findIndex(o => o.id === orderId);
          if (index !== -1) {
            orders[index].status = 'paid';
            orders[index].paymentReference = reference;
            orders[index].paymentMethod = 'Paystack';
            localStorage.setItem('shop_orders', JSON.stringify(orders));
          }

          // Redirect to dashboard page after successful payment
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 2000);
        }, 2000);
      } else {
        showToast('Selected payment method is not supported.', 'error');
      }
    });
  }

  // Luhn algorithm for card number validation
  function luhnCheck(cardNumber) {
    let sum = 0;
    let shouldDouble = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  // Expose any other functions if needed
})();
