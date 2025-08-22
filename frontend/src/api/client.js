const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
export const getToken = (skipExpirationCheck = false) => {
  try {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      console.warn('No token found in localStorage');
      return null;
    }
    
    // Skip expiration check when called from getAuthHeaders
    if (!skipExpirationCheck) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.warn('Token expired');
          return null;
        }
      } catch (e) {
        console.warn('Error decoding token:', e);
        return null;
      }
    }
    
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Default headers configuration
const getAuthHeaders = () => {
  // Skip expiration check to prevent token removal during API calls
  const token = getToken(true);
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('Could not get token for authentication');
  }
  
  return headers;
};

// Check if response is an authentication error
const isUnauthorized = (response) => {
  return response.status === 401 || response.status === 403;
};

// HTTP response handler
const handleResponse = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  let data;
  
  try {
    data = isJson ? await res.json().catch(() => ({})) : await res.text();
  } catch (error) {
    console.error('Error processing response:', error);
    throw new Error('Error processing server response');
  }
  
  if (!res.ok) {
    // If the token has expired or is invalid
    if (isUnauthorized(res)) {
      // Clear invalid token
      localStorage.removeItem('token');
      // If we are on the client, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login?session=expired';
      }
      throw new Error('Your session has expired. Please log in again.');
    }
    
    const message = (isJson && (data?.error || data?.message)) || res.statusText || 'Request error';
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  
  return data;
};

// Function to make authenticated HTTP requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const isAuthEndpoint = endpoint.startsWith('/auth/');
  
  // Get current token (skip expiration check to prevent immediate logout)
  const token = getToken(true);
  
  // For non-auth endpoints, ensure we have a valid token
  if (!isAuthEndpoint) {
    if (!token) {
      const error = new Error('No authentication token found');
      error.status = 401;
      throw error;
    }
    
    // Check token expiration if this is not a retry
    if (!options._retry) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          throw new Error('Token expired');
        }
      } catch (e) {
        console.warn('Token validation failed:', e.message);
        const error = new Error('Session expired. Please log in again.');
        error.status = 401;
        throw error;
      }
    }
  }

  // Request configuration
  const { method = 'GET', headers = {}, body, ...restOptions } = options;
  
  const requestOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...headers
    },
    ...(body && { body: JSON.stringify(body) }),
    ...restOptions
  };

  // Log the request (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${method} ${url}`, { 
      headers: requestOptions.headers,
      hasBody: !!body 
    });
  }
  
  try {
    const response = await fetch(url, requestOptions);
    
    // If the response is 401 (Unauthorized), handle session expiration
    if (isUnauthorized(response)) {
      // If this was a retry, don't retry again
      if (options._retry) {
        const error = new Error('Session expired. Please log in again.');
        error.status = 401;
        throw error;
      }
      
      // Try to refresh the token if this is the first 401
      try {
        // Attempt to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshToken}`
            }
          });
          
          if (refreshResponse.ok) {
            const { token: newToken } = await refreshResponse.json();
            localStorage.setItem('token', newToken);
            
            // Retry the original request with the new token
            return apiRequest(endpoint, {
              ...options,
              _retry: true,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${newToken}`
              }
            });
          }
        }
      } catch (refreshError) {
        console.warn('Token refresh failed:', refreshError);
      }
      
      // If we get here, token refresh failed or wasn't possible
      const error = new Error('Session expired. Please log in again.');
      error.status = 401;
      throw error;
    }
    
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error in request ${method} ${url}:`, error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to server. Please check your connection.');
    }
    
    // If it's an authentication error, clear token and redirect
    if (error.message.includes('Not authorized') || error.message.includes('session has expired')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?session=expired';
      }
    }
    
    throw error;
  }
};

// API de autenticación
export const authApi = {
  login: async (email, password) => {
    try {
      console.log('Enviando credenciales al servidor...');
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Importante para manejar cookies
      });

      console.log('Respuesta HTTP recibida:', {
        status: response.status,
        statusText: response.statusText
      });

      const data = await handleResponse(response);
      console.log('Datos de respuesta procesados:', data);

      if (!data) {
        throw new Error('No se recibieron datos del servidor');
      }

      if (!data.token) {
        console.error('No se recibió token en la respuesta:', data);
        throw new Error(data.message || 'Credenciales inválidas');
      }

      if (!data.user) {
        console.error('No se recibieron datos del usuario en la respuesta:', data);
        throw new Error('Datos de usuario no recibidos');
      }

      console.log('Login exitoso para el usuario:', data.user.email);
      return {
        token: data.token,
        user: data.user
      };
    } catch (error) {
      console.error('Error en login:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      
      // Mejorar mensajes de error para el usuario
      if (error.message.includes('Failed to fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      
      if (error.status === 401) {
        throw new Error('Correo o contraseña incorrectos');
      }
      
      throw new Error(error.message || 'Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    }
  },

  getMe: async (token) => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = new Error('Failed to fetch user data');
        error.status = response.status;
        throw error;
      }
      
      const data = await response.json();
      return data.user || data.data || data;
    } catch (error) {
      console.error('Error in getMe:', error);
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      throw error;
    }
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST'
    });
  }
};

// API de usuarios
export const usersApi = {
  // Obtener todos los usuarios
  list: async () => {
    try {
      const token = getToken(true);
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_BASE}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Clear auth data if unauthorized
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          const error = new Error('Session expired. Please log in again.');
          error.status = 401;
          throw error;
        }
        const error = new Error('Failed to fetch users');
        error.status = response.status;
        throw error;
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : (data.users || []);
    } catch (error) {
      console.error('Error in usersApi.list:', error);
      throw error;
    }
  },
  
  // Obtener usuario por ID
  getById: async (id) => {
    if (!id) throw new Error('Se requiere un ID de usuario');
    return apiRequest(`/users/${id}`, { method: 'GET' });
  },
  
  // Crear usuario
  create: async (userData) => {
    if (!userData) throw new Error('Se requieren datos de usuario');
    return apiRequest('/users', {
      method: 'POST',
      body: userData
    });
  },
  
  // Actualizar usuario
  update: async (id, userData) => {
    if (!id || !userData) throw new Error('Se requiere ID y datos de usuario');
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: userData
    });
  },
  
  // Eliminar usuario
  remove: async (id) => {
    if (!id) throw new Error('Se requiere un ID de usuario');
    return apiRequest(`/users/${id}`, { method: 'DELETE' });
  },
  
  // Activar usuario
  activate: async (id) => {
    if (!id) throw new Error('Se requiere un ID de usuario');
    return apiRequest(`/users/${id}/activate`, { method: 'PUT' });
  },
  
  // Desactivar usuario
  deactivate: async (id) => {
    if (!id) throw new Error('Se requiere un ID de usuario');
    return apiRequest(`/users/${id}/deactivate`, { method: 'PUT' });
  }
};
