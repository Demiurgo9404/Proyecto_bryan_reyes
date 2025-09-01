import React, { useState, useEffect } from 'react';
import { userService } from '../../api';
import { toast } from 'react-toastify';
import { FaTimes, FaEnvelope, FaUser, FaCalendarAlt, FaCheck, FaTimes as FaTimesIcon, FaUserShield } from 'react-icons/fa';

const UserDetailModal = ({ userId, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await userService.getUserById(userId);
        setUser(userData);
      } catch (err) {
        console.error('Error al cargar el usuario:', err);
        setError('No se pudo cargar la información del usuario');
        toast.error('Error al cargar el usuario');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Cargando...</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Error</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>
          <div className="text-red-500 p-4">{error}</div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Encabezado */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Detalles del Usuario</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>
        
        {/* Contenido */}
        <div className="p-6">
          {/* Sección de información básica */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-shrink-0">
              <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.fullName || 'Usuario'} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FaUser className="h-16 w-16 text-gray-400" />
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {user.fullName || 'Usuario sin nombre'}
              </h3>
              
              <div className="flex items-center text-gray-600 mb-1">
                <FaEnvelope className="mr-2" />
                <span>{user.email}</span>
              </div>
              
              <div className="flex items-center text-gray-600 mb-1">
                <FaUser className="mr-2" />
                <span>@{user.username || 'sinusuario'}</span>
              </div>
              
              <div className="flex items-center text-gray-600 mb-1">
                <FaUserShield className="mr-2" />
                <span className="capitalize">{user.role || 'user'}</span>
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600 mb-1">
                <FaCalendarAlt className="mr-2" />
                <span>Miembro desde: {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
          
          {/* Sección de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-1">Transacciones</h4>
              <p className="text-2xl font-bold text-blue-600">{user.transactionCount || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-1">Ofertas Activas</h4>
              <p className="text-2xl font-bold text-green-600">{user.activeOffers || 0}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-purple-800 mb-1">Último Acceso</h4>
              <p className="text-sm text-purple-600">
                {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
              </p>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Información Adicional</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="text-gray-900">{user.phone || 'No proporcionado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">País</p>
                <p className="text-gray-900">{user.country || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Verificación de Email</p>
                <div className="flex items-center">
                  {user.emailVerified ? (
                    <>
                      <FaCheck className="text-green-500 mr-1" />
                      <span className="text-green-700">Verificado</span>
                    </>
                  ) : (
                    <>
                      <FaTimesIcon className="text-red-500 mr-1" />
                      <span className="text-red-700">No verificado</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado de la Cuenta</p>
                <div className="flex items-center">
                  {user.isActive ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      <span>Activa</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                      <span>Inactiva</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pie de página */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose();
              // Aquí podrías redirigir a la edición del usuario
              // navigate(`/admin/users/edit/${user.id}`);
            }}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Editar Usuario
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
