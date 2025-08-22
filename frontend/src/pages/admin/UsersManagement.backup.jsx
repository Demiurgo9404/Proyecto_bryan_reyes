import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usersApi } from '../../api/client';
import { 
  FaSearch, 
  FaFilter, 
  FaUserEdit, 
  FaTrashAlt, 
  FaUserShield,
  FaUserSlash,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaPlus,
  FaUserCheck,
  FaUserTimes,
  FaEye,
  FaRegEdit,
  FaRegTrashAlt,
  FaUserClock,
  FaCog,
  FaUsers,
  FaChartLine,
  FaTimes,
  FaCheck,
  FaUser,
  FaSave,
  FaUserPlus,
  FaCheckCircle,
  FaExclamationCircle,
  FaUpload,
  FaInfoCircle,
  FaRulerCombined
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
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
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
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
const UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    // Información básica
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || 'user',
    isActive: user?.isActive !== undefined ? user.isActive : true,
    isVerified: user?.isVerified || false,
    password: '',
    
    // Información del perfil
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    gender: user?.gender || 'prefiero no decirlo',
    birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
    phone: user?.phone || '',
    location: user?.location || '',
    profilePicture: user?.profilePicture || '',
    coverPhoto: user?.coverPhoto || '',
    
    // Dirección de facturación
    billingLine1: user?.billingLine1 || '',
    billingLine2: user?.billingLine2 || '',
    billingCity: user?.billingCity || '',
    billingState: user?.billingState || '',
    billingPostalCode: user?.billingPostalCode || '',
    billingCountry: user?.billingCountry || '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(user?.profilePicture || '');
  const [activeTab, setActiveTab] = useState('profile');

  // Opciones para los select
  const genderOptions = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' },
    { value: 'prefiero no decirlo', label: 'Prefiero no decirlo' },
  ];

  const roleOptions = [
    { value: 'user', label: 'Usuario' },
    { value: 'model', label: 'Modelo' },
    { value: 'agency', label: 'Agencia' },
    { value: 'admin', label: 'Administrador' },
  ];

  const validateForm = () => {
    const newErrors = {};
    
    // Validación de nombre de usuario
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    } else if (formData.username.length > 20) {
      newErrors.username = 'El nombre de usuario no puede exceder los 20 caracteres';
    }
    
    // Validación de email
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    } else if (formData.email.length > 255) {
      newErrors.email = 'El correo no puede exceder los 255 caracteres';
    }

    // Validación de contraseña para nuevo usuario
    if (!user && !formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (formData.password && formData.password.length > 100) {
      newErrors.password = 'La contraseña no puede exceder los 100 caracteres';
    }

    // Validación de teléfono si se proporciona
    if (formData.phone && !/^\+?[0-9\s-]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    // Validación de fecha de nacimiento si se proporciona
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const minAgeDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      
      if (birthDate > minAgeDate) {
        newErrors.birthDate = 'Debes tener al menos 18 años';
      }
    }

    // Validación de imagen
    if (formData.avatar) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 2 * 1024 * 1024; // 2MB
      
      // Validar tipo de archivo
      if (!validTypes.includes(formData.avatar.type)) {
        newErrors.avatar = 'Formato de imagen no válido. Use JPG, PNG o WebP';
      } 
      // Validar tamaño del archivo
      else if (formData.avatar.size > maxSize) {
        newErrors.avatar = 'La imagen no debe superar los 2MB';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'avatar' && files && files[0]) {
      const file = files[0];
      
      // Validar dimensiones de la imagen
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = function() {
        const minDimensions = { width: 100, height: 100 };
        const maxDimensions = { width: 2000, height: 2000 };
        
        if (this.width < minDimensions.width || this.height < minDimensions.height) {
          setErrors(prev => ({
            ...prev,
            avatar: `La imagen debe ser de al menos ${minDimensions.width}x${minDimensions.height}px`
          }));
          return;
        }
        
        if (this.width > maxDimensions.width || this.height > maxDimensions.height) {
          setErrors(prev => ({
            ...prev,
            avatar: `La imagen no debe exceder ${maxDimensions.width}x${maxDimensions.height}px`
          }));
          return;
        }
        
        // Si pasa todas las validaciones, actualizar el estado
        setFormData(prev => ({
          ...prev,
          [name]: file
        }));
        
        // Crear vista previa
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      };
      
      img.onerror = function() {
        setErrors(prev => ({
          ...prev,
          avatar: 'Error al cargar la imagen. Intente con otro archivo.'
        }));
      };
      
      img.src = objectUrl;
    } else {
      // Para otros campos que no son archivos
      setFormData(prev => {
        const newData = {
          ...prev,
          [name]: value
        };
        
        // Validación en tiempo real para campos de texto
        if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          setErrors(prev => ({
            ...prev,
            [name]: 'El correo electrónico no es válido'
          }));
        } else if (name === 'password' && value && value.length < 8) {
          setErrors(prev => ({
            ...prev,
            [name]: 'La contraseña debe tener al menos 8 caracteres'
          }));
        } else if (errors[name]) {
          // Limpiar el error si el campo ahora es válido
          const newErrors = { ...errors };
          delete newErrors[name];
          setErrors(newErrors);
        }
        
        return newData;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-gray-900">
          {user ? 'Editar Perfil' : 'Crear Nuevo Usuario'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {user ? 'Actualiza la información del usuario' : 'Completa la información para crear un nuevo usuario'}
        </p>
      </div>
      
      {/* Sección de Información Básica */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <FaUser className="h-5 w-5 text-indigo-500 mr-2" />
          Información Básica
        </h3>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Avatar Upload */}
          <div className="md:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="shrink-0 flex justify-center">
                <div className="relative">
                  {preview ? (
                    <div className="relative group">
                      <img 
                        className="h-32 w-32 object-cover rounded-full border-4 border-white shadow-lg" 
                        src={preview} 
                        alt="Vista previa"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <FaUserEdit className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <FaUser className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Foto de perfil</h4>
                  <div className="flex flex-wrap gap-3">
                    <div>
                      <label 
                        htmlFor="avatar" 
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 cursor-pointer"
                      >
                        <FaUpload className="h-4 w-4 mr-2 text-gray-500" />
                        {preview ? 'Cambiar foto' : 'Subir foto'}
                      </label>
                      <input
                        id="avatar"
                        name="avatar"
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        onChange={handleChange}
                        className="hidden"
                      />
                    </div>
                    {preview && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreview('');
                          setFormData(prev => ({ ...prev, avatar: null }));
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FaTrashAlt className="h-4 w-4 mr-1.5" />
                        Eliminar
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    <FaRulerCombined className="inline mr-1" />
                    Mínimo: 100x100px - Máximo: 2MB
                  </p>
                  {errors.avatar && (
                    <p className="mt-1 text-sm text-red-600">{errors.avatar}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Nombre de usuario */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Nombre de usuario <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">@</span>
              </div>
              <input
                type="text"
                name="username"
                id="username"
                required
                value={formData.username}
                onChange={handleChange}
                className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md ${errors.username ? 'border-red-300' : ''}`}
                placeholder="juanperez"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p className="flex items-start">
                      <FaInfoCircle className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0 text-gray-400" />
                      <span>Formatos: JPG, PNG, WebP (Máx. 2MB)</span>
                    </p>
                    <p className="flex items-start">
                      <FaRulerCombined className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0 text-gray-400" />
                      <span>Mínimo: 100x100px - Máximo: 2000x2000px</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
            >
              {user ? (
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({});
  
  // Determinar si estamos en modo de edición o creación
  const isEditing = mode === 'edit';
  const isCreating = mode === 'create';
  
  // Helpers de mapeo backend <-> UI
  const toUiUser = (u) => ({
    id: u.id,
    name: u.name || u.username || '',
    email: u.email,
    role: u.role || 'user',
    status: u.isActive === false ? 'inactivo' : 'activo'
  });

  const toBackendPayload = (data) => ({
    name: data.name,
    email: data.email,
    role: data.role === 'usuario' ? 'user' : data.role,
    isActive: data.status ? data.status === 'activo' : undefined,
    ...(data.password ? { password: data.password } : {})
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.list(token, { page: 1, limit: 50 });
      // Normalizar posibles formas de respuesta
      const list = Array.isArray(res)
        ? res
        : res?.data?.rows || res?.data || res?.users || res?.rows || [];
      setUsers(list.map(toUiUser));
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      toast.error(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (mode === 'list') {
        await fetchUsers();
      } else if (mode === 'edit' && id) {
        await fetchUserById(id);
      } else if (mode === 'create') {
        setLoading(false);
      }
    };
    
    loadData();
  }, [mode, id]);

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

  // Efecto para cargar el usuario a editar
  useEffect(() => {
    if (isEditing) {
      const userId = parseInt(location.pathname.split('/').pop(), 10);
      const userToEdit = users.find(user => user.id === userId);
      setEditingUser(userToEdit || null);
    } else if (isCreating) {
      setEditingUser(null);
    }
  }, [location.pathname, isEditing, isCreating, users]);

  // Función para manejar el guardado de un usuario
  const handleSaveUser = async (userData) => {
    try {
      let updatedUser;
      
      if (isEditing && currentUser) {
        // Actualizar usuario existente
        updatedUser = await usersApi.update(token, currentUser.id, toBackendPayload(userData));
        setUsers(users.map(u => u.id === currentUser.id ? toUiUser(updatedUser) : u));
        toast.success('Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario
        updatedUser = await usersApi.create(token, toBackendPayload(userData));
        setUsers(prevUsers => [...prevUsers, toUiUser(updatedUser)]);
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

  // Función para manejar la edición de un usuario
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

  // Función para eliminar un usuario (soft delete en backend)
  const handleDeleteUser = async (userId) => {
    try {
      await usersApi.remove(token, userId);
      setShowDeleteModal(false);
      toast.success('Usuario eliminado correctamente');
      await fetchUsers();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      toast.error(err.message || 'Error al eliminar el usuario');
    }
  };

  // Función para cambiar el estado de un usuario
  const toggleStatus = async (userId, currentStatus) => {
    try {
      if (currentStatus === 'activo') {
        await usersApi.deactivate(token, userId);
      } else {
        await usersApi.activate(token, userId);
      }
      toast.success(`Usuario ${currentStatus === 'activo' ? 'desactivado' : 'activado'} correctamente`);
      await fetchUsers();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      toast.error(err.message || 'Error al cambiar estado del usuario');
    }
  };

  // Filtrar usuarios según los filtros y búsqueda
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || user.status === statusFilter;
    const matchesRole = roleFilter === 'todos' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Calcular usuarios para la página actual
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Si estamos en modo de edición o creación, mostrar el formulario
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
        <UserForm 
          user={currentUser} 
          onSave={handleSaveUser} 
          onCancel={handleCancel}
          isEditing={isEditing}
        />
      </div>
    );
  }

  // Mostrar la lista de usuarios
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <Link
          to="/admin/usuarios/nuevo"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <FaPlus className="mr-2" /> Agregar Usuario
        </Link>
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
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              id="role"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="todos">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="usuario">Usuario</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
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
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <FaUserClock className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'activo' 
                          ? 'bg-green-100 text-green-800' 
                          : user.status === 'inactivo'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.status === 'activo' ? 'Activo' : user.status === 'inactivo' ? 'Inactivo' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <Link
                          to={`/admin/usuarios/editar/${user.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar"
                        >
                          <FaRegEdit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setUserToDelete(user.id);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <FaRegTrashAlt className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(user.id, user.status)}
                          className={user.status === 'activo' 
                            ? 'text-yellow-600 hover:text-yellow-900' 
                            : 'text-green-600 hover:text-green-900'
                          }
                          title={user.status === 'activo' ? 'Desactivar' : 'Activar'}
                        >
                          {user.status === 'activo' ? (
                            <FaUserSlash className="h-4 w-4" />
                          ) : (
                            <FaUserCheck className="h-4 w-4" />
                          )}
                        </button>
                      </div>
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
        {filteredUsers.length > itemsPerPage && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{indexOfFirstUser + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastUser, filteredUsers.length)}
                  </span>{' '}
                  de <span className="font-medium">{filteredUsers.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Siguiente</span>
                    <FaChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          handleDeleteUser(userToDelete);
          setShowDeleteModal(false);
        }}
        title="Eliminar Usuario"
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
      />

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default UsersManagement;
