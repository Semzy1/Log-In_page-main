# Testing Checklist - ShopEase v2.0.0

Comprehensive testing checklist for validating ShopEase functionality.

## Pre-Testing Checklist

- [ ] Node.js v16+ installed and verified
- [ ] MongoDB running locally or connection to MongoDB Atlas confirmed
- [ ] Backend dependencies installed: `npm install` in `/backend`
- [ ] Frontend files accessible: `assets/js/api-client.js`, `assets/js/utils.js` present
- [ ] `.env` file configured with:
  - [ ] `MONGODB_URI` pointing to valid database
  - [ ] `JWT_SECRET` set to a strong value
  - [ ] `JWT_REFRESH_SECRET` set to a different strong value
  - [ ] `MAIL_USER` and `MAIL_PASS` configured for email notifications
  - [ ] `PAYSTACK_SECRET_KEY` configured (can be test key)
- [ ] Backend server running: `npm start` or `npm run dev`
- [ ] Frontend server accessible on correct port

---

## Authentication Testing

### User Registration

- [ ] User can register with valid email
- [ ] User can register with valid password (8+ chars, mixed case, numbers)
- [ ] Username must be unique
  - [ ] Cannot register with existing username
  - [ ] Error message displayed clearly
- [ ] Email must be unique
  - [ ] Cannot register with existing email
  - [ ] Error message displayed clearly
- [ ] Password validation enforced
  - [ ] Less than 8 characters rejected
  - [ ] No numbers rejected
  - [ ] No uppercase rejected
  - [ ] No lowercase rejected
- [ ] First and last name required
- [ ] User tokens stored securely after registration
- [ ] User redirected to dashboard after successful registration

### User Login

- [ ] User can login with correct email and password
- [ ] User cannot login with incorrect password
  - [ ] Error message: "Invalid credentials"
- [ ] User cannot login with non-existent email
  - [ ] Error message: "Invalid credentials"
- [ ] Tokens stored after successful login
- [ ] User redirected to dashboard
- [ ] Remember-me functionality works (if implemented)

### Token Management

- [ ] Access token stored in localStorage
- [ ] Refresh token stored in localStorage
- [ ] Tokens cleared on logout
- [ ] Expired token automatically refreshed
- [ ] Token refresh queue handles concurrent requests
- [ ] Failed refresh redirects to login page
- [ ] Token expiration time is accurate

### Logout

- [ ] User can logout successfully
- [ ] Tokens cleared from storage
- [ ] User redirected to login/home page
- [ ] User cannot access protected pages after logout
- [ ] Backend receives logout notification

---

## Product Testing

### Product Display

- [ ] All products displayed on homepage
- [ ] Product images load correctly
- [ ] Product titles, descriptions visible
- [ ] Product prices displayed in correct currency (₦)
- [ ] Product prices formatted with commas (₦50,000.00)
- [ ] Stock status displayed
  - [ ] In stock items clearly marked
  - [ ] Out of stock items disabled
- [ ] Product ratings/reviews displayed (if available)

### Product Filtering

- [ ] Products can be filtered by category
- [ ] Products can be filtered by price range
- [ ] Multiple filters can be applied simultaneously
- [ ] Filter results update correctly
- [ ] "Clear filters" button resets all selections

### Product Search

- [ ] Search bar is functional
- [ ] Search results appear for valid queries
- [ ] Search is case-insensitive
- [ ] Partial matches work (searching "lap" returns "laptop")
- [ ] No results message displayed for invalid search
- [ ] Search debounces correctly (not too many API calls)

### Product Details

- [ ] Detailed product modal/page opens
- [ ] All product information displayed correctly
- [ ] Product specifications visible
- [ ] Related products recommended
- [ ] User can add to cart from details page
- [ ] Quantity selector works (1-100)
- [ ] Unit price updates as quantity changes
- [ ] Total price calculation is correct

---

## Shopping Cart Testing

### Add to Cart

- [ ] Product can be added to cart
- [ ] Cart count badge updates
- [ ] Toast notification shows item added
- [ ] Quantity selector in product modal works
- [ ] Same product added twice merges quantities
- [ ] Out of stock items cannot be added

### View Cart

- [ ] Cart page displays all items
- [ ] Product images, names, prices shown
- [ ] Quantity controls (-, quantity input, +)
- [ ] Remove button removes items
- [ ] Cart total calculated correctly
- [ ] Cart subtotal, tax, shipping, total all correct
- [ ] Empty cart message shown when no items

### Update Cart

- [ ] Quantity can be increased
- [ ] Quantity can be decreased
- [ ] Cannot set quantity to 0 (removes item)
- [ ] Cannot set quantity above stock
- [ ] Cart total updates immediately
- [ ] Unit price and line total correct

