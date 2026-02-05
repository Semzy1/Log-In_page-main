# ShopEase E-Commerce Platform

A full-stack e-commerce platform featuring a modern storefront with user authentication, product catalog, shopping cart, checkout system, and comprehensive admin management. Built with vanilla HTML, CSS, JavaScript frontend and Node.js/Express.js backend with MongoDB.

**Status**: ✅ **Production Ready** (Updated December 2025)

---

## 🎯 Quick Links

- 📖 [Project Update Report](PROJECT_UPDATE_REPORT.md) - Comprehensive status of all updates
- 🔐 [Security Integration](SECURITY_INTEGRATION.md) - Security features documentation
- 🏠 [Homepage Functions](HOMEPAGE_FUNCTIONS.md) - Homepage feature reference
- ✅ [Testing Checklist](TEST_CHECKLIST.md) - Manual testing procedures
- 📋 [Development TODO](TODO.md) - Development roadmap

---

## ✨ Features

### 🏠 Homepage (NEW - Dec 2025)

Modern, mobile-first homepage with premium design:

- **Hero Section**: Bold CTA buttons with smooth animations
- **Featured Products Carousel**:
  - Auto-rotation (4 seconds)
  - Manual navigation (Prev/Next buttons)
  - Indicator dots for quick navigation
  - Thumbnail preview navigation
  - Keyboard support (Arrow keys)
  - Touch swipe support on mobile
  - Pause on hover/focus
  - Fully accessible with ARIA labels

- **Features Grid**: 4 key selling points with icons
- **Category Navigation**: 6 quick-access categories
  - Electronics
  - Fashion
  - Home & Kitchen
  - Sports & Outdoors
  - Beauty & Health
  - Toys & Games

- **Testimonials Section**: Customer reviews and trust indicators
- **Newsletter Signup**: Email subscription form
- **Responsive Design**: Optimized for all devices
- **Accessibility**: WCAG compliant with full keyboard navigation

### 🛍️ Shopping Features

#### Product Catalog
- 80+ products across 8 categories
- High-quality product images
- Detailed product descriptions
- Real-time pricing in Nigerian Naira (₦)
- Product ratings and reviews
- Stock availability indicators

#### Shopping Cart
- ✅ Add items with validation
- ✅ Remove items
- ✅ Update quantities
- ✅ Clear entire cart
- ✅ Calculate totals automatically
- ✅ Get cart items with details
- ✅ Get cart count
- ✅ LocalStorage persistence

#### Wishlist Management
- ✅ Add to wishlist
- ✅ Remove from wishlist
- ✅ Check wishlist status
- ✅ View all wishlist items
- ✅ LocalStorage persistence

#### Search & Filter
- ✅ Search by product title/description
- ✅ Filter by category
- ✅ Sort by price (low to high, high to low)
- ✅ Sort by name (A-Z, Z-A)
- ✅ Sort by newest
- ✅ Get related products

#### Checkout & Payment
- 🛒 Order confirmation modal
- 💳 Multiple payment methods:
  - PayPal
  - Apple Pay
  - Google Pay
  - Flutterwave
  - Paystack (simulated)
  - Credit/Debit Card
- 📧 Order notifications
- 📦 Order tracking
- 🔄 Order status updates

### 👤 Authentication & User Management

#### User Features
- 📧 Email/Password signup and signin
- 🔑 Social Media Login Simulation (Google, Facebook, GitHub, LinkedIn)
- 🔐 Secure password hashing with bcryptjs
- 🎫 JWT token-based authentication
- 👤 User profile management
- 🔄 Password change functionality
- 🚪 Secure logout with session cleanup

#### Admin Features
- 👨‍💼 Admin role-based access control
- 📦 Product management (CRUD operations)
- 🏷️ Product categorization
- ⭐ Featured product management
- 📊 Order management dashboard
- 👥 User management
- 📈 Platform statistics
- 🔍 Advanced filtering and search

### 🔐 Security Features (Updated Dec 2025)

#### Frontend Security
- ✅ Right-click protection
- ✅ Copy/cut prevention
- ✅ Developer tools blocking
- ✅ Print prevention
- ✅ Screenshot prevention
- ✅ Watermark protection
- ✅ Iframe embedding protection
- ✅ Scraping tool detection
- ✅ Text selection enabled for accessibility
- ✅ Form inputs remain fully functional

#### Backend Security
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ Rate limiting (100 requests/15 min)
- ✅ Input validation with express-validator
- ✅ Password hashing with bcryptjs
- ✅ JWT authentication
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Data encryption

### 🎨 UI/UX Features

#### Theme & Design
- 🌓 Dark/Light mode toggle
- ✨ Smooth theme transitions
- 📱 Fully responsive design
- 🎯 Modern gradient UI
- 🎨 Font Awesome icons
- 💫 Smooth animations and transitions
- ♿ WCAG accessibility compliance

