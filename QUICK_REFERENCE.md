# Quick Reference Guide - ShopEase v2.0.0

Fast lookup for file locations, API endpoints, and common tasks.

## Project Structure at a Glance

```
ShopEase/
├── Backend API        (Node.js + Express)
│   ├── server.js      - Main server entry point
│   ├── .env           - Configuration (JWT, DB, Mail)
│   ├── routes/        - API endpoints (/auth, /products, /cart, /orders, /admin)
│   ├── models/        - Database schemas (User, Product, Order, Payment)
│   ├── middleware/    - Auth, CORS, rate limiting
│   ├── config/        - Database connection
│   └── services/      - Business logic (email, payments)
│
├── Frontend           (HTML/CSS/JavaScript)
│   ├── index.html         - Login page
│   ├── Homepage.html      - Product listing
│   ├── dashboard.html     - User dashboard
│   ├── payment.html       - Payment gateway
│   ├── orders.html        - Order history
│   ├── admin-*.html       - Admin pages
│   ├── script.js          - Frontend app logic
│   ├── style.css          - Global styles
│   ├── assets/js/         - JavaScript libraries
│   │   ├── api-client.js  - ✨ NEW: Unified API client
│   │   └── utils.js       - ✨ NEW: UI & form utilities
│   └── assets/images/     - Images
│
└── Documentation
    ├── README.md                  - Project overview
    ├── INTEGRATION_GUIDE.md        - ✨ NEW: How to use API client
    ├── TESTING_CHECKLIST.md        - ✨ NEW: QA test cases
    ├── DEPLOYMENT.md              - Production guide
    └── backend/README.md          - API documentation
```

---

## Quick Start Commands

```bash
# Install backend dependencies
cd backend
npm install

# Start backend server
npm start                  # Production mode
npm run dev              # Development mode with auto-reload

# Test backend
npm test

# From root directory - static file server for frontend
npx http-server -p 8000

# Or use Python
python -m http.server 8000
```

**Access Points:**
- Frontend: `http://localhost:8000`
- Backend API: `http://localhost:5000/api`
- MongoDB: `mongodb://localhost:27017/shopease`

---

## Environment Variables

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/shopease

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-different-refresh-secret-key

# Email
MAIL_USER=your-gmail@gmail.com
MAIL_PASS=your-app-specific-password

# Payment Gateway
PAYSTACK_SECRET_KEY=pk_live_your_paystack_secret_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8000

# Email notifications
NOTIFY_EMAIL=yourteam@shopease.com
```

---

## API Endpoints Quick Reference

### Authentication
```
POST   /api/auth/register      - Create new user
POST   /api/auth/login         - Login user
POST   /api/auth/refresh       - Refresh access token
POST   /api/auth/logout        - Logout user
```

### Products
```
GET    /api/products           - Get all products (with pagination)
GET    /api/products/:id       - Get single product
GET    /api/products/search    - Search products
GET    /api/categories         - Get categories
POST   /api/products           - Create product (admin only)
PUT    /api/products/:id       - Update product (admin only)
DELETE /api/products/:id       - Delete product (admin only)
```

### Cart
```
GET    /api/cart               - Get user's cart
POST   /api/cart               - Add to cart
PUT    /api/cart/:productId    - Update cart item
DELETE /api/cart/:productId    - Remove from cart
DELETE /api/cart               - Clear cart
```

### Orders
```
POST   /api/orders             - Create order
GET    /api/orders             - Get user's orders
GET    /api/orders/:id         - Get order details
PUT    /api/orders/:id/status  - Update order status (admin)
POST   /api/orders/:id/cancel  - Cancel order
POST   /api/orders/:id/refund  - Request refund
```

### Payments
```
POST   /api/payments/initiate  - Initiate payment
GET    /api/payments/verify    - Verify payment
GET    /api/payments/:orderId  - Get payment info
```

### Users
```
GET    /api/users/profile      - Get current user
PUT    /api/users/profile      - Update profile
POST   /api/users/password     - Change password
GET    /api/users/addresses    - Get user addresses
POST   /api/users/addresses    - Add address
PUT    /api/users/addresses/:id - Update address
DELETE /api/users/addresses/:id - Delete address
```

### Admin
```
GET    /api/admin/stats        - Get dashboard stats
GET    /api/admin/users        - Get all users
GET    /api/admin/orders       - Get all orders
POST   /api/admin/products     - Create product
PUT    /api/admin/products/:id - Update product
DELETE /api/admin/products/:id - Delete product
```

---

## Frontend API Client Usage

### Initialize (Automatic)

```javascript
// Automatically created as window.api
const api = window.api;  // Already initialized

// OR create custom instance
const customAPI = new ShopEaseAPI('https://api.example.com');
```

### Common Operations

```javascript
// Authentication
await api.login(email, password);
await api.register({username, email, password, firstName, lastName});
await api.logout();

// Products
const products = await api.getProducts({category, page, limit});
const product = await api.getProduct(productId);
const search = await api.searchProducts(query);

// Cart
const cart = await api.getCart();
await api.addToCart(productId, quantity);
await api.removeFromCart(productId);

// Orders
await api.createOrder({items, shippingAddress, paymentMethod});
const orders = await api.getOrders({status});
await api.cancelOrder(orderId, reason);

