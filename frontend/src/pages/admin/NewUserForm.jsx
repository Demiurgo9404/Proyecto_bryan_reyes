import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../api/userService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import countryList from 'react-select-country-list';
import { FaCamera, FaEye, FaEyeSlash } from 'react-icons/fa';

const NewUserForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: '',
    interestedIn: [],
    bio: '',
    phone: '',
    phoneCode: '+1',
    country: '',
    location: '',
    isActive: true,
    isVerified: false,
    role: 'user',
    profilePhoto: null,
    coverPhoto: null,
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countries, setCountries] = useState([]);
  const [phoneCodes] = useState([
    { code: '+1', name: 'USA/Canada' },
    { code: '+52', name: 'México' },
    { code: '+34', name: 'España' },
    { code: '+54', name: 'Argentina' },
    { code: '+51', name: 'Perú' },
    { code: '+56', name: 'Chile' },
    { code: '+57', name: 'Colombia' },
    { code: '+58', name: 'Venezuela' },
    { code: '+591', name: 'Bolivia' },
    { code: '+593', name: 'Ecuador' },
    { code: '+595', name: 'Paraguay' },
    { code: '+598', name: 'Uruguay' }
  ]);
  
  const profilePhotoRef = useRef(null);
  const coverPhotoRef = useRef(null);

  const [age, setAge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const genderOptions = [
    { value: 'male', label: 'Hombre' },
    { value: 'female', label: 'Mujer' },
    { value: 'non_binary', label: 'No binario' },
    { value: 'other', label: 'Otro' },
  ];

  const interestOptions = [
    { value: 'men', label: 'Hombres' },
    { value: 'women', label: 'Mujeres' },
    { value: 'gay', label: 'Gays' },
    { value: 'lesbian', label: 'Lesbianas' },
    { value: 'trans', label: 'Personas Trans' },
    { value: 'couples', label: 'Parejas' },
    { value: 'bisexual', label: 'Bisexuales' },
    { value: 'pansexual', label: 'Pansexuales' },
    { value: 'queer', label: 'Queer' },
  ];

  useEffect(() => {
    // Cargar lista de países
    setCountries(countryList().getData());
  }, []);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [type]: {
            file,
            preview: URL.createObjectURL(file)
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = (ref) => {
    ref.current?.click();
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    const phoneCode = phoneCodes.find(c => c.name === country)?.code || '+1';
    
    setFormData(prev => ({
      ...prev,
      country,
      phoneCode
    }));
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'birthDate') {
      const calculatedAge = calculateAge(value);
      setAge(calculatedAge);
      
      // Verificar si es mayor de 18 años
      if (calculatedAge < 18) {
        setErrors(prev => ({
          ...prev,
          birthDate: 'Debes ser mayor de 18 años para registrarte'
        }));
      } else {
        const { birthDate, ...rest } = errors;
        setErrors(rest);
      }
    }
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        interestedIn: checked
          ? [...prev.interestedIn, value]
          : prev.interestedIn.filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) newErrors.username = 'El nombre de usuario es requerido';
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es requerida';
    } else if (age < 18) {
      newErrors.birthDate = 'Debes ser mayor de 18 años para registrarte';
    }
    if (!formData.gender) newErrors.gender = 'El género es requerido';
    if (formData.interestedIn.length === 0) newErrors.interestedIn = 'Debes seleccionar al menos un interés';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Preparar los datos para enviar al servidor
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        profile: {
          birthDate: formData.birthDate,
          gender: formData.gender,
          interestedIn: Array.isArray(formData.interestedIn) ? formData.interestedIn : [formData.interestedIn],
          bio: formData.bio?.trim() || '',
          phone: `${formData.phoneCode || ''}${formData.phone || ''}`.trim(),
          location: formData.location?.trim() || '',
          country: formData.country?.trim() || ''
        },
        isActive: Boolean(formData.isActive),
        isVerified: Boolean(formData.isVerified),
        role: formData.role || 'user'
      };
      
      // Crear FormData para soportar la carga de archivos
      const formDataToSend = new FormData();
      
      // Agregar campos al FormData
      for (const [key, value] of Object.entries(userData)) {
        if (key === 'profile') {
          formDataToSend.append('profile', JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      }
      
      // Agregar archivos si existen
      if (formData.profilePhoto?.file instanceof File) {
        formDataToSend.append('profilePhoto', formData.profilePhoto.file);
      }
      
      if (formData.coverPhoto?.file instanceof File) {
        formDataToSend.append('coverPhoto', formData.coverPhoto.file);
      }
      
      // Llamar al servicio para crear el usuario
      await userService.createUser(formDataToSend);
      
      toast.success('Usuario creado exitosamente');
      navigate('/admin/usuarios');
    } catch (error) {
      console.error('Error al crear usuario:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear el usuario';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Sección de foto de portada */}
      <div className="relative h-48 bg-gray-200">
        {formData.coverPhoto ? (
          <img
            src={formData.coverPhoto.preview}
            alt="Portada"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Foto de portada</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => triggerFileInput(coverPhotoRef)}
          className="absolute bottom-4 right-4 bg-white bg-opacity-80 p-2 rounded-full shadow-md hover:bg-opacity-100 transition-all"
          title="Cambiar foto de portada"
        >
          <FaCamera className="text-gray-700" />
          <input
            type="file"
            ref={coverPhotoRef}
            onChange={(e) => handleFileChange(e, 'coverPhoto')}
            className="hidden"
            accept="image/*"
          />
        </button>

        {/* Foto de perfil */}
        <div className="absolute -bottom-16 left-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 overflow-hidden">
              {formData.profilePhoto ? (
                <img
                  src={formData.profilePhoto.preview}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span>Foto</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => triggerFileInput(profilePhotoRef)}
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
              title="Cambiar foto de perfil"
            >
              <FaCamera className="text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <input
                type="file"
                ref={profilePhotoRef}
                onChange={(e) => handleFileChange(e, 'profilePhoto')}
                className="hidden"
                accept="image/*"
              />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-20 px-6">
        <h2 className="text-2xl font-bold text-gray-800">Nuevo Usuario</h2>
        <p className="text-gray-600 mb-6">Complete el formulario para registrar un nuevo usuario</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>

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
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm ${errors.username ? 'border-red-500' : ''}`}
                />
                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
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
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm ${errors.birthDate ? 'border-red-500' : ''}`}
                  />
                  {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>}
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Género *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm rounded-md"
                  >
                    <option value="">Seleccionar género</option>
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interesado en
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {interestOptions.map((option) => (
                    <div key={option.value} className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={`interested-${option.value}`}
                          name="interestedIn"
                          type="checkbox"
                          value={option.value}
                          checked={formData.interestedIn.includes(option.value)}
                          onChange={handleChange}
                          className="focus:ring-rose-500 h-4 w-4 text-rose-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-2 text-sm">
                        <label htmlFor={`interested-${option.value}`} className="text-gray-700">
                          {option.label}
                        </label>
                      </div>
                    </div>
                  ))}
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
                    placeholder="Cuéntanos sobre ti..."
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Breve descripción sobre ti y lo que buscas en la plataforma.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    País *
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleCountryChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm rounded-md"
                  >
                    <option value="">Seleccionar país</option>
                    {countries && countries.map((country) => (
                      <option key={country.value} value={country.label}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Código
                  </label>
                  <select
                    value={formData.phoneCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneCode: e.target.value }))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm rounded-md"
                  >
                    {phoneCodes.map(code => (
                      <option key={code.code} value={code.code}>
                        {code.code} {code.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Teléfono *
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-rose-500 focus:border-rose-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Número de teléfono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Ciudad/Estado
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm"
                  placeholder="Ej: Ciudad de México"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Configuración de la Cuenta</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="focus:ring-rose-500 h-4 w-4 text-rose-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="isActive" className="font-medium text-gray-700">Cuenta activa</label>
                    <p className="text-gray-500">Desactiva esta opción para deshabilitar temporalmente la cuenta del usuario.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="isVerified"
                      name="isVerified"
                      type="checkbox"
                      checked={formData.isVerified}
                      onChange={(e) => setFormData(prev => ({ ...prev, isVerified: e.target.checked }))}
                      className="focus:ring-rose-500 h-4 w-4 text-rose-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="isVerified" className="font-medium text-gray-700">Correo verificado</label>
                    <p className="text-gray-500">Marca esta opción si el correo electrónico del usuario ha sido verificado.</p>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Rol del usuario
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm rounded-md"
                  >
                    <option value="user">Usuario Estándar</option>
                    <option value="premium">Usuario Premium</option>
                    <option value="moderator">Moderador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-4">Cambiar Contraseña</h4>
                
                <div className="space-y-4">
                  <div className="relative">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm pr-10"
                        placeholder="Dejar en blanco para mantener la actual"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        ) : (
                          <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        )}
                      </button>
                    </div>
                    {formData.newPassword && formData.newPassword.length < 8 && (
                      <p className="mt-1 text-sm text-amber-600">La contraseña debe tener al menos 8 caracteres</p>
                    )}
                  </div>
                  
                  {formData.newPassword && (
                    <div className="relative">
                      <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                        Confirmar Nueva Contraseña
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmNewPassword"
                          name="confirmNewPassword"
                          value={formData.confirmNewPassword}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                          ) : (
                            <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                          )}
                        </button>
                      </div>
                      {formData.newPassword !== formData.confirmNewPassword && formData.confirmNewPassword && (
                        <p className="mt-1 text-sm text-red-600">Las contraseñas no coinciden</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Usuario'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewUserForm;
