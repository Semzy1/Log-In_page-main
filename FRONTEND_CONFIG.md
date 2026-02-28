# Frontend Configuration Guide

## Environment Setup

### Local Development

Create a `.env.local` file in the project root:

```bash
# Backend API URL (defaults to http://localhost:5000/api if not set)
REACT_APP_API_URL=http://localhost:5000/api

# Feature flags
REACT_APP_DEBUG=true
REACT_APP_ENV=development
```

### Production

For production deployment:

```bash
# Use your production backend URL
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_DEBUG=false
REACT_APP_ENV=production
```

## API Client Configuration

The API client automatically detects the backend URL based on the environment:

1. **Development**: `http://localhost:5000/api`
2. **Production**: `https://yourdomain.com/api`

You can override this by setting `REACT_APP_API_URL` in your environment.

## Using the API Client

### Global Instance

The API client is available globally as `window.api`:

```javascript
// Login
const result = await api.login('user@example.com', 'password');

// Get products
const products = await api.getProducts({ category: 'electronics' });

// Add to cart
await api.addToCart('product-id', 2);

// Create order
const order = await api.createOrder({
  items: [...],
  shippingAddress: {...}
});
```

### Authentication

Tokens are automatically managed and stored in localStorage:
- Access token: `shopease_token`
- Refresh token: `shopease_refresh_token`
- User data: `shopease_user`

### Error Handling

```javascript
try {
  const result = await api.login(email, password);
} catch (error) {
  console.error('Login failed:', error.message);
  // error.status contains HTTP status code
  // error.data contains API response
}
```

## Frontend Structure

```
├── Homepage.html                 # Main homepage
├── index.html                    # Redirect to homepage
├── admin-login.html             # Admin login page
├── admin-products.html          # Admin product management
├── dashboard.html               # User dashboard
├── payment.html                 # Payment page
├── orders.html                  # Orders page
├── admin-login.html            # Admin login
├── style.css                   # Global styles
├── script.js                   # Global scripts
├── assets/
│   ├── js/
│   │   ├── api-client.js      # NEW: API client
│   │   ├── utils.js           # NEW: Utility functions
│   │   └── products.js        # Product data
│   └── images/                # Product images
└── paymentTabDynamic.js       # Payment tab functionality
```

## Best Practices

### 1. Always Use the API Client

❌ **Don't do:**
```javascript
// Direct fetch calls (deprecated)
fetch('http://localhost:5000/api/products')
```

✅ **Do:**
```javascript
// Use the API client
const products = await api.getProducts();
```

### 2. Error Handling

Always wrap API calls in try-catch:

```javascript
try {
  UIHelper.showLoading('Processing...');
  const result = await api.createOrder(orderData);
  UIHelper.showToast('Order created successfully!', 'success');
} catch (error) {
  UIHelper.showToast(error.message || 'An error occurred', 'error');
} finally {
  UIHelper.hideLoading();
}
```

### 3. Authentication Checks

Check authentication before protected operations:

```javascript
if (!api.isAuthenticated()) {
  UIHelper.showToast('Please login first', 'warning');
  window.location.href = '/index.html';
  return;
}
```

### 4. Form Validation

Use the built-in validator:

```javascript
const validation = Validator.validateForm(formElement);
if (!validation.valid) {
  Validator.displayErrors(formElement, validation.errors);
  return;
}
```

### 5. Loading States

Always indicate loading state to users:

```javascript
const button = document.querySelector('button');
UIHelper.setButtonLoading(button, true);

try {
  await api.login(email, password);
} finally {
  UIHelper.setButtonLoading(button, false);
}
```

## Keyboard Shortcuts & Accessibility

- **Theme Toggle**: Click the theme icon (top-right)
- **Escape**: Cancel modals/dialogs
- **Tab**: Navigate through form fields
- **Enter**: Submit forms
- **Alt + S**: Focus search
- **Alt + C**: Focus cart

## Performance Tips

1. **Image Optimization**
   - Use WebP format with fallbacks
   - Lazy load images below the fold
   - Use appropriate image sizes

2. **Bundle Size**
   - Tree-shake unused code
   - Defer non-critical JS
   - Minify production builds

3. **Caching**
   - Use browser caching headers
   - Cache API responses with `StorageManager`
   - Clear old cache on app updates

## Testing

### Unit Tests

```javascript
// Test API client
const testAPI = new ShopEaseAPI('http://test-server:5000/api');
const result = await testAPI.login('test@example.com', 'password');
```

### Integration Tests

Use tools like Cypress or Playwright:

```bash
npm install --save-dev cypress
npx cypress open
```

### Manual Testing Checklist

- [ ] Login/Register flow
- [ ] Product browsing and filtering
- [ ] Cart operations
- [ ] Checkout process
- [ ] Payment processing
- [ ] Order tracking
- [ ] Admin dashboard
- [ ] Dark/Light theme toggle
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Form validation
- [ ] Error handling

## Troubleshooting

### CORS Errors

If you see CORS errors, ensure:
1. Backend is running on the correct port
2. `FRONTEND_URL` in backend `.env` matches your frontend URL
3. Refresh token is valid

### Token Expiration

The app automatically handles token refresh. If you see "Access denied" errors:
1. Clear browser cache and localStorage
2. Log in again
3. Check backend is handling refresh tokens properly

### API Connection Issues

1. Check backend is running: `npm start` in `/backend`
2. Verify API URL is correct in your environment
3. Check browser network tab for failed requests
4. Look at backend logs for errors

## Deployment Checklist

- [ ] Update `REACT_APP_API_URL` for production
- [ ] Set `REACT_APP_DEBUG=false`
- [ ] Minify CSS and JS
- [ ] Optimize images
- [ ] Set up HTTPS
- [ ] Configure CORS properly
- [ ] Update robots.txt
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor performance (Google Analytics, etc.)
- [ ] Test on mobile devices
- [ ] Test payment flows
- [ ] Verify email notifications

---

**Last Updated**: February 27, 2026
**Version**: 2.0.0
