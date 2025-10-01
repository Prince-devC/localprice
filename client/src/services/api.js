import axios from 'axios';

// Configuration de base d'axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services pour les magasins
export const storeService = {
  getAll: () => api.get('/stores'),
  getById: (id) => api.get(`/stores/${id}`),
  getByCity: (city) => api.get(`/stores/search/city/${city}`),
  getByPostalCode: (postalCode) => api.get(`/stores/search/postal/${postalCode}`),
  getNearby: (latitude, longitude, radius = 10) => 
    api.get(`/stores/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`),
  create: (data) => api.post('/stores', data),
  update: (id, data) => api.put(`/stores/${id}`, data),
  delete: (id) => api.delete(`/stores/${id}`),
};

// Services pour les produits
export const productService = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  search: (term, limit = 50) => api.get(`/products/search/${term}?limit=${limit}`),
  getByCategory: (categoryId, limit = 50) => 
    api.get(`/products/category/${categoryId}?limit=${limit}`),
  getByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  getPrices: (id) => api.get(`/products/${id}/prices`),
  compare: (id, storeIds = []) => 
    api.get(`/products/${id}/compare?stores=${storeIds.join(',')}`),
  getStats: (id) => api.get(`/products/${id}/stats`),
  searchAdvanced: (filters) => api.post('/products/search/advanced', filters),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Services pour les comparaisons
export const comparisonService = {
  getCheapest: (limit = 20) => api.get(`/comparisons/cheapest?limit=${limit}`),
  getBestByCategory: (categoryId, limit = 20) => 
    api.get(`/comparisons/category/${categoryId}/best?limit=${limit}`),
  getByPriceRange: (minPrice, maxPrice, limit = 50) => 
    api.get(`/comparisons/price-range?min_price=${minPrice}&max_price=${maxPrice}&limit=${limit}`),
  compareProducts: (productIds) => 
    api.post('/comparisons/compare-products', { product_ids: productIds }),
  compareStores: (storeIds, categoryId = null, limit = 50) => 
    api.post('/comparisons/compare-stores', { 
      store_ids: storeIds, 
      category_id: categoryId, 
      limit 
    }),
  search: (params) => api.get('/comparisons/search', { params }),
};

// Services d'authentification
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (username, email, password) => 
    api.post('/auth/register', { username, email, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Services pour les catégories
export const categoryService = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Services pour les prix
export const priceService = {
  upsert: (data) => api.post('/prices', data),
  delete: (productId, storeId) => 
    api.delete(`/prices?product_id=${productId}&store_id=${storeId}`),
  getByProduct: (productId) => api.get(`/prices/product/${productId}`),
  getByStore: (storeId, limit = 100) => 
    api.get(`/prices/store/${storeId}?limit=${limit}`),
};

// ===== NOUVELLES API AGRICOLES =====

// API pour les prix agricoles
export const agriculturalPriceService = {
  getAll: (params = {}) => api.get('/agricultural-prices', { params }),
  getStatistics: (params = {}) => api.get('/agricultural-prices/statistics', { params }),
  getEvolution: (params = {}) => api.get('/agricultural-prices/evolution', { params }),
  getMap: (params = {}) => api.get('/agricultural-prices/map', { params }),
  getBasketIndex: (params = {}) => api.get('/agricultural-prices/basket-index', { params }),
  submit: (data) => api.post('/agricultural-prices', data),
  getPending: (params = {}) => api.get('/agricultural-prices/pending', { params }),
  validate: (id, data) => api.post(`/agricultural-prices/${id}/validate`, data),
  reject: (id, data) => api.post(`/agricultural-prices/${id}/reject`, data)
};

// API pour les catégories de produits agricoles
export const productCategoryService = {
  getAll: () => api.get('/product-categories'),
  getById: (id) => api.get(`/product-categories/${id}`),
  create: (data) => api.post('/product-categories', data),
  update: (id, data) => api.put(`/product-categories/${id}`, data),
  delete: (id) => api.delete(`/product-categories/${id}`)
};

// API pour les localités
export const localityService = {
  getAll: () => api.get('/localities'),
  getWithCoordinates: () => api.get('/localities/with-coordinates'),
  getByRegion: (regionId) => api.get(`/localities/region/${regionId}`),
  getById: (id) => api.get(`/localities/${id}`),
  create: (data) => api.post('/localities', data),
  update: (id, data) => api.put(`/localities/${id}`, data),
  delete: (id) => api.delete(`/localities/${id}`)
};

// API pour les unités
export const unitService = {
  getAll: () => api.get('/units'),
  getById: (id) => api.get(`/units/${id}`),
  create: (data) => api.post('/units', data),
  update: (id, data) => api.put(`/units/${id}`, data),
  delete: (id) => api.delete(`/units/${id}`)
};

// API pour les coûts
export const costService = {
  getAll: () => api.get('/costs'),
  getTransport: () => api.get('/costs/transport'),
  getStorage: () => api.get('/costs/storage'),
  calculateTransport: (params) => api.get('/costs/calculate-transport', { params }),
  calculateStorage: (params) => api.get('/costs/calculate-storage', { params }),
  create: (data) => api.post('/costs', data),
  update: (id, data) => api.put(`/costs/${id}`, data),
  delete: (id) => api.delete(`/costs/${id}`)
};

// API pour l'administration
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPendingPrices: (params = {}) => api.get('/admin/pending-prices', { params }),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUserRole: (id, data) => api.put(`/admin/users/${id}/role`, data),
  getAuditLogs: (params = {}) => api.get('/admin/audit-logs', { params }),
  validatePrice: (id, data) => api.post(`/admin/validate-price/${id}`, data),
  rejectPrice: (id, data) => api.post(`/admin/reject-price/${id}`, data)
};

// API pour les options de filtres
export const filterOptionsService = {
  getAll: () => api.get('/filter-options'),
  getProducts: () => api.get('/filter-options/products'),
  getLocalities: () => api.get('/filter-options/localities'),
  getRegions: () => api.get('/filter-options/regions'),
  getCategories: () => api.get('/filter-options/categories'),
  getPeriods: () => api.get('/filter-options/periods'),
  updateStatus: (type, id, isActive) => api.put(`/filter-options/${type}/${id}/status`, { is_active: isActive }),
  addProduct: (data) => api.post('/filter-options/products', data),
  addLocality: (data) => api.post('/filter-options/localities', data),
  delete: (type, id) => api.delete(`/filter-options/${type}/${id}`)
};

export default api;
