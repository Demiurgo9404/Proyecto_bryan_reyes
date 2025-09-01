import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService } from '../../api/userService';
import { useAuth } from '../../contexts/AuthContext';
import { FaSave, FaTimes, FaEye, FaEyeSlash, FaCamera, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';

const UserForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  
    // Available user roles with descriptions
  const availableRoles = [
    { 
      value: 'superadmin', 
      label: 'Superadministrador',
      description: 'Acceso total al sistema con todos los privilegios'
    },
    { 
      value: 'admin', 
      label: 'Administrador',
      description: 'Acceso completo al panel de administración'
    },
    { 
      value: 'estudio', 
      label: 'Estudio',
      description: 'Estudio fotográfico con funciones específicas'
    },
    { 
      value: 'modelo', 
      label: 'Modelo',
      description: 'Modelo con perfil público y funcionalidades específicas'
    },
    { 
      value: 'usuario', 
      label: 'Usuario',
      description: 'Usuario estándar con funcionalidades básicas'
    }
  ];

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'usuario',
    isActive: true,
    bio: '',
    birthDate: '',
    age: '',
    gender: '',
    phone: '',
    profilePicture: null,
    coverPhoto: null,
    profilePicturePreview: null,
    coverPhotoPreview: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user data if in edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      loadUserData();
    }
  }, [id, mode]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await userService.getUserById(id);
      setFormData(prev => ({
        ...prev,
        ...user,
        password: '', // Don't load password hash
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Error al cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    return age >= 0 ? age : '';
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [name]: file,
          [`${name}Preview`]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : 
                type === 'file' ? files[0] :
                value
      };

      // Calculate age when birthDate changes
      if (name === 'birthDate') {
        newData.age = calculateAge(value);
      }

      return newData;
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) newErrors.username = 'El nombre de usuario es requerido';
    if (!formData.email.trim()) newErrors.email = 'El correo electrónico es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Correo electrónico inválido';
    
    if (mode === 'create') {
      if (!formData.password) newErrors.password = 'La contraseña es requerida';
      else if (formData.password.length < 8) newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (!formData.role) newErrors.role = 'Debe seleccionar un rol';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userData = { ...formData };
      
      // Remove confirmPassword before sending
      delete userData.confirmPassword;
      
      // If password is empty in edit mode, remove it
      if (mode === 'edit' && !userData.password) {
        delete userData.password;
      }
      
      // Handle file upload if profile picture is selected
      if (userData.profilePicture instanceof File) {
        const formDataFile = new FormData();
        formDataFile.append('profilePicture', userData.profilePicture);
        // TODO: Implement file upload logic
      }
      
      if (mode === 'create') {
        await userService.createUser(userData);
        toast.success('Usuario creado exitosamente');
      } else {
        await userService.updateUser(id, userData);
        toast.success('Usuario actualizado exitosamente');
      }
      
      navigate('/admin/users');
      
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar el usuario';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  // Render profile and cover photo previews
  const renderImagePreview = (preview, defaultIcon, alt) => {
    if (preview) {
      return (
        <div className="mt-2 relative group">
          <img 
            src={preview} 
            alt={alt} 
            className="h-32 w-full object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-sm font-medium">Cambiar</span>
          </div>
        </div>
      );
    }
    return (
      <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          {defaultIcon}
          <div className="flex text-sm text-gray-600">
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-rose-600 hover:text-rose-500 focus-within:outline-none">
              <span>Subir archivo</span>
              <input type="file" className="sr-only" />
            </label>
            <p className="pl-1">o arrastra y suelta</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Cover Photo */}
      <div className="h-48 bg-gradient-to-r from-rose-400 to-pink-500 relative">
        <label className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black bg-opacity-40 transition-opacity cursor-pointer">
          <input 
            type="file" 
            name="coverPhoto"
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="bg-white bg-opacity-80 text-rose-600 p-2 rounded-full">
            <FaCamera className="h-5 w-5" />
          </div>
        </label>
        {formData.coverPhotoPreview && (
          <img 
            src={formData.coverPhotoPreview} 
            alt="Portada" 
            className="h-full w-full object-cover"
          />
        )}
        
        {/* Profile Picture */}
        <div className="absolute -bottom-16 left-6">
          <div className="relative group">
            <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
              {formData.profilePicturePreview ? (
                <img 
                  src={formData.profilePicturePreview} 
                  alt="Perfil" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                  <FaUser className="h-16 w-16" />
                </div>
              )}
            </div>
            <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <input 
                type="file" 
                name="profilePicture"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <FaCamera className="text-white h-6 w-6" />
            </label>
          </div>
        </div>
      </div>

      <div className="px-6 pt-20 pb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
            </h1>
            {formData.age && (
              <p className="text-sm text-gray-500">
                Edad: {formData.age} años
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-600">Estado:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {formData.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </label>
            </div>
            <button
              onClick={() => navigate('/admin/usuarios')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              <FaTimes className="inline mr-1" /> Cancelar
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Información Básica</h2>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nombre de usuario <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm ${errors.username ? 'border-red-500' : ''}`}
                required
              />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm ${errors.email ? 'border-red-500' : ''}`}
                required
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {mode === 'create' ? 'Contraseña' : 'Nueva contraseña'} <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  required={mode === 'create'}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Mínimo 8 caracteres
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña {mode === 'create' && <span className="text-red-500">*</span>}
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  required={mode === 'create'}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Perfil</h2>
            
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Nombres
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Apellidos
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableRoles.map((role) => (
                  <div key={role.value} className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={`role-${role.value}`}
                        name="role"
                        type="radio"
                        checked={formData.role === role.value}
                        onChange={() => setFormData(prev => ({ ...prev, role: role.value }))}
                        className="focus:ring-rose-500 h-4 w-4 text-rose-600 border-gray-300"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label 
                        htmlFor={`role-${role.value}`} 
                        className="font-medium text-gray-700 cursor-pointer"
                      >
                        {role.label}
                      </label>
                      <p className="text-gray-500 text-xs">
                        {role.description || 'Sin descripción'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Género
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm"
              >
                <option value="">Seleccionar género</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
                <option value="prefer_not_to_say">Prefiero no decirlo</option>
              </select>
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                Fecha de nacimiento
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm"
                />
                {formData.age && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{formData.age} años</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
                Foto de perfil
              </label>
              <input
                type="file"
                id="profilePicture"
                name="profilePicture"
                onChange={handleChange}
                accept="image/*"
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-rose-50 file:text-rose-700
                  hover:file:bg-rose-100"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Usuario activo</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Biografía
          </label>
          <div className="mt-1">
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              className="shadow-sm focus:ring-rose-500 focus:border-rose-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
              placeholder="Una breve descripción sobre el usuario..."
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Máximo 500 caracteres
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-rose-600 border border-transparent rounded-md shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Guardando...' : 'Guardar Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
