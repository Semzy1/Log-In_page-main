# Homepage.html - Fully Enabled Functions

## Overview
The Homepage.html file now includes comprehensive JavaScript functions for a fully functional e-commerce homepage. All functions are enabled and ready to use.

---

## 🛒 Cart Management Functions

### `loadHomeCart()`
Loads the shopping cart from localStorage.
```javascript
const cart = loadHomeCart();
// Returns: { productId: quantity, ... }
```

### `saveHomeCart(cart)`
Saves the shopping cart to localStorage and updates the cart count.
```javascript
saveHomeCart(cart);
```

### `updateHomeCartCount()`
Updates the cart badge count in the header.
```javascript
updateHomeCartCount();
// Updates #homeCartCount element
```

### `addToCart(productId, quantity = 1)`
Adds a product to the cart with validation.
```javascript
addToCart('e1', 2);
// Returns: true/false
// Shows toast notification
```

### `removeFromCart(productId)`
Removes a product from the cart.
```javascript
removeFromCart('e1');
// Returns: true/false
// Shows toast notification
```

### `updateCartQuantity(productId, quantity)`
Updates the quantity of a product in the cart.
```javascript
updateCartQuantity('e1', 5);
// Returns: true/false
```

### `clearCart()`
Clears all items from the cart.
```javascript
clearCart();
// Returns: true/false
// Shows toast notification
```

### `getCartItems()`
Gets detailed information about all cart items.
```javascript
const items = getCartItems();
// Returns: [{ ...product, quantity, subtotal }, ...]
```

### `getCartItemsCount()`
Gets the total number of items in the cart.
```javascript
const count = getCartItemsCount();
// Returns: number
```

### `calculateCartTotal()`
Calculates the total price of all items in the cart.
```javascript
const total = calculateCartTotal();
// Returns: number (total price)
```

---

## ❤️ Wishlist Management Functions

### `loadWishlist()`
Loads the wishlist from localStorage.
```javascript
const wishlist = loadWishlist();
// Returns: [productId, productId, ...]
```

### `saveWishlist(wishlist)`
Saves the wishlist to localStorage.
```javascript
saveWishlist(wishlist);
```

### `toggleWishlist(productId)`
Adds or removes a product from the wishlist.
```javascript
toggleWishlist('e1');
// Returns: true (added) or false (removed)
// Shows toast notification
```

### `isInWishlist(productId)`
Checks if a product is in the wishlist.
```javascript
const inWishlist = isInWishlist('e1');
// Returns: true/false
```

---

## 🔍 Product Search & Filter Functions

### `searchProducts(query)`
Searches products by title or description.
```javascript
const results = searchProducts('iPhone');
// Returns: [product, product, ...]
```

### `filterByCategory(category)`
Filters products by category.
```javascript
const electronics = filterByCategory('electronics');
// Returns: [product, product, ...]
```

### `sortProducts(products, sortBy)`
Sorts products by various criteria.
```javascript
// sortBy options: 'price-low', 'price-high', 'name-asc', 'name-desc', 'newest'
const sorted = sortProducts(products, 'price-low');
// Returns: [product, product, ...]
```

### `getProductById(id)`
Gets a product by its ID.
```javascript
const product = getProductById('e1');
// Returns: product object or null
```

### `getRelatedProducts(productId, limit = 4)`
Gets related products from the same category.
```javascript
const related = getRelatedProducts('e1', 4);
// Returns: [product, product, ...]
```

---

## 🔔 Notification Functions

### `showHomeToast(msg, type = 'success', duration = 2500)`
Shows a toast notification.
```javascript
// Types: 'success', 'error', 'warning'
showHomeToast('Added to cart', 'success');
showHomeToast('Product not found', 'error');
showHomeToast('Low stock', 'warning');
```

---

## 🎠 Carousel Functions

The carousel is fully functional with:
- **Auto-rotation**: Automatically rotates every 4 seconds
- **Manual navigation**: Previous/Next buttons
- **Indicator dots**: Click to jump to specific slide
- **Thumbnail navigation**: Click thumbnails to navigate
- **Keyboard support**: Arrow keys to navigate
- **Touch support**: Swipe to navigate on mobile
- **Pause on hover**: Stops auto-rotation when hovering
- **Pause on focus**: Stops auto-rotation when focused

---

## 📊 Usage Examples

### Example 1: Add Product to Cart
```javascript
// Add 2 units of product 'e1' to cart
addToCart('e1', 2);
// Toast shows: "Added 2 x iPhone 15 Pro to cart"
```

### Example 2: Get Cart Total
```javascript
const total = calculateCartTotal();
console.log(`Cart Total: ₦${total.toLocaleString()}`);
```

### Example 3: Search and Filter
```javascript
// Search for products
const searchResults = searchProducts('phone');

// Filter by category
const electronics = filterByCategory('electronics');

// Sort by price (low to high)
const sorted = sortProducts(electronics, 'price-low');
```

### Example 4: Wishlist Management
```javascript
// Add to wishlist
toggleWishlist('e1');

// Check if in wishlist
if(isInWishlist('e1')){
    console.log('Product is in wishlist');
}

// Get all wishlist items
const wishlist = loadWishlist();
const wishlistProducts = wishlist.map(id => getProductById(id));
```

### Example 5: Get Cart Details
```javascript
// Get all cart items with details
const cartItems = getCartItems();
cartItems.forEach(item => {
    console.log(`${item.title}: ${item.quantity} x ₦${item.price}`);
});
```

---

## 💾 LocalStorage Keys

The homepage uses the following localStorage keys:

| Key | Purpose | Format |
|-----|---------|--------|
| `shop_cart` | Shopping cart items | `{ productId: quantity, ... }` |
| `shop_wishlist` | Wishlist items | `[productId, productId, ...]` |
| `focusflow_featured_overrides` | Featured product overrides | `{ productId: boolean, ... }` |

---

## 🎯 Features Enabled

✅ **Shopping Cart**
- Add/remove items
- Update quantities
- Calculate totals
- Clear cart

✅ **Wishlist**
- Add/remove favorites
- Check wishlist status
- Persistent storage

✅ **Product Search**
- Search by title/description
- Filter by category
- Sort by price/name/date

✅ **Carousel**
- Auto-rotation
- Manual navigation
- Keyboard support
- Touch support
- Indicator dots
- Thumbnail navigation

✅ **Notifications**
- Success messages
- Error messages
- Warning messages
- Auto-dismiss

✅ **Responsive Design**
- Mobile-friendly
- Tablet-friendly
- Desktop-optimized

✅ **Accessibility**
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

---

## 🚀 Integration with Dashboard

All functions are compatible with the main dashboard.html:
- Cart data syncs across pages
- Wishlist data syncs across pages
- Product data is shared
- User session is maintained

---

## 📝 Notes

- All functions use localStorage for persistence
- Functions are safe and include error handling
- Toast notifications provide user feedback
- All functions are globally accessible
- Compatible with security.js protection

---

## ✅ Testing Checklist

- [x] Cart add/remove works
- [x] Cart total calculation works
- [x] Wishlist toggle works
- [x] Search functionality works
- [x] Filter by category works
- [x] Sort products works
- [x] Carousel navigation works
- [x] Toast notifications work
- [x] LocalStorage persistence works
- [x] Mobile responsiveness works
- [x] Keyboard navigation works
- [x] Touch swipe works
- [x] All functions are enabled

---

**Last Updated**: December 2025  
**Status**: ✅ All Functions Enabled  
**Compatibility**: 100% with Dashboard & Security
