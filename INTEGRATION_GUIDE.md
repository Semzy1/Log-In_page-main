# Frontend-Backend Integration Guide

Quick integration guide for using the new API client and utilities.

## Table of Contents

1. [API Client Setup](#api-client-setup)
2. [Authentication](#authentication)
3. [Making API Calls](#making-api-calls)
4. [Error Handling](#error-handling)
5. [UI Utilities](#ui-utilities)
6. [Form Validation](#form-validation)
7. [Common Patterns](#common-patterns)
8. [Debugging](#debugging)

## API Client Setup

### 1. Include Files in HTML

```html
<!-- Include API client and utilities -->
<script src="assets/js/api-client.js"></script>
<script src="assets/js/utils.js"></script>
```

### 2. Configure API URL (Optional)

The API client automatically detects the backend URL, but you can override it:

```javascript
// Create custom instance
const customAPI = new ShopEaseAPI('https://your-api-url.com/api');
```

### 3. Global Instance

A global instance is automatically created as `window.api`:

```javascript
await api.login('user@example.com', 'password');
```

## Authentication

### Login

```javascript
try {
  UIHelper.showLoading('Logging in...');
  
  const result = await api.login('user@example.com', 'password');
  
  if (result.success) {
    UIHelper.showToast('Login successful!', 'success');
    // User data is automatically stored
    const user = api.getStoredUser();
    console.log('Welcome,', user.firstName);
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
  }
} catch (error) {
  UIHelper.showToast(error.message, 'error');
} finally {
  UIHelper.hideLoading();
}
```

### Register

```javascript
try {
  const result = await api.register({
    username: 'newuser',
    email: 'user@example.com',
    password: 'SecurePass123',
    firstName: 'John',
    lastName: 'Doe'
  });
  
  if (result.success) {
    UIHelper.showToast('Registration successful!', 'success');
    // Tokens are automatically stored
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
  }
} catch (error) {
  UIHelper.showToast(error.message, 'error');
}
```

### Check Authentication

```javascript
if (api.isAuthenticated()) {
  // User is logged in
  const user = api.getStoredUser();
  console.log('User:', user.email);
} else {
  // User is not logged in
  window.location.href = 'index.html';
}
```

### Logout

```javascript
await api.logout();
UIHelper.showToast('Logged out successfully', 'success');
window.location.href = 'index.html';
```

## Making API Calls

### Product Operations

```javascript
// Get all products
const result = await api.getProducts({ category: 'electronics', page: 1 });
console.log(result.data.products);

// Get specific product
const product = await api.getProduct('product-id');

// Search products
const search = await api.searchProducts('laptop', { category: 'electronics' });

// Get categories
const categories = await api.getCategories();
```

### Cart Operations

```javascript
// Get cart
const cart = await api.getCart();
console.log('Cart items:', cart.data.items);
console.log('Total:', cart.data.summary.total);

// Add to cart
await api.addToCart('product-id', 2);

// Update quantity
await api.updateCartItem('product-id', 5);

// Remove from cart
await api.removeFromCart('product-id');

// Clear cart
await api.clearCart();
```

### Order Operations

```javascript
// Create order
const order = await api.createOrder({
  items: [
    { productId: 'id1', quantity: 2 },
    { productId: 'id2', quantity: 1 }
  ],
  shippingAddress: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '08012345678',
    address: '123 Main St',
    city: 'Lagos',
    state: 'Lagos',
    postalCode: '100001'
  },
  paymentMethod: 'card'
});

// Get user's orders
const orders = await api.getOrders({ status: 'pending' });

// Get single order
const order = await api.getOrder('order-id');

// Cancel order
await api.cancelOrder('order-id', 'Changed my mind');
```

### Payment Operations

```javascript
// Initiate payment
const payment = await api.initiatePayment('order-id', 'flutterwave');

// Verify payment
const verified = await api.verifyPayment('payment-id');

// Get payment info
const paymentInfo = await api.getPaymentInfo('order-id');
```

## Error Handling

### Try-Catch Pattern

```javascript
try {
  const result = await api.getProducts();
  // Process result
  console.log(result.data.products);
} catch (error) {
  // Error object has: message, status, data
  console.error('Error status:', error.status);
  console.error('Error message:', error.message);
  console.error('API response:', error.data);
  
  // Handle specific errors
  if (error.status === 401) {
    // Authentication failed
    api.clearTokens();
    window.location.href = '/index.html';
  } else if (error.status === 404) {
    // Not found
    UIHelper.showToast('Product not found', 'error');
  } else {
    UIHelper.showToast(error.message, 'error');
  }
}
```

### Automatic Token Refresh

Token refresh is handled automatically - you don't need to do anything:

```javascript
// If token expires, it will automatically refresh
const result = await api.getCart();  // Works even if token is about to expire
```

## UI Utilities

### Toast Notifications

```javascript
// Success
UIHelper.showToast('Operation successful!', 'success');

// Error
UIHelper.showToast('Something went wrong', 'error');

// Warning
UIHelper.showToast('Please confirm', 'warning');

// Info
UIHelper.showToast('Loading data...', 'info', 5000);  // 5 second duration
```

### Loading Indicator

```javascript
UIHelper.showLoading('Processing your order...');

// Do some work
await someAsyncOperation();

UIHelper.hideLoading();
```

### Format Currency

```javascript
const price = 50000;
console.log(UIHelper.formatCurrency(price));  // ₦50,000.00

console.log(UIHelper.formatNumber(price));  // 50,000
```

### Format Date

```javascript
const date = new Date();
console.log(UIHelper.formatDate(date, 'short'));  // 27/02/2026
console.log(UIHelper.formatDate(date, 'long'));   // 27 February 2026, 14:30
```

### Button Loading State

```javascript
const button = document.querySelector('#submitBtn');

// Show loading
UIHelper.setButtonLoading(button, true);

// Do async work
await api.createOrder(orderData);

// Hide loading
UIHelper.setButtonLoading(button, false);
```

### Scroll to Element

```javascript
// Scroll to error message
UIHelper.scrollToElement('.error-message', 100);  // 100px offset
```

### Copy to Clipboard

```javascript
UIHelper.copyToClipboard('Text to copy');
// Shows toast: "Copied to clipboard!"
```

## Form Validation

### Validate Form

```javascript
const form = document.querySelector('#registrationForm');

// Add data-validate attributes to inputs
// <input name="email" data-validate="email|required">

const validation = Validator.validateForm(form);

if (!validation.valid) {
  Validator.displayErrors(form, validation.errors);
} else {
  // Form is valid, submit
}
```

### Available Validation Rules

```javascript
// Individual validation
Validator.rules.email('test@example.com');        // true/false
Validator.rules.phone('08012345678');             // true/false
Validator.rules.creditCard('4532111111111111');   // true/false
Validator.rules.password('SecurePass123');        // true/false
Validator.rules.username('john_doe');             // true/false
Validator.rules.url('https://example.com');       // true/false
Validator.rules.zipcode('100001');                // true/false
Validator.rules.cvv('123');                       // true/false
```

### HTML Form Example

```html
<form id="checkoutForm">
  <input 
    type="email" 
    name="email" 
    data-validate="email|required"
    placeholder="Email address"
  >
  
  <input 
    type="password" 
    name="password" 
    data-validate="password|required"
    placeholder="Password"
  >
  
  <input 
    type="text" 
    name="phone" 
    data-validate="phone|required"
    placeholder="Phone number"
  >
  
  <button type="submit">Submit</button>
</form>

<script>
const form = document.querySelector('#checkoutForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  Validator.clearErrors(form);
  const validation = Validator.validateForm(form);
  
  if (!validation.valid) {
    Validator.displayErrors(form, validation.errors);
  } else {
    // Submit form
    api.register({...formData});
  }
});
</script>
```

## Storage Manager

### Save Data with Expiration

```javascript
// Save for 60 minutes
StorageManager.setItem('cart-items', cartData, 60);

// Get item (returns null if expired)
const cart = StorageManager.getItem('cart-items');

// Remove item
StorageManager.removeItem('cart-items');

// Clear all
StorageManager.clear();
```

## Common Patterns

### Complete Checkout Flow

```javascript
async function checkout() {
  try {
    // Check authentication
    if (!api.isAuthenticated()) {
      UIHelper.showToast('Please login first', 'warning');
      return;
    }

    const button = document.querySelector('#checkoutBtn');
    UIHelper.setButtonLoading(button, true);

    // Get cart
    const cart = await api.getCart();
    if (!cart.data.items.length) {
      UIHelper.showToast('Cart is empty', 'warning');
      return;
    }

    // Create order
    const orderResult = await api.createOrder({
      items: cart.data.items.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      })),
      shippingAddress: getShippingAddress(),
      paymentMethod: getPaymentMethod()
    });

    UIHelper.showToast('Order created! Processing payment...', 'success');

    // Redirect to payment page
    window.location.href = `payment.html?orderId=${orderResult.data.order._id}`;

  } catch (error) {
    UIHelper.showToast(error.message, 'error');
  } finally {
    UIHelper.setButtonLoading(button, false);
  }
}
```

### Admin Dashboard Setup

```javascript
async function initAdminDashboard() {
  // Verify admin access
  if (!api.isAdmin()) {
    UIHelper.showToast('Admin access required', 'error');
    window.location.href = '/index.html';
    return;
  }

  try {
    // Load dashboard stats
    const stats = await api.getDashboardStats();
    
    // Update UI with stats
    document.querySelector('#totalUsers').textContent = stats.data.totalUsers;
    document.querySelector('#totalOrders').textContent = stats.data.totalOrders;
    document.querySelector('#totalRevenue').textContent = 
      UIHelper.formatCurrency(stats.data.totalRevenue);

  } catch (error) {
    UIHelper.showToast('Failed to load dashboard', 'error');
  }
}
```

### Product Search with Debounce

```javascript
const searchInput = document.querySelector('#searchInput');

const handleSearch = UIHelper.debounce(async (query) => {
  if (!query) {
    // Clear results
    return;
  }

  try {
    const results = await api.searchProducts(query);
    displayResults(results.data.products);
  } catch (error) {
    UIHelper.showToast('Search failed', 'error');
  }
}, 500);  // Wait 500ms after user stops typing

searchInput.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});
```

## Debugging

### Enable Debug Logging

The API client logs important events to the console:

```javascript
// Check if authenticated
console.log('Authenticated:', api.isAuthenticated());

// Get stored user
console.log('User:', api.getStoredUser());

// Get stored token
console.log('Token:', api.getStoredToken());
```

### Network Debugging

Use browser DevTools to monitor network requests:

1. **F12** or **Right-click > Inspect**
2. Go to **Network** tab
3. Filter by **XHR** (XMLHttpRequest)
4. Look for API calls to `/api/*`

### Check Token Validity

```javascript
// Decode JWT token (for debugging only)
function decodeToken(token) {
  const parts = token.split('.');
  const payload = parts[1];
  return JSON.parse(atob(payload));
}

const decoded = decodeToken(api.getStoredToken());
console.log('Token expires:', new Date(decoded.exp * 1000));
```

---

**Last Updated**: February 27, 2026
**Version**: 2.0.0
