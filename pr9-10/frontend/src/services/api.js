import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Перехватчик запросов - добавляем токен
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('Запрос с токеном:', config.method, config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Перехватчик ответов - обрабатываем ошибки
apiClient.interceptors.response.use(
  (response) => {
    console.log('Успешный ответ:', response.config.method, response.config.url, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.log('Ошибка ответа:', error.response?.status, error.config?.url);
    
    // Если ошибка 401 и это не повторный запрос и есть refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        console.log('Нет refresh token, редирект на логин');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      try {
        console.log('Пробуем обновить токены...');
        
        const response = await axios.post('http://localhost:3000/api/auth/refresh', {
          refreshToken
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        console.log('Токены обновлены успешно');
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        console.log('Ошибка обновления токенов:', refreshError.response?.status);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Для других ошибок показываем сообщение
    if (error.response?.status === 403) {
      alert('Нет прав для этого действия');
    } else if (error.response?.status === 404) {
      alert('Товар не найден');
    } else if (error.response?.status === 400) {
      alert('Ошибка в данных: ' + (error.response.data.error || 'Проверьте введенные данные'));
    }
    
    return Promise.reject(error);
  }
);

const api = {
  // Аутентификация
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getMe: () => apiClient.get('/auth/me'),
  
  // Товары
  getProducts: () => apiClient.get('/products'),
  getProduct: (id) => apiClient.get(`/products/${id}`),
  createProduct: (product) => apiClient.post('/products', product),
  updateProduct: (id, product) => apiClient.put(`/products/${id}`, product),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),
};

export default api;
