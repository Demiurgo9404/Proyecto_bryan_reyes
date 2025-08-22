import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usersApi } from '../../api/client';
import { 
  FaSearch, FaFilter, FaUserEdit, FaTrashAlt, FaUserShield, FaUserSlash,
  FaChevronLeft, FaChevronRight, FaChevronDown, FaPlus, FaUserCheck,
  FaUserTimes, FaEye, FaRegEdit, FaRegTrashAlt, FaUserClock, FaCog,
  FaUsers, FaChartLine, FaTimes, FaCheck, FaUser, FaSave, FaUserPlus,
  FaCheckCircle, FaExclamationCircle, FaUpload, FaInfoCircle, FaRulerCombined
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componente para el modal de confirmación
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente para el formulario de usuario
const UserForm = ({ user, onSave, onCancel, isEditing }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || 'user',
    isActive: user?.isActive !== undefined ? user.isActive : true,
    password: '',
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Nombre de usuario *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
              disabled={isLoading || isEditing}
            />
          </div>
          
          {!isEditing && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required={!isEditing}
                disabled={isLoading}
              />
            </div>
          )}
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Rol *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
              disabled={isLoading}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
              <option value="superadmin">Super Administrador</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Usuario activo
            </label>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              'Guardando...'
            ) : isEditing ? (
              <>
                <FaSave className="mr-2 h-4 w-4" />
                Actualizar Usuario
              </>
            ) : (
              <>
                <FaUserPlus className="mr-2 h-4 w-4" />
                Crear Usuario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const UsersManagement = ({ mode = 'list' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();
  
  // Estados para la lista de usuarios
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [roleFilter, setRoleFilter] = useState('todos');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Estados para los modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Determinar si estamos en modo de edición o creación
  const isEditing = mode === 'edit';
  const isCreating = mode === 'create';
  const isList = !isEditing && !isCreating;
  
  // Mapeo de roles para mostrar en la interfaz
  const roleLabels = {
    user: 'Usuario',
    admin: 'Administrador',
    superadmin: 'Super Administrador'
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      if (isList) {
        await fetchUsers();
      } else if (isEditing && id) {
        await fetchUserById(id);
      } else if (isCreating) {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isList, isEditing, isCreating, id]);
  
  // Cargar lista de usuarios
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.list(token, { page: 1, limit: 50 });
      // Normalizar la respuesta
      const list = Array.isArray(res) ? res : res?.data?.rows || res?.data || [];
      setUsers(list);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      toast.error(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar un usuario específico para edición
  const fetchUserById = async (userId) => {
    setLoading(true);
    try {
      const userData = await usersApi.getById(token, userId);
      setCurrentUser(userData);
    } catch (err) {
      console.error('Error al cargar el usuario:', err);
      toast.error('Error al cargar los datos del usuario');
      navigate('/admin/usuarios');
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar la edición de un usuario
  const handleEdit = (user) => {
    navigate(`/admin/usuarios/${user.id}/editar`);
  };
  
  // Manejar la creación de un nuevo usuario
  const handleCreate = () => {
    navigate('/admin/usuarios/nuevo');
  };
  
  // Manejar cancelación del formulario
  const handleCancel = () => {
    navigate('/admin/usuarios');
  };
  
  // Manejar el guardado de un usuario
  const handleSaveUser = async (userData) => {
    try {
      let updatedUser;
      
      if (isEditing && currentUser) {
        // Actualizar usuario existente
        updatedUser = await usersApi.update(token, currentUser.id, userData);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
        toast.success('Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario
        updatedUser = await usersApi.create(token, userData);
        setUsers(prevUsers => [...prevUsers, updatedUser]);
        toast.success('Usuario creado correctamente');
      }
      
      // Redirigir a la lista después de guardar
      navigate('/admin/usuarios');
      return updatedUser;
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
      toast.error(error.message || 'Error al guardar el usuario');
      throw error;
    }
  };
  
  // Manejar la eliminación de un usuario
  const handleDeleteUser = async (userId) => {
    try {
      await usersApi.remove(token, userId);
      setUsers(users.filter(user => user.id !== userId));
      setShowDeleteModal(false);
      toast.success('Usuario eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      toast.error(error.message || 'Error al eliminar el usuario');
    }
  };
  
  // Mostrar el formulario de creación/edición
  if (isEditing || isCreating) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <FaChevronLeft className="mr-1" /> Volver a la lista
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <UserForm 
            user={currentUser} 
            onSave={handleSaveUser} 
            onCancel={handleCancel}
            isEditing={isEditing}
          />
        )}
      </div>
    );
  }
  
  // Filtrar usuarios según los filtros aplicados
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || 
                         (statusFilter === 'activo' && user.isActive) ||
                         (statusFilter === 'inactivo' && !user.isActive);
    
    const matchesRole = roleFilter === 'todos' || 
                       (roleFilter === 'user' && user.role === 'user') ||
                       (roleFilter === 'admin' && user.role === 'admin') ||
                       (roleFilter === 'superadmin' && user.role === 'superadmin');
    
    return matchesSearch && matchesStatus && matchesRole;
  });
  
  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Mostrar la lista de usuarios
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <FaUserPlus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="status"
              className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              id="role"
              className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="todos">Todos los roles</option>
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
              <option value="superadmin">Super Administrador</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <FaUser className="h-6 w-6 text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.fullName || 'Sin nombre'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {roleLabels[user.role] || user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            title="Editar"
                          >
                            <FaRegEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <FaRegTrashAlt className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No se encontraron usuarios que coincidan con los filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                      </span>{' '}
                      de <span className="font-medium">{filteredUsers.length}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Anterior</span>
                        <FaChevronLeft className="h-4 w-4" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Mostrar páginas alrededor de la actual
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-primary border-primary text-white'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Siguiente</span>
                        <FaChevronRight className="h-4 w-4" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          if (userToDelete) {
            handleDeleteUser(userToDelete.id);
          }
        }}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario ${userToDelete?.username}? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default UsersManagement;
