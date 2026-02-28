/**
 * ShopEase API Client
 * Unified API communication layer for all backend requests
 * Version 2.0.0
 */

class ShopEaseAPI {
  constructor(baseURL = null) {
    // Use environment variable or default to localhost in development
    this.baseURL = baseURL || (
      typeof process !== 'undefined' && process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL
        : (() => {
            const isProduction = window.location.hostname !== 'localhost' && 
                                window.location.hostname !== '127.0.0.1';
            return isProduction 
              ? `https://${window.location.hostname}/api`
              : 'http://localhost:5000/api';
          })()
    );
    
    this.token = this.getStoredToken();
    this.refreshToken = this.getStoredRefreshToken();
    this.requestQueue = [];
    this.isRefreshing = false;
  }

  /**
   * Get stored JWT token from localStorage
   */
  getStoredToken() {
    try {
      return localStorage.getItem('shopease_token') || null;
    } catch (e) {
      console.warn('Cannot access localStorage for token:', e);
      return null;
    }
  }

  /**
   * Get stored refresh token from localStorage
   */
  getStoredRefreshToken() {
    try {
      return localStorage.getItem('shopease_refresh_token') || null;
    } catch (e) {
      console.warn('Cannot access localStorage for refresh token:', e);
      return null;
    }
  }

  /**
   * Store tokens in localStorage
   */
  storeTokens(token, refreshToken) {
    try {
      if (token) {
        localStorage.setItem('shopease_token', token);
        this.token = token;
      }
      if (refreshToken) {
        localStorage.setItem('shopease_refresh_token', refreshToken);
        this.refreshToken = refreshToken;
      }
    } catch (e) {
      console.error('Cannot store tokens:', e);
    }
  }

  /**
   * Clear stored tokens (logout)
   */
  clearTokens() {
    try {
      localStorage.removeItem('shopease_token');
      localStorage.removeItem('shopease_refresh_token');
      this.token = null;
      this.refreshToken = null;
      // Clear user data
      localStorage.removeItem('shopease_user');
    } catch (e) {
      console.error('Cannot clear tokens:', e);
    }
  }

