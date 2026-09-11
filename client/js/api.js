// ============================================
// BADINI BIG FISH - API CLIENT
// ============================================

const API_BASE = `${window.location.origin}/api`;

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('bbf_token');
    this.refreshToken = localStorage.getItem('bbf_refresh_token');
  }

  // ============================================
  // REQUISICAO BASE
  // ============================================
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      // Se token expirou, tentar refresh
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.token}`;
          const retryResponse = await fetch(url, { ...options, headers, credentials: 'include' });
          return this.handleResponse(retryResponse);
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisicao');
    }

    return data;
  }

  // ============================================
  // AUTENTICACAO
  // ============================================
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.setTokens(data.accessToken);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setTokens(data.accessToken);
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Ignora erro no logout
    }
    this.clearTokens();
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.accessToken;
        localStorage.setItem('bbf_token', data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  setTokens(accessToken) {
    this.token = accessToken;
    localStorage.setItem('bbf_token', accessToken);
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('bbf_token');
    localStorage.removeItem('bbf_refresh_token');
    localStorage.removeItem('bbf_user');
  }

  isAuthenticated() {
    return !!this.token;
  }

  // ============================================
  // PRODUTOS
  // ============================================
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products?${queryString}`);
  }

  async getProduct(slug) {
    return this.request(`/products/${slug}`);
  }

  // ============================================
  // PEDIDOS
  // ============================================
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders?${queryString}`);
  }

  async getOrder(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  async getMyOrders() {
    return this.request('/customers/orders');
  }

  // ============================================
  // CLIENTES
  // ============================================
  async getMyProfile() {
    return this.request('/customers/profile');
  }

  async updateProfile(profileData) {
    return this.request('/customers/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getMyOrders() {
    return this.request('/customers/orders');
  }

  async getAddresses() {
    return this.request('/customers/addresses');
  }

  async addAddress(addressData) {
    return this.request('/customers/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(addressId, addressData) {
    return this.request(`/customers/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(addressId) {
    return this.request(`/customers/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // PAGAMENTO
  // ============================================
  async createPayment(orderId) {
    return this.request('/payment/create', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  }

  async getPaymentStatus(orderId) {
    return this.request(`/payment/status/${orderId}`);
  }
}

// Instancia global
const api = new ApiClient();
