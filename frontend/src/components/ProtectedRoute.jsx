import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ adminOnly = false, roles = null, children }) => {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Redirect paths based on user role
  const getRoleBasedRedirect = (userRole) => {
    switch(userRole) {
      case 'admin':
        return '/admin';
      case 'model':
        return '/model/dashboard';
      case 'user':
        return '/user/dashboard';
      default:
        return '/login';
    }
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    let isMounted = true;
    let isVerifying = false;

    const verifyAuth = async () => {
      // Evitar múltiples verificaciones simultáneas
      if (authChecked || isVerifying) return;
      isVerifying = true;
      
      try {
        console.log('[ProtectedRoute] Iniciando verificación de autenticación...');
        const authResult = await isAuthenticated();
        
        if (!isMounted) {
          isVerifying = false;
          return;
        }
        
        console.log('[ProtectedRoute] Resultado de autenticación:', authResult);
        
        if (!authResult) {
          console.log('[ProtectedRoute] No autenticado, redirigiendo a login');
          // Solo redirigir si no estamos ya en la página de login
          if (!window.location.pathname.includes('/login')) {
            navigate('/login', { 
              state: { 
                from: location.pathname,
                message: 'Por favor inicia sesión para continuar'
              },
              replace: true
            });
          }
          return;
        }

        // Si llegamos aquí, el usuario está autenticado
        if (isMounted) {
          setIsAuth(true);
          
          // Redirigir según el rol del usuario si está en una ruta que no corresponde
          const currentPath = location.pathname;
          const userRole = user?.role?.toLowerCase();
          const allowedForUser = !adminOnly && (!roles || roles.some(r => r.toLowerCase() === userRole));
          
          // Si el usuario no tiene permiso para la ruta actual, redirigir según su rol
          if (!allowedForUser) {
            const redirectTo = getRoleBasedRedirect(userRole);
            if (!currentPath.startsWith(redirectTo)) {
              console.log(`[ProtectedRoute] Redirigiendo usuario con rol ${userRole} a ${redirectTo}`);
              navigate(redirectTo, { replace: true });
              return;
            }
          }
          console.log('[ProtectedRoute] Usuario autenticado:', { 
            id: user?.id, 
            email: user?.email, 
            role: user?.role,
            is_verified: user?.is_verified,
            is_active: user?.is_active
          });
        }
        
      } catch (error) {
        console.error('[ProtectedRoute] Error al verificar autenticación:', error);
        if (isMounted && !window.location.pathname.includes('/login')) {
          // Limpiar datos de autenticación en caso de error
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          navigate('/login', { 
            state: { 
              from: location.pathname,
              message: 'Tu sesión ha expirado o hay un problema de autenticación. Por favor inicia sesión nuevamente.'
            },
            replace: true
          });
        }
      } finally {
        if (isMounted) {
          setAuthChecked(true);
          isVerifying = false;
        }
      }
    };
    
    // Pequeño retraso para evitar múltiples verificaciones
    const timer = setTimeout(() => {
      verifyAuth();
    }, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isAuthenticated, user, location.pathname, navigate, authChecked]);

  // Mostrar cargador mientras se verifica la autenticación
  if (loading || !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Si no está autenticado, mostrar cargador mientras se verifica
  if (!isAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Si la ruta es solo para administradores y el usuario no es administrador
  if (adminOnly && !isAdmin()) {
    console.log('[ProtectedRoute] Ruta solo para administradores');
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Si se especifican roles permitidos, verificar el rol del usuario
  if (roles && Array.isArray(roles) && roles.length > 0) {
    console.log('[ProtectedRoute] Verificando roles:', { 
      userRole: user?.role, 
      allowedRoles: roles,
      user: user
    });
    
    if (!user || !roles.includes(user.role)) {
      console.log('[ProtectedRoute] Rol no autorizado');
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }
  
  // Verificar si el usuario está verificado
  if (user && user.is_verified === false) {
    console.log('[ProtectedRoute] Usuario no verificado');
    return <Navigate 
      to="/verify-email" 
      state={{ 
        from: location,
        message: 'Por favor verifica tu correo electrónico para continuar.'
      }} 
      replace 
    />;
  }

  // Verificar si el usuario está activo
  if (user && user.is_active === false) {
    console.log('[ProtectedRoute] Usuario inactivo');
    return <Navigate 
      to="/login" 
      state={{ 
        from: location,
        message: 'Tu cuenta ha sido desactivada. Contacta al soporte.'
      }} 
      replace 
    />;
  }

  // Si todo está bien, renderizar los hijos
  console.log('[ProtectedRoute] Acceso concedido a la ruta:', location.pathname);
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