### Clear Cart

- [ ] "Clear cart" button removes all items
- [ ] Confirmation dialog appears before clearing
- [ ] Cart count badge becomes 0
- [ ] Empty cart message displayed

### Cart Persistence

- [ ] Cart items persist on page refresh
- [ ] Cart items persist across browser sessions (if using localStorage)
- [ ] Cart items sync with backend

---

## Order Management Testing

### Create Order

- [ ] User must be logged in to checkout
- [ ] Shipping address form validates
  - [ ] Email validation works
  - [ ] Phone number validation works (Nigerian format)
  - [ ] Address field required
  - [ ] City/State field required
- [ ] Shipping method selection works
- [ ] Order total calculated correctly
- [ ] Order creates successfully
- [ ] Order confirmation displayed
- [ ] Order stored in database

### View Orders

- [ ] User can see list of their orders
- [ ] Order details page shows all items
- [ ] Order status displayed (pending, shipped, delivered, etc.)
- [ ] Order date/time displayed correctly
- [ ] Order total matches original
- [ ] Previous orders loaded from database

### Order Status

- [ ] Order status updates correctly in database
- [ ] User can see status changes
- [ ] Status change notifications sent (if email configured)
- [ ] Order timeline shows all status changes

### Order Actions

- [ ] User can cancel pending orders only
- [ ] Cancellation requires confirmation
- [ ] Cancelled orders marked as cancelled
- [ ] User can request refund on cancelled orders
- [ ] Admin can update order status

---

## Payment Testing

### Payment Initiation

- [ ] Payment gateway initializes correctly
- [ ] Payment UI loads without errors
- [ ] User redirected to payment provider (Paystack/Flutterwave)
- [ ] User can enter payment details
- [ ] Payment reference generated

### Payment Verification

- [ ] Payment status verified after completion
- [ ] Successful payment credited to order
- [ ] Failed payment handled gracefully
- [ ] User notified of payment status
- [ ] Email confirmation sent for successful payment

### Payment Security

- [ ] No card details stored in database
- [ ] Payment data encrypted in transit
- [ ] SSL/HTTPS used for payment pages
- [ ] PCI compliance standards followed

---

## User Profile Testing

### View Profile

- [ ] User can view their profile
- [ ] All user information displayed correctly
  - [ ] Name, email, phone
  - [ ] Username, registration date
  - [ ] Avatar/profile picture (if available)

### Edit Profile

- [ ] User can edit first name
- [ ] User can edit last name
- [ ] User can edit phone number
- [ ] User can upload profile picture
- [ ] Changes saved to database
- [ ] User notified of successful update

### Change Password

- [ ] Password change form validates
- [ ] Current password must be correct
- [ ] New password must meet requirements
- [ ] New password must differ from current
- [ ] Password changed successfully
- [ ] User notified to re-login

### Address Management

- [ ] User can add multiple addresses
- [ ] User can set default address
- [ ] User can edit addresses
- [ ] User can delete addresses
- [ ] Addresses persist across sessions

---

## Admin Dashboard Testing

### Admin Access

- [ ] Admin user can access dashboard
- [ ] Non-admin user cannot access dashboard
- [ ] Redirect to login for unauthorized access
- [ ] Admin-only menu items visible to admins only

### Dashboard Stats

- [ ] Total orders displayed
- [ ] Total users displayed
- [ ] Total revenue displayed
- [ ] Recent orders list shown
- [ ] Low stock alerts displayed

### Product Management

- [ ] Admin can add new products
  - [ ] All fields validated
  - [ ] Product image uploaded
  - [ ] Product visible after creation
- [ ] Admin can edit products
  - [ ] Attributes updated correctly
  - [ ] Price changes reflected
- [ ] Admin can delete products
  - [ ] Confirmation dialog shown
  - [ ] Product removed from listings
- [ ] Admin can manage inventory
  - [ ] Stock quantities updated
  - [ ] Low stock alerts triggered

### Order Management (Admin)

- [ ] Admin can view all orders
- [ ] Admin can filter orders by status
- [ ] Admin can update order status
- [ ] Admin can view order details
- [ ] Admin can process refunds
- [ ] Status changes notify customer

### User Management

- [ ] Admin can view all users
- [ ] Admin can view user details
- [ ] Admin can disable/enable users
- [ ] Admin can reset user passwords

---

## Error Handling Testing

### Network Errors

- [ ] Offline user sees error message
- [ ] Retry button appears for failed requests
- [ ] Failed requests don't corrupt data
- [ ] Connection restored automatically retries

### Validation Errors

- [ ] Client-side validation prevents invalid form submission
- [ ] Server-side validation rejects invalid data
- [ ] Error messages clear and specific
- [ ] Errors highlighted on correct form fields

