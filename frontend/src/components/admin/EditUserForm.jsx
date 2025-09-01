import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../api/userService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaUserShield, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaArrowLeft,
  FaSave,
  FaSpinner
} from 'react-icons/fa';

const EditUserForm = ({ userId, onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'user',
    is_active: true,
    phone: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    bio: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState({
    user: true,
    saving: false,
    changingPassword: false
  });
  
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await userService.getUserById(userId);
        const userData = response.data || response; // Handle both response formats
        
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          full_name: userData.full_name || '',
          role: userData.role || 'user',
          is_active: userData.is_active !== undefined ? userData.is_active : true,
          phone: userData.phone || '',
          address: userData.address || '',
          city: userData.city || '',
          country: userData.country || '',
          postal_code: userData.postal_code || '',
          bio: userData.bio || ''
        });
        
        setLoading(prev => ({ ...prev, user: false }));
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Error al cargar los datos del usuario');
        setLoading(prev => ({ ...prev, user: false }));
      }
    };

    if (userId) {
      fetchUserData();
    } else {
      setLoading(prev => ({ ...prev, user: false }));
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio';
    }
    
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(prev => ({ ...prev, saving: true }));
    
    try {
      // Prepare data to send (only include fields that have values)
      const dataToSend = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          dataToSend[key] = formData[key];
        }
      });
      
      await userService.updateUser(userId, dataToSend);
      
      toast.success('Perfil actualizado correctamente');
      if (onClose) {
        onClose();
      } else {
        navigate(`/admin/usuarios/${userId}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setLoading(prev => ({ ...prev, changingPassword: true }));
    
    try {
      await userService.changePassword(userId, {
        newPassword: passwordData.newPassword
      });
      
      toast.success('Contraseña actualizada correctamente');
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      toast.error(error.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(prev => ({ ...prev, changingPassword: false }));
    }
  };

  if (loading.user) {
    return (
      <div className="flex items-center justify-center p-8">
        <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
        <span className="ml-2">Cargando datos del usuario...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-700 text-white p-4 flex items-center">
        <button 
          onClick={onClose || (() => navigate(-1))}
          className="mr-4 p-1 rounded-full hover:bg-indigo-600 transition-colors"
        >
          <FaArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold">
          Editar Usuario: {formData.username}
        </h2>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'password' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Cambiar Contraseña
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'profile' ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Nombre de usuario *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border ${errors.username ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                      placeholder="Nombre de usuario"
                    />
                  </div>
                  {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Correo electrónico *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    id="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Nombre completo"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Biografía
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Cuéntanos sobre ti..."
                  />
                </div>
              </div>
              
              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Información Adicional</h3>
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                    Usuario activo
                  </label>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Dirección</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Dirección
                      </label>
                      <input
                        type="text"
                        name="address"
                        id="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="Calle y número"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          name="city"
                          id="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="Ciudad"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                          Código postal
                        </label>
                        <input
                          type="text"
                          name="postal_code"
                          id="postal_code"
                          value={formData.postal_code}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="Código postal"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        País
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="">Selecciona un país</option>
                        <option value="US">Estados Unidos</option>
                        <option value="MX">México</option>
                        <option value="ES">España</option>
                        <option value="AR">Argentina</option>
                        <option value="CO">Colombia</option>
                        <option value="PE">Perú</option>
                        <option value="CL">Chile</option>
                        <option value="VE">Venezuela</option>
                        <option value="EC">Ecuador</option>
                        <option value="GT">Guatemala</option>
                        <option value="CU">Cuba</option>
                        <option value="BO">Bolivia</option>
                        <option value="DO">República Dominicana</option>
                        <option value="HN">Honduras</option>
                        <option value="PY">Paraguay</option>
                        <option value="SV">El Salvador</option>
                        <option value="NI">Nicaragua</option>
                        <option value="CR">Costa Rica</option>
                        <option value="PA">Panamá</option>
                        <option value="UY">Uruguay</option>
                        <option value="GQ">Guinea Ecuatorial</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 border-t border-gray-200 pt-5">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose || (() => navigate(-1))}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading.saving}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.saving ? (
                    <>
                      <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FaSave className="-ml-1 mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Cambiar Contraseña</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Asegúrate de que la nueva contraseña sea segura y no la hayas utilizado anteriormente.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      Nueva contraseña
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm ${errors.newPassword ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                        placeholder="Ingresa tu nueva contraseña"
                      />
                    </div>
                    {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      La contraseña debe tener al menos 8 caracteres.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirmar nueva contraseña
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                        placeholder="Confirma tu nueva contraseña"
                      />
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex items-center h-5">
                  <input
                    id="forcePasswordChange"
                    name="forcePasswordChange"
                    type="checkbox"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="forcePasswordChange" className="font-medium text-gray-700">
                    Forzar cambio de contraseña en el próximo inicio de sesión
                  </label>
                  <p className="text-gray-500">El usuario deberá cambiar su contraseña la próxima vez que inicie sesión.</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading.changingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.changingPassword ? (
                    <>
                      <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar Contraseña'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditUserForm;
