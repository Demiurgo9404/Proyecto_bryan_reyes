const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Función para manejar respuestas HTTP
async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const error = new Error(data.message || 'Error en la petición');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
}

// Función para renovar el token
async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No hay refresh token disponible');
  }

  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) {
    throw new Error('Error al renovar el token');
  }
  
  const { token, refreshToken: newRefreshToken } = await response.json();
  localStorage.setItem('token', token);
  if (newRefreshToken) {
    localStorage.setItem('refreshToken', newRefreshToken);
  }
  return token;
}

// Función principal para hacer peticiones a la API
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include'
    });

    // Si el token expiró, intentamos renovarlo
    if (response.status === 401) {
      try {
        const newToken = await refreshToken();
        // Reintentamos la petición con el nuevo token
        const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers: {
            ...headers,
            'Authorization': `Bearer ${newToken}`
          },
          credentials: 'include'
        });
        return handleResponse(retryResponse);
      } catch (refreshError) {
        // Si falla la renovación, redirigimos al login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login?session=expired';
        throw refreshError;
      }
    }

    return handleResponse(response);
  } catch (error) {
    console.error('Error en la petición:', error);
    throw error;
  }
}

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