### Authentication Errors

- [ ] 401 Unauthorized redirects to login
- [ ] 403 Forbidden shows access denied message
- [ ] 404 Not Found handled gracefully
- [ ] 500 Server error shows error message

### Toast Notifications

- [ ] Success toasts appear on successful actions
- [ ] Error toasts appear on failures
- [ ] Warning toasts appear for warnings
- [ ] Toasts auto-dismiss after 5 seconds
- [ ] Multiple toasts stack correctly

---

## Performance Testing

### Page Load

- [ ] Homepage loads in < 3 seconds
- [ ] Dashboard loads in < 3 seconds
- [ ] Product details loads in < 2 seconds
- [ ] First Contentful Paint < 1.5 seconds

### API Performance

- [ ] Product list API responds in < 500ms
- [ ] Search API responds in < 500ms
- [ ] Cart API responds in < 300ms
- [ ] Order API responds in < 500ms

### Resource Usage

- [ ] Images optimized and lazy-loaded
- [ ] No memory leaks in frontend
- [ ] No excessive API calls
- [ ] Debouncing works on user input

---

## Security Testing

### Input Validation

- [ ] SQL injection attempts blocked
- [ ] XSS attempts blocked
- [ ] Script tags in inputs sanitized
- [ ] Malicious file uploads blocked

### CORS

- [ ] Cross-origin requests properly restricted
- [ ] Preflight requests handled
- [ ] Credentials shared securely

### Rate Limiting

- [ ] Auth endpoints rate-limited to 5/15min
- [ ] API endpoints rate-limited to 100/15min
- [ ] Rate limit headers present in responses
- [ ] Excessive requests return 429 error

### Headers

- [ ] Content-Security-Policy header set
- [ ] X-Content-Type-Options header set
- [ ] X-Frame-Options header set
- [ ] Secure cookies set with HttpOnly flag

---

## Browser Compatibility Testing

Test on the following browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

For each browser, verify:
- [ ] All pages load correctly
- [ ] Forms submit correctly
- [ ] Animations smooth
- [ ] Responsive layout works
- [ ] Console shows no errors

---

## Mobile Responsiveness Testing

Test on:
- [ ] iPhone 12/13/14/15
- [ ] iPad
- [ ] Samsung Galaxy S20+
- [ ] Android tablets
- [ ] Chrome mobile emulator

Verify:
- [ ] Layout adapts to screen size
- [ ] Touch targets are large enough (44x44px)
- [ ] Navigation works on mobile
- [ ] Text is readable without zoom
- [ ] Images scale appropriately
- [ ] Forms are mobile-friendly

---

## Email Testing

- [ ] Registration confirmation email sent
- [ ] Password reset email sent
- [ ] Order confirmation email sent
- [ ] Shipping notification email sent
- [ ] Email formatting correct
- [ ] Links in emails work
- [ ] Plain text version provided

---

## Database Testing

### Data Integrity

- [ ] Users table populated correctly
- [ ] Products table populated correctly
- [ ] Orders table populated correctly
- [ ] Cart items remain consistent

### Relationships

- [ ] User-Order relationship maintained
- [ ] Order-Product relationship maintained
- [ ] Order-Payment relationship maintained

### Data Persistence

- [ ] Data persists across server restarts
- [ ] No data loss after crashes
- [ ] Backup and restore works

---

## Deployment Testing

### Production Environment

- [ ] Code deployed to production
- [ ] Environment variables set correctly
- [ ] Database connected to production database
- [ ] SSL certificate installed and valid
- [ ] CDN configured (if applicable)

### Monitoring

- [ ] Error logs captured
- [ ] Performance metrics available
- [ ] User tracking enabled (if applicable)
- [ ] Alerts configured for critical errors

---

## Regression Testing

Verify that all previously working features still work:

- [ ] User registration/login
- [ ] Product browsing
- [ ] Shopping cart
- [ ] Checkout process
- [ ] Order tracking
- [ ] User profile
- [ ] Admin dashboard

---

## Sign Off

| Role | Name | Date | Status |
|------|------|------|--------|
| QA Lead | | | ✓ PASSED / ✗ FAILED |
| DevOps | | | ✓ DEPLOYED / ✗ BLOCKED |
| Product Owner | | | ✓ APPROVED / ✗ REVISIONS NEEDED |

---

**Test Environment**: v2.0.0  
**Date Started**: _______________  
**Date Completed**: _______________  
**Total Issues Found**: _______________  
**Total Issues Resolved**: _______________  

### Issues Summary

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| | | | |
| | | | |

---

**Last Updated**: February 27, 2026
**Version**: 2.0.0
