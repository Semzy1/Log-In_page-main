# ShopEase E-Commerce Platform

A full-stack e-commerce platform featuring a modern storefront with user authentication, product catalog, shopping cart, checkout system, and comprehensive admin management. Built with vanilla HTML, CSS, JavaScript frontend and Node.js/Express.js backend with MongoDB.

---

## ✨ Features

### Frontend Features

#### Authentication & Session Management
- 📧 Email/Password signup and signin with client-side validation
- 🔑 Social Media Login Simulation:
  - Google, Facebook, GitHub, LinkedIn OAuth UX
  - Demo user creation and storage in localStorage
  - Session fallback via `?session=<username>` URL parameter (great for local/file:// testing)
- 🔐 Admin account detection (username: `admin` grants special access)
- 🚪 Robust logout with session cleanup and redirect

#### Storefront Features
- 🛍️ **Product Catalog**: 14 footwear and apparel items with pricing in Nigerian Naira (₦)
- 🛒 **Shopping Cart**: Add, remove, and adjust quantities; cart persisted in localStorage
- 🏪 **Product Filtering**: Browse by category (All, Shoes, Clothes, Accessories) or search
- 🛒 **Checkout Flow**:
  - Order confirmation modal with order ID
  - WhatsApp integration for order notification (+2348145422472)
  - Order persistence in localStorage (`shop_orders`)
- 📦 **Orders Dashboard**: Admin-only view to see all placed orders; restricted to `admin` user

### Backend Features

#### User Management
- 👤 **User Registration & Authentication**: Secure user registration with email verification, JWT-based authentication, and password hashing
- 🔄 **Token Management**: Access and refresh token system for secure API access
- 👨‍💼 **Admin System**: Role-based access control with admin privileges for product and order management
- 📝 **User Profiles**: Profile management with update capabilities and password change functionality

#### Product Management
- 📦 **Product CRUD**: Full create, read, update, delete operations for products
- 🏷️ **Product Categories**: Organized product categorization (electronics, fashion, home, sports, etc.)
- 🔍 **Advanced Filtering**: Filter products by category, price range, brand, and search queries
- 📊 **Inventory Management**: Stock tracking and inventory control
- ⭐ **Featured Products**: Highlight featured products for marketing

#### Order & Payment System
- 🛒 **Order Processing**: Complete order lifecycle management from creation to fulfillment
- 💳 **Payment Integration**: Flutterwave payment gateway integration for secure transactions
- 📧 **Email Notifications**: Automated email notifications for order confirmations and updates
- 📈 **Order Analytics**: Admin dashboard for order tracking and analytics

#### API Features
- 🛡️ **Security**: Rate limiting, CORS protection, input validation, and security headers
- 📚 **RESTful API**: Well-structured REST API endpoints with consistent response formats
- ✅ **Data Validation**: Comprehensive input validation using express-validator
- 🔒 **Authentication Middleware**: Protected routes with JWT authentication

### Payment Page Integration
- Fully connected payment page (`payment.html`) integrated with `script.js`
- Flutterwave payment integration as the sole payment method
- Supports multiple payment options through Flutterwave: cards, mobile money, bank transfers, USSD
- Real-time payment processing with Flutterwave's secure checkout modal
- Order summary loading and status updates on successful payment
- Static layout preserved; dynamic tabs generation code in `paymentTabDynamic.js` disabled to avoid conflicts

### Theme & UI/UX
- 🌓 Dark/Light mode toggle with persistent preference (opt-in, defaults to light)
- ✨ Smooth theme transitions (fade animations on colors, borders, shadows)
- 📱 Fully responsive design (mobile-friendly)
- 🎯 Welcome banner with dismissal option and fade-in/fade-out animations
- 🎨 Modern gradient UI with Font Awesome icons

### Technical Highlights

#### Frontend
- Pure client-side demo with localStorage/sessionStorage persistence
- Responsive design with dark/light theme toggle
- Three.js CDN ready (demo includes doll/mascot renderer capability)
- Smooth CSS transitions and animations
- WhatsApp integration for order notifications

#### Backend
- **Node.js/Express.js** server with RESTful API design
- **MongoDB** with Mongoose ODM for data persistence
- **JWT Authentication** with access/refresh token system
- **Security**: Helmet, CORS, rate limiting, input validation
- **Email Service**: Nodemailer for notifications
- **Payment Integration**: Flutterwave payment gateway


---

## 📂 Project Structure

### Frontend Files
| File | Purpose |
|------|---------|
| `index.html` | Login/Signup page; social buttons; theme toggle; redirects to storefront on login |
| `script.js` | Client-side auth logic plus payment page functionality: social login, theme toggle, demo user creation, session management, payment form handling |
| `payment.html` | Static payment page linked with `script.js` for payment handling and dynamic order summary |
| `paymentTabDynamic.js` | Disabled dynamic payment tab generation to avoid conflicts with static layout |
| `style.css` | Core styles for login page; CSS variables for theme (light/dark) |
| `deepseek_html_20251113_24f848.html` | **Main storefront**: products, cart, checkout, order confirmation, admin panel |
| `orders.html` | Admin-only orders dashboard; displays all persisted orders |
| `admin-login.html` | Admin login interface |
| `dashboard.html` | Admin dashboard for management |
| `assets/images/` | Product images (sneakers and placeholders) |

### Backend Files
| File | Purpose |
|------|---------|
| `backend/server.js` | Main Express.js server with middleware setup and route configuration |
| `backend/package.json` | Backend dependencies and scripts |
| `backend/config/database.js` | MongoDB connection configuration |
| `backend/middleware/auth.js` | JWT authentication middleware and token management |
| `backend/models/User.js` | User model with authentication methods |
| `backend/models/Product.js` | Product model with inventory and review management |
| `backend/models/Order.js` | Order model for purchase tracking |
| `backend/models/Payment.js` | Payment model for transaction records |
| `backend/routes/auth.js` | Authentication routes (register, login, profile management) |
| `backend/routes/products.js` | Product CRUD operations and filtering |
| `backend/routes/orders.js` | Order management and tracking |
| `backend/routes/cart.js` | Shopping cart operations |
| `backend/routes/payments.js` | Payment processing and integration |
| `backend/routes/admin.js` | Admin-only management routes |
| `backend/services/emailService.js` | Email notification service |

### Documentation & Testing
| File | Purpose |
|------|---------|
| `README.md` | This file - project documentation |
| `TEST_CHECKLIST.md` | Step-by-step manual testing guide |
| `TODO.md` | Development tasks and progress tracking |
| Various `LOGOUT_*.md` | Logout system documentation and reports |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (local installation or cloud service like MongoDB Atlas)
- **npm** or **yarn** package manager

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/shopease
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-refresh-token-secret
   FRONTEND_URL=http://localhost:3000
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-password
   FLUTTERWAVE_PUBLIC_KEY=your-flutterwave-public-key
   FLUTTERWAVE_SECRET_KEY=your-flutterwave-secret-key
   ```

4. Start MongoDB service (if running locally)

5. Start the backend server:
   ```bash
   npm run dev  # For development with nodemon
   # or
   npm start    # For production
   ```

The API will be available at `http://localhost:5000`

### Frontend Setup
1. Open `index.html` in your browser for the demo storefront
2. For local development, you can serve the files using any static server

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (with filtering/pagination)
- `GET /api/products/categories` - Get product categories
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item quantity
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `GET /api/payments/verify/:reference` - Verify payment
- `GET /api/payments/:orderId` - Get payment for order

### Admin
- `GET /api/admin/users` - Get all users (Admin only)
- `GET /api/admin/orders` - Get all orders (Admin only)
- `GET /api/admin/stats` - Get platform statistics (Admin only)

### Health Check
- `GET /api/health` - API health check

---

## 📄 Summary of Recent Updates for Payment Page

- Refactored `payment.html` to remove inline payment tabs script and link to `script.js`.
- Ensured `script.js` manages payment slots, form validation, order loading, and simulated payment.
- Cleaned `paymentTabDynamic.js` to contain only a disabling comment, preventing runtime errors.
- Preserved original design and layout of `payment.html`.

---

## 🧪 Manual Testing Checklist

Please perform critical-path tests for the payment page features:

1. Flutterwave payment modal opens when clicking "Pay Now" button.
2. Order summary accurately loads items and total from localStorage order by orderId.
3. Successful Flutterwave payment updates order status to 'paid' and shows success notification.
4. Cancelled payment shows appropriate warning message.

---

If you need the full detailed testing checklist, assistance with testing, or any further documentation updates, please let me know.