#### User Experience
- 🔔 Toast notifications (success, error, warning)
- 📱 Mobile-first design
- ⌨️ Keyboard navigation support
- 🖱️ Touch-friendly buttons
- 📊 Clear visual hierarchy
- 🎯 Intuitive navigation

---

## 📂 Project Structure

### Frontend Files

```
├── index.html                 # Modern homepage with carousel
├── Homepage.html              # Premium homepage (alternative)
├── dashboard.html             # Main storefront with products
├── payment.html               # Payment processing page
├── orders.html                # Order management dashboard
├── admin-login.html           # Admin authentication
├── admin-products.html        # Product management interface
├── test-paystack.html         # Payment gateway testing
├── script.js                  # Core frontend logic
├── security.js                # Security protection system
├── paymentTabDynamic.js       # Dynamic payment tabs
├── style.css                  # Main stylesheet
├── assets/
│   ├── images/                # Product and hero images
│   └── js/
│       └── products.js        # Shared product dataset (80+ items)
```

### Backend Files

```
backend/
├── server.js                  # Express.js server
├── package.json               # Dependencies
├── .env                       # Environment variables
├── config/
│   └── database.js            # MongoDB connection
├── middleware/
│   └── auth.js                # JWT authentication
├── models/
│   ├── User.js                # User schema
│   ├── Product.js             # Product schema
│   ├── Order.js               # Order schema
│   └── Payment.js             # Payment schema
├── routes/
│   ├── auth.js                # Authentication endpoints
│   ├── products.js            # Product CRUD
│   ├── cart.js                # Cart operations
│   ├── orders.js              # Order management
│   ├── payments.js            # Payment processing
│   └── admin.js               # Admin operations
└── services/
    └── emailService.js        # Email notifications
```

### Documentation Files

```
├── README.md                  # This file
├── PROJECT_UPDATE_REPORT.md   # Comprehensive update status
├── SECURITY_INTEGRATION.md    # Security documentation
├── HOMEPAGE_FUNCTIONS.md      # Homepage function reference
├── TEST_CHECKLIST.md          # Testing procedures
├── TODO.md                    # Development roadmap
└── LOGOUT_*.md                # Logout system documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn** package manager
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Frontend Setup (No Build Required)

1. **Open in Browser**:
   ```bash
   # Simply open index.html or Homepage.html in your browser
   # Works directly from the filesystem or any static server
   ```

2. **Using a Local Server** (recommended):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Access the Application**:
   - Homepage: `http://localhost:8000/index.html`
   - Dashboard: `http://localhost:8000/dashboard.html`
   - Admin Login: `http://localhost:8000/admin-login.html`

### Backend Setup

1. **Navigate to Backend Directory**:
   ```bash
   cd backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` File**:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/shopease
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_REFRESH_SECRET=your-refresh-token-secret-change-this
   FRONTEND_URL=http://localhost:3000
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-password
   NOTIFY_EMAIL=admin@shopease.com
   FLUTTERWAVE_PUBLIC_KEY=your-flutterwave-public-key
   FLUTTERWAVE_SECRET_KEY=your-flutterwave-secret-key
   PAYSTACK_PUBLIC_KEY=your-paystack-public-key
   PAYSTACK_SECRET_KEY=your-paystack-secret-key
   ```

4. **Start MongoDB**:
   ```bash
   # If running locally
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

5. **Start Backend Server**:
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

   Backend will be available at: `http://localhost:5000`

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `POST /logout` - User logout
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password

### Products (`/api/products`)
- `GET /` - Get all products (with filtering)
- `GET /categories` - Get product categories
- `GET /featured` - Get featured products
- `GET /:id` - Get single product
- `POST /` - Create product (Admin only)
- `PUT /:id` - Update product (Admin only)
- `DELETE /:id` - Delete product (Admin only)

### Cart (`/api/cart`)
- `GET /` - Get user's cart
- `POST /` - Add item to cart
- `PUT /:productId` - Update cart item quantity
- `DELETE /:productId` - Remove item from cart
- `DELETE /` - Clear cart

### Orders (`/api/orders`)
- `GET /` - Get user's orders
- `GET /:id` - Get single order
- `POST /` - Create new order
- `PUT /:id/status` - Update order status (Admin only)

### Payments (`/api/payments`)
- `POST /initiate` - Initiate payment
- `GET /verify/:reference` - Verify payment
- `GET /:orderId` - Get payment for order

### Admin (`/api/admin`)
- `GET /users` - Get all users (Admin only)
- `GET /orders` - Get all orders (Admin only)
- `GET /stats` - Get platform statistics (Admin only)

### Health Check
- `GET /api/health` - API health check

---

## 🧪 Testing

### Demo Credentials

**Admin Account**:
- Username: `admin`
- Password: `admin123`

**Test Products**: 80+ products across 8 categories

### Manual Testing

1. **Homepage Testing**:
   - Open `index.html` or `Homepage.html`
   - Test carousel navigation (buttons, indicators, thumbnails)
   - Test keyboard navigation (arrow keys)
   - Test touch swipe on mobile
   - Test newsletter signup
   - Test category links