// User
const user = await api.getStoredUser();
await api.updateProfile({firstName, lastName, phone});
```

### Error Handling

```javascript
try {
  const result = await api.someOperation();
} catch (error) {
  console.log(error.status);    // HTTP status code
  console.log(error.message);   // Error message
  console.log(error.data);      // API response data
}
```

### Check Authentication

```javascript
if (api.isAuthenticated()) {
  const user = api.getStoredUser();
  console.log(user.email);
} else {
  window.location.href = '/index.html';
}
```

---

## Utility Functions Quick Reference

### UI Helper

```javascript
// Notifications
UIHelper.showToast(message, type);  // 'success', 'error', 'warning', 'info'

// Loading
UIHelper.showLoading(message);
UIHelper.hideLoading();

// Formatting
UIHelper.formatCurrency(amount);      // ₦50,000.00
UIHelper.formatNumber(number);        // 50,000
UIHelper.formatDate(date, 'short');   // 27/02/2026
UIHelper.setButtonLoading(button, isLoading);

// Other
UIHelper.copyToClipboard(text);
UIHelper.scrollToElement(selector);
UIHelper.debounce(fn, delay);
```

### Validator

```javascript
// Validate entire form
Validator.validateForm(formElement);

// Individual rules
Validator.rules.email(value);
Validator.rules.phone(value);
Validator.rules.password(value);
Validator.rules.creditCard(value);
Validator.rules.username(value);

// Display errors
Validator.displayErrors(formElement, errors);
Validator.clearErrors(formElement);
```

### Storage Manager

```javascript
// Save data with expiration (minutes)
StorageManager.setItem('key', value, 60);

// Get item (null if expired)
StorageManager.getItem('key');

// Remove item
StorageManager.removeItem('key');

// Clear all
StorageManager.clear();
```

---

## Key Files Reference

| File | Purpose | Type |
|------|---------|------|
| [server.js](backend/server.js) | Express server setup | Backend |
| [middleware/auth.js](backend/middleware/auth.js) | JWT authentication | Backend |
| [models/User.js](backend/models/User.js) | User schema | Backend |
| [routes/auth.js](backend/routes/auth.js) | Auth endpoints | Backend |
| [assets/js/api-client.js](assets/js/api-client.js) | ✨ API client | Frontend |
| [assets/js/utils.js](assets/js/utils.js) | ✨ Utilities | Frontend |
| [script.js](script.js) | Main app logic | Frontend |
| [style.css](style.css) | Global styles | Frontend |
| [.env](backend/.env) | Configuration | Config |

---

## Common Tasks

### Add New Endpoint

1. Create route in `backend/routes/newFeature.js`
2. Mount in `backend/server.js`
3. Add method to `api-client.js` ShopEaseAPI class
4. Use in frontend with `await api.methodName()`

### Add New Model

1. Create file in `backend/models/ModelName.js`
2. Define Mongoose schema and export
3. Use in routes with `const Model = require(...)`

### Add Form Validation

```html
<input 
  name="email" 
  data-validate="email|required"
  placeholder="Email"
>
```

### Handle Loading State

```javascript
const btn = document.querySelector('#submitBtn');
UIHelper.setButtonLoading(btn, true);
try {
  await api.someOperation();
} finally {
  UIHelper.setButtonLoading(btn, false);
}
```

### Show Toast Notification

```javascript
UIHelper.showToast('Operation successful!', 'success');
```

---

## Database

### MongoDB

**Development:**
```bash
# Local MongoDB
mongod

# Access shell
mongo shopease
```

**Production:**
- MongoDB Atlas cloud database
- See [DEPLOYMENT.md](DEPLOYMENT.md) for setup

### Collections

- `users` - User accounts
- `products` - Product catalog
- `carts` - Shopping carts
- `orders` - Orders
- `payments` - Payment records

---

## Security Checklist

- [ ] JWT_SECRET changed in .env
- [ ] JWT_REFRESH_SECRET is unique and strong
- [ ] MAIL credentials are app-specific passwords
- [ ] PAYSTACK_SECRET_KEY is live key (production only)
- [ ] CORS properly restricted
- [ ] Rate limiting enabled
- [ ] HTTPS enabled in production
- [ ] Cookies set with HttpOnly flag
- [ ] Input validation on all forms
- [ ] SQL injection prevention via Mongoose

---

## Troubleshooting

### 401 Unauthorized Error

**Cause**: Missing/invalid token
**Solution**: 
```javascript
// Check if logged in
if (!api.isAuthenticated()) {
  window.location.href = '/index.html';
}
```

### CORS Errors

**Cause**: Frontend and backend on different origins
**Solution**: Update FRONTEND_URL in .env

### Database Connection Error

**Cause**: MongoDB not running or wrong URI
**Solution**: 
```bash
# Check MongoDB
mongod
# Or update MONGODB_URI in .env
```

### Cart Sync Issues

**Cause**: Using outdated cache
**Solution**: 
```javascript
// Clear and refresh
await api.clearCart();
const fresh = await api.getCart();
```

### Token Expiration

**Cause**: Access token expired
**Solution**: Automatic - client-side refresh handles it

---

## Performance Tips

1. Use debouncing for search: `UIHelper.debounce(fn, 500)`
2. Lazy load images: Add `loading="lazy"` to `<img>` tags
3. Use CSS sprites for icons
4. Minify JavaScript/CSS in production
5. Enable gzip compression on server
6. Use CDN for static assets

---

## Support & Documentation

- [Full API Reference](backend/README.md)
- [Integration Guide](INTEGRATION_GUIDE.md)
- [Testing Checklist](TESTING_CHECKLIST.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Frontend Configuration](FRONTEND_CONFIG.md)

---

**Last Updated**: February 27, 2026  
**Version**: 2.0.0  
**Status**: Production Ready
