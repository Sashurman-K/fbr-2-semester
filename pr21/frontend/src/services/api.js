import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Перехватчик запросов
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Перехватчик ответов
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post('http://localhost:3000/api/auth/refresh', {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      alert('У вас нет прав для этого действия');
    }

    return Promise.reject(error);
  }
);

const api = {
  // Аутентификация
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getMe: () => apiClient.get('/auth/me'),
  logout: (refreshToken) => apiClient.post('/auth/logout', { refreshToken }),

  // Пользователи
  getUsers: () => apiClient.get('/users'),
  getUser: (id) => apiClient.get(`/users/${id}`),
  updateUser: (id, userData) => apiClient.put(`/users/${id}`, userData),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),

  // Товары (с поддержкой FormData для изображений)
  getProducts: () => apiClient.get('/products'),
  getProduct: (id) => apiClient.get(`/products/${id}`),
  createProduct: (productData) => {
    const formData = new FormData();
    formData.append('title', productData.title);
    formData.append('category', productData.category);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    if (productData.image) {
      formData.append('image', productData.image);
    }
    return apiClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateProduct: (id, productData) => {
    const formData = new FormData();
    formData.append('title', productData.title);
    formData.append('category', productData.category);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    if (productData.image) {
      formData.append('image', productData.image);
    }
    return apiClient.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),
};

export default api;