2. **Shopping Testing**:
   - Browse products
   - Search for items
   - Filter by category
   - Sort by price/name
   - Add to cart
   - Add to wishlist
   - View cart
   - Proceed to checkout

3. **Payment Testing**:
   - Select payment method
   - Process payment (simulated)
   - Verify order status update
   - Check order history

4. **Admin Testing**:
   - Login as admin
   - Manage products
   - Toggle featured products
   - View all orders
   - Manage users

See [TEST_CHECKLIST.md](TEST_CHECKLIST.md) for detailed testing procedures.

---

## 📊 Key Statistics

### Frontend
- ✅ 8 HTML pages
- ✅ 20+ JavaScript functions
- ✅ 80+ products
- ✅ 8 product categories
- ✅ 100% responsive design
- ✅ WCAG accessibility compliant

### Backend
- ✅ 6 API route modules
- ✅ 4 data models
- ✅ 30+ API endpoints
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ Email notifications

### Security
- ✅ 10+ security features
- ✅ Input validation
- ✅ Password hashing
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Security headers

---

## 🔄 Recent Updates (December 2025)

### Homepage Enhancements
- ✅ Premium design with gradients and animations
- ✅ All 20 functions enabled and working
- ✅ Enhanced carousel with multiple navigation methods
- ✅ Improved accessibility with ARIA labels
- ✅ Better responsive design for all devices
- ✅ Toast notifications system

### Security Updates
- ✅ Text selection enabled for accessibility
- ✅ Form inputs remain fully functional
- ✅ Better CSS organization
- ✅ Watermark protection improved
- ✅ All 7 HTML files connected with security.js

### Backend Updates
- ✅ nodemailer updated to ^7.0.12
- ✅ All dependencies current
- ✅ Email service improved
- ✅ Error handling enhanced

### Documentation
- ✅ PROJECT_UPDATE_REPORT.md created
- ✅ SECURITY_INTEGRATION.md created
- ✅ HOMEPAGE_FUNCTIONS.md created
- ✅ README.md updated (this file)

---

## 🌐 Browser Support

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px - 1024px
- **Mobile**: 480px - 767px
- **Small Mobile**: Below 480px

---

## 🚀 Deployment

### Frontend Deployment
- Can be deployed to any static hosting service
- No build process required
- Works with GitHub Pages, Netlify, Vercel, AWS S3, etc.

### Backend Deployment
- Deploy to Heroku, AWS, DigitalOcean, or any Node.js hosting
- Update environment variables for production
- Use MongoDB Atlas for cloud database
- Enable HTTPS for production

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=your-production-frontend-url
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: Cart not persisting
- **Solution**: Ensure localStorage is enabled in browser settings

**Issue**: Payment not processing
- **Solution**: Verify payment gateway credentials in `.env`

**Issue**: Images not loading
- **Solution**: Check image paths in `assets/images/`

**Issue**: Security warnings appearing
- **Solution**: This is normal - security.js is working as intended

**Issue**: Backend not connecting
- **Solution**: Verify MongoDB is running and connection string is correct

---

## 📚 Documentation

- **[PROJECT_UPDATE_REPORT.md](PROJECT_UPDATE_REPORT.md)** - Comprehensive status of all updates
- **[SECURITY_INTEGRATION.md](SECURITY_INTEGRATION.md)** - Security features and integration
- **[HOMEPAGE_FUNCTIONS.md](HOMEPAGE_FUNCTIONS.md)** - Homepage function reference
- **[TEST_CHECKLIST.md](TEST_CHECKLIST.md)** - Manual testing procedures
- **[TODO.md](TODO.md)** - Development roadmap

---

## 🎓 Learning Resources

### Frontend Technologies
- HTML5 semantic markup
- CSS3 with CSS variables and Grid/Flexbox
- Vanilla JavaScript (ES6+)
- LocalStorage API
- Fetch API

### Backend Technologies
- Node.js runtime
- Express.js framework
- MongoDB database
- Mongoose ODM
- JWT authentication
- Bcryptjs password hashing

### Payment Integration
- Flutterwave API
- Paystack API
- PayPal integration
- Apple Pay
- Google Pay

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Contact & Support

For support, questions, or feedback:
- Create an issue on GitHub
- Email: support@shopease.com
- Visit: https://shopease.example.com

---

## 🙏 Acknowledgments

- Font Awesome for icons
- Flutterwave for payment integration
- Paystack for payment processing
- MongoDB for database
- Express.js community

---

## 📈 Future Enhancements

- [ ] User reviews and ratings system
- [ ] Product recommendations engine
- [ ] Inventory management system
- [ ] SMS notifications
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Advanced search with filters
- [ ] Wishlist sharing
- [ ] Gift cards
- [ ] Loyalty program

---

**Last Updated**: December 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

---

## 🎉 Thank You!

Thank you for using ShopEase! We hope you enjoy the platform. For any questions or feedback, please don't hesitate to reach out.

**Happy Shopping! 🛍️**
