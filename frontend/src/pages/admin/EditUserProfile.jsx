import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usersApi } from '../../api/client';
import { FaArrowLeft, FaSave, FaUpload, FaTrash, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBirthdayCake, FaVenusMars } from 'react-icons/fa';
import { toast } from 'react-toastify';

const EditUserProfile = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  // User profile state
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    birthDate: '',
    gender: 'other',
    website: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    preferences: {
      notifications: true,
      emailNotifications: true,
      darkMode: false
    }
  });

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const response = await usersApi.getById(token, id);
        setUserData(prev => ({
          ...prev,
          ...response.data,
          ...response.data.profile // Assuming profile data is nested
        }));
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Error al cargar los datos del usuario');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setUserData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setUserData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'profile') {
        setProfileImage(reader.result);
      } else {
        setCoverImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const formData = new FormData();
      
      // Append user data
      Object.entries(userData).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      
      // Append images if they exist
      if (profileImage) {
        const blob = await fetch(profileImage).then(r => r.blob());
        formData.append('profileImage', blob, 'profile.jpg');
      }
      
      if (coverImage) {
        const blob = await fetch(coverImage).then(r => r.blob());
        formData.append('coverImage', blob, 'cover.jpg');
      }
      
      await usersApi.update(token, id, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Perfil actualizado con éxito');
      navigate('/admin/usuarios');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Editar Perfil de Usuario</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Photo */}
        <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden">
          {coverImage ? (
            <img 
              src={coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
          )}
          <label className="absolute bottom-4 right-4 bg-white bg-opacity-80 px-4 py-2 rounded-full text-sm font-medium text-gray-700 cursor-pointer hover:bg-opacity-100 transition">
            <FaUpload className="inline mr-2" />
            Cambiar foto de portada
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'cover')}
            />
          </label>
        </div>

        {/* Profile Picture and Basic Info */}
        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 px-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-4xl text-gray-500">
                    {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100">
              <FaUpload className="text-gray-600" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'profile')}
              />
            </label>
          </div>

          <div className="ml-0 md:ml-6 mt-4 md:mt-0 w-full">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="w-full md:w-1/2 mt-2 md:mt-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Acerca de</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
                  <textarea
                    name="bio"
                    value={userData.bio || ''}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cuéntanos sobre ti..."
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaVenusMars className="text-gray-400" />
                      </div>
                      <select
                        name="gender"
                        value={userData.gender || 'other'}
                        onChange={handleChange}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                        <option value="prefer_not_to_say">Prefiero no decirlo</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaBirthdayCake className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="birthDate"
                        value={userData.birthDate || ''}
                        onChange={handleChange}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={userData.location || ''}
                      onChange={handleChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="¿Dónde vives?"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sitio web</label>
                  <input
                    type="url"
                    name="website"
                    value={userData.website || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://tusitio.com"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Información de contacto</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone || ''}
                      onChange={handleChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico alternativo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="alternateEmail"
                      value={userData.alternateEmail || ''}
                      onChange={handleChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="email@alternativo.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Redes Sociales</h2>
              <div className="space-y-4">
                {Object.entries({
                  facebook: 'Facebook',
                  twitter: 'Twitter',
                  instagram: 'Instagram',
                  linkedin: 'LinkedIn'
                }).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">@</span>
                      </div>
                      <input
                        type="text"
                        name={`socialMedia.${key}`}
                        value={userData.socialMedia?.[key] || ''}
                        onChange={handleChange}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`tu_usuario_${key}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Estado de la cuenta</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select
                    name="role"
                    value={userData.role || 'usuario'}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="usuario">Usuario</option>
                    <option value="administrador">Administrador</option>
                    <option value="modelo">Modelo</option>
                    <option value="agencia">Agencia</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    name="status"
                    value={userData.status || 'activo'}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="suspendido">Suspendido</option>
                    <option value="pendiente">Pendiente de verificación</option>
                  </select>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center">
                    <input
                      id="email-verified"
                      name="emailVerified"
                      type="checkbox"
                      checked={userData.emailVerified || false}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="email-verified" className="ml-2 block text-sm text-gray-700">
                      Correo verificado
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Preferencias</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="notifications"
                    name="preferences.notifications"
                    type="checkbox"
                    checked={userData.preferences?.notifications ?? true}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
                    Recibir notificaciones
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="email-notifications"
                    name="preferences.emailNotifications"
                    type="checkbox"
                    checked={userData.preferences?.emailNotifications ?? true}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
                    Notificaciones por correo
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="dark-mode"
                    name="preferences.darkMode"
                    type="checkbox"
                    checked={userData.preferences?.darkMode ?? false}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="dark-mode" className="ml-2 block text-sm text-gray-700">
                    Modo oscuro
                  </label>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-100 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-4">Zona de peligro</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-red-700 mb-2">Eliminar esta cuenta de forma permanente</p>
                  <p className="text-xs text-red-600 mb-3">Esta acción no se puede deshacer. Todos los datos del usuario serán eliminados.</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de que deseas eliminar esta cuenta? Esta acción no se puede deshacer.')) {
                        // Handle account deletion
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FaTrash className="mr-2" />
                    Eliminar cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserProfile;
