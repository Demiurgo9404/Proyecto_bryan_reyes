// Obtener el token de autenticación
export const getAuthToken = () => {
  // Check both 'token' and 'authToken' for backward compatibility
  return localStorage.getItem('token') || localStorage.getItem('authToken');
};

// Guardar el token de autenticación
export const setAuthToken = (token) => {
  if (token) {
    // Store in both places for backward compatibility
    localStorage.setItem('token', token);
    localStorage.setItem('authToken', token);
  } else {
    // Remove both on logout
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user'); // Also clear user data
  }
};

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  // Verify token expiration if it's a JWT
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp < Date.now() / 1000) {
      // Token expired
      setAuthToken(null);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Error verifying token:', e);
    return false;
  }
};

// Cerrar sesión
export const logout = () => {
  // Clear all auth related data
  setAuthToken(null);
  localStorage.removeItem('user');
  // Redirigir al login
  window.location.href = '/login';
};

// Obtener información del usuario desde el token (si es necesario)
export const getUserFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    // Decodificar el token JWT (asumiendo que es un JWT)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
};