  /**
   * Build request headers with authentication
   */
  getHeaders(contentType = 'application/json') {
    const headers = {
      'Content-Type': contentType,
      'Accept': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized (token expired)
      if (response.status === 401) {
        if (this.refreshToken && !this.isRefreshing) {
          return this.refreshAccessToken().then(() => {
            // Request failed due to auth, retry won't help without token
            throw new Error(data.message || 'Authentication failed');
          }).catch(err => {
            this.clearTokens();
            window.location.href = '/index.html'; // Redirect to login
            throw err;
          });
        }
      }

      const error = new Error(data.message || `API Error: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken() {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      const data = await response.json();

      if (response.ok) {
        this.storeTokens(data.data.token, data.data.refreshToken);

        // Process queued requests
        this.requestQueue.forEach(({ resolve }) => resolve());
        this.requestQueue = [];

        return data.data;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      this.requestQueue = [];
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body = null,
      contentType = 'application/json',
      timeout = 10000,
      ...otherOptions
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders(contentType);

    const config = {
      method,
      headers,
      ...otherOptions
    };

    if (body) {
      config.body = contentType === 'application/json' 
        ? JSON.stringify(body)
        : body;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return await this.handleResponse(response);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout: ${endpoint}`);
      }
      throw error;
    }
  }

  // ==================== AUTH ENDPOINTS ====================

  /**
   * Register new user
   */
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName
      }
    });

    if (response.success && response.data) {
      this.storeTokens(response.data.token, response.data.refreshToken);
      localStorage.setItem('shopease_user', JSON.stringify(response.data.user));
    }

    return response;
  }

  /**
   * Login user
   */
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });

    if (response.success && response.data) {
      this.storeTokens(response.data.token, response.data.refreshToken);
      localStorage.setItem('shopease_user', JSON.stringify(response.data.user));
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout request failed:', error);
    }

    this.clearTokens();
    return { success: true };
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    const response = await this.request('/auth/me');
    if (response.success) {
      localStorage.setItem('shopease_user', JSON.stringify(response.data.user));
    }
    return response;
  }

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: updates
    });
  }

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: { currentPassword, newPassword }
    });
  }

  // ==================== PRODUCT ENDPOINTS ====================

  /**
   * Get all products with filters
   */
  async getProducts(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const endpoint = `/products${params.toString() ? '?' + params.toString() : ''}`;
    return this.request(endpoint);
  }

  /**
   * Get single product
   */
  async getProduct(productId) {
    return this.request(`/products/${productId}`);
  }

  /**
   * Get product categories
   */
  async getCategories() {
    return this.request('/products/categories');
  }

  /**
   * Search products
   */
  async searchProducts(query, filters = {}) {
    return this.getProducts({ search: query, ...filters });
  }

  // ==================== CART ENDPOINTS ====================

  /**
   * Get user's cart
   */
  async getCart() {
    return this.request('/cart');
  }

  /**
   * Add item to cart
   */
  async addToCart(productId, quantity = 1) {
    return this.request('/cart', {
      method: 'POST',
      body: { productId, quantity }
    });
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(productId, quantity) {
    return this.request(`/cart/${productId}`, {
      method: 'PUT',
      body: { quantity }
    });
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(productId) {
    return this.request(`/cart/${productId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Clear entire cart
   */
  async clearCart() {
    return this.request('/cart', {
      method: 'DELETE'
    });
  }

  /**
   * Merge guest cart with user cart
   */
  async mergeCart(guestCart) {
    return this.request('/cart/merge', {
      method: 'POST',
      body: { guestCart }
    });
  }

  // ==================== ORDER ENDPOINTS ====================

  /**
   * Create new order
   */
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: orderData
    });
  }

  /**
   * Get user's orders
   */
  async getOrders(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const endpoint = `/orders${params.toString() ? '?' + params.toString() : ''}`;
    return this.request(endpoint);
  }

  /**
   * Get single order
   */
  async getOrder(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId, reason = '') {
    return this.request(`/orders/${orderId}/cancel`, {
      method: 'PUT',
      body: { reason }
    });
  }

  // ==================== PAYMENT ENDPOINTS ====================

  /**
   * Initiate payment for order
   */
  async initiatePayment(orderId, method) {
    return this.request('/payments/initiate', {
      method: 'POST',
      body: { orderId, method }
    });
  }

  /**
   * Verify payment
   */
  async verifyPayment(paymentId) {
    return this.request(`/payments/verify/${paymentId}`);
  }

  /**
   * Get payment info
   */
  async getPaymentInfo(orderId) {
    return this.request(`/payments/${orderId}`);
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Get admin dashboard stats
   */
  async getDashboardStats() {
    return this.request('/admin/dashboard');
  }

  /**
   * Get all users (admin only)
   */
  async getUsers(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const endpoint = `/admin/users${params.toString() ? '?' + params.toString() : ''}`;
    return this.request(endpoint);
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId, role) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: { role }
    });
  }

  /**
   * Get all orders (admin only)
   */
  async getAllOrders(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const endpoint = `/admin/orders${params.toString() ? '?' + params.toString() : ''}`;
    return this.request(endpoint);
  }

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(orderId, status, trackingNumber = null) {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: { status, trackingNumber }
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Get stored user data
   */
  getStoredUser() {
    try {
      const user = localStorage.getItem('shopease_user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.warn('Cannot parse stored user:', e);
      return null;
    }
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    const user = this.getStoredUser();
    return user && user.isAdmin === true;
  }
}

// Create and expose global API client instance
const api = new ShopEaseAPI();

// Make it available globally
if (typeof window !== 'undefined') {
  window.ShopEaseAPI = ShopEaseAPI;
  window.api = api;
}

// Export for module usage if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShopEaseAPI;
}
