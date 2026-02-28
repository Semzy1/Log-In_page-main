# ShopEase Backend API

A robust and secure Node.js/Express backend for the ShopEase e-commerce platform with MongoDB database, JWT authentication, payment integration, and comprehensive order management.

## Features

- ✅ **User Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - User registration with validation
  - Secure password hashing with bcrypt
  - Admin role management

- ✅ **Product Management**
  - Complete CRUD operations
  - Advanced filtering and search
  - Category-based organization
  - Inventory tracking
  - Product ratings and reviews

- ✅ **Shopping Cart**
  - Add/remove/update items
  - Cart persistence
  - Real-time totals calculation
  - Inventory validation

- ✅ **Order Management**
  - Order creation with inventory validation
  - Order status tracking
  - Order history and details
  - Cancellation support

- ✅ **Payment Processing**
  - Multiple payment gateway support (Flutterwave, Paystack)
  - Secure payment handling
  - Refund management
  - Payment status tracking

- ✅ **Admin Dashboard**
  - Sales analytics
  - User management
  - Product administration
  - Order tracking and fulfillment

- ✅ **Email Notifications**
  - Order confirmation emails
  - Admin order notifications
  - HTML email templates

- ✅ **Security Features**
  - Rate limiting
  - CORS protection
  - Helmet security headers
  - Input validation and sanitization
  - SQL injection prevention

## Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js v4.18
- **Database**: MongoDB v8.0
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Email**: Nodemailer
- **Security**: Helmet, express-rate-limit, CORS
- **Logging**: Morgan

## Installation

### Prerequisites
- Node.js v16 or higher
- MongoDB v4.0 or higher
- npm or yarn

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and fill in your actual values:
- Database connection string
- JWT secrets (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Email credentials
- Payment gateway keys
- API URLs

4. **Start the server**

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The API will be available at `http://localhost:5000` (or your configured PORT)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products with filters
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories` - Get categories
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item
- `DELETE /api/cart/:productId` - Remove from cart
- `DELETE /api/cart` - Clear entire cart
- `POST /api/cart/merge` - Merge guest cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify/:paymentId` - Verify payment
- `GET /api/payments/:orderId` - Get payment info

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/orders` - List all orders
- `PUT /api/admin/users/:id/role` - Update user role

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `EMAIL_USER` - Gmail address for notifications
- `EMAIL_PASS` - Gmail app password
- `FRONTEND_URL` - Frontend application URL for CORS

## Database Models

### User
- Authentication and profile information
- Cart items and wishlist
- Order history

### Product
- Product details and inventory
- Images and metadata
- Ratings and reviews
- SEO information

### Order
- Order items and pricing
- Shipping and billing addresses
- Status tracking and timestamps
- Order notes

### Payment
- Payment details and status
- Gateway information
- Card details (masked)
- Refund tracking

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "msg": "Field-specific error",
      "param": "fieldName",
      "location": "body"
    }
  ]
}
```

## Security Best Practices

1. **Never commit `.env` file** - It contains sensitive information
2. **Use environment variables** for all secrets
3. **Generate strong JWT secrets** - Use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. **Enable HTTPS in production**
5. **Set secure MongoDB credentials**
6. **Use Gmail App Passwords** for email (not your regular password)
7. **Regularly update dependencies** - `npm audit fix`
8. **Implement rate limiting** - Already included in routes

## Testing

Run the test suite:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

## Development

### Code Style
- Use async/await for asynchronous operations
- Always include error handling in try-catch blocks
- Validate all user inputs
- Use meaningful variable and function names

### Adding New Routes

1. Create route file in `/routes`
2. Add validation middleware
3. Implement controllers
4. Register in `/server.js`
5. Test thoroughly

### Debugging

Set debug mode for verbose logging:
```bash
DEBUG=* npm run dev
```

## Performance Optimization

- Database indexes on frequently queried fields
- Request pagination
- Field selection to reduce payload
- Rate limiting to prevent abuse
- Connection pooling for MongoDB

## Troubleshooting

### MongoDB Connection Issues
- Check MongoDB is running: `mongod --version`
- Verify connection string in `.env`
- Check network connectivity

### Email Not Sending
- Verify Gmail App Password (not regular password)
- Enable "Less secure apps" if using Gmail
- Check EMAIL_USER and EMAIL_PASS in `.env`

### Payment Gateway Errors
- Verify API keys are correct
- Check if in testing/sandbox mode
- Review payment gateway logs

## Contributing

1. Create a feature branch
2. Make changes with clear commit messages
3. Test thoroughly
4. Submit pull request with description

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Check existing GitHub issues
- Review error logs
- Contact development team

---

**Last Updated**: February 2026
**Version**: 2.0.0
