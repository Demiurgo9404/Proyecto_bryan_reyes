const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Función para renovar el token
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No hay refresh token disponible');
    
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) throw new Error('Error al renovar el token');
    
    const { token, refreshToken: newRefreshToken } = await response.json();
    localStorage.setItem('token', token);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    return token;
  } catch (error) {
    console.error('Error renovando token:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login?session=expired';
    throw error;
  }
};

// Función principal para hacer peticiones a la API
export const apiRequest = async (endpoint, options = {}) => {
  let token = localStorage.getItem('token');
  let isRefreshing = false;
  
  // Configuración base de la petición
  const getConfig = (token) => ({
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include' // Importante para CORS
  });

  // Función para hacer la petición
  const makeRequest = async (token) => {
    const url = `${API_BASE}${endpoint}`;
    const requestId = Math.random().toString(36).substr(2, 9);
    
    // Log request details
    console.group(`🌐 [API ${requestId}] ${options.method || 'GET'} ${endpoint}`);
    console.log('📤 Request:', {
      method: options.method || 'GET',
      endpoint,
      headers: {
        ...getConfig(token).headers,
        // Obfuscate token in logs
        Authorization: token ? 'Bearer ***' : undefined
      },
      body: options.body
    });
    
    try {
      const response = await fetch(url, getConfig(token));
      
      // Log response details
      const responseData = await response.clone().json().catch(() => ({}));
      console.log('📥 Response:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      
      return response;
    } finally {
      console.groupEnd();
    }
  };

  try {
    // Primera petición
    let response = await makeRequest(token);
    
    // Si el token expiró, intentamos renovarlo
    if (response.status === 401 && !isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshToken();
        // Reintentamos la petición con el nuevo token
        response = await makeRequest(newToken);
      } catch (refreshError) {
        // Si hay error al renovar, redirigimos al login
        window.location.href = '/login?session=expired';
        throw new Error('Sesión expirada');
      }
    }

    // Manejo de errores
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || 'Error en la petición');
      error.status = response.status;
      error.data = errorData;
      
      // Redirigir si no está autorizado
      if (response.status === 403) {
        window.location.href = '/unauthorized';
      }
      
      throw error;
    }

    // Retornamos la respuesta exitosa
    return response.json();
  } catch (error) {
    console.error('Error en la petición:', {
      endpoint,
      error: error.message,
      status: error.status
    });
    throw error;
  }
};

// API de autenticación
export const authApi = {
  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
    }
    
    return response;
  },
  
  getMe: () => apiRequest('/auth/me'),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
};

// API de usuarios
export const usersApi = {
  list: () => apiRequest('/users'),
  getById: (id) => apiRequest(`/users/${id}`),
  create: (userData) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  update: (id, userData) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),
  delete: (id) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
  activate: (id) => apiRequest(`/users/${id}/activate`, { method: 'PATCH' }),
  deactivate: (id) => apiRequest(`/users/${id}/deactivate`, { method: 'PATCH' })
};

// Exportar las APIs por defecto
export default {
  auth: authApi,
  users: usersApi
};
