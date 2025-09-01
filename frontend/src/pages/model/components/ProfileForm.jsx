import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaUser, FaVenusMars, FaBirthdayCake, FaGlobe, FaCamera, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ProfileForm = ({ profile, onSave, onCancel, onImageUpload, loading = false }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: profile
  });
  const [previewImage, setPreviewImage] = useState(profile?.profileImage || '');
  const [status, setStatus] = useState(profile?.status || 'offline');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      reset(profile);
      setPreviewImage(profile.profileImage || '');
      setStatus(profile.status || 'offline');
    }
  }, [profile, reset]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Upload the image
    try {
      setIsUploading(true);
      await onImageUpload(file);
      // If the parent component handles the upload and updates the profile,
      // we don't need to do anything else here
    } catch (error) {
      console.error('Error uploading image:', error);
      // Revert preview on error
      setPreviewImage(profile?.profileImage || '');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data) => {
    onSave({
      ...data,
      profileImage: previewImage,
      status
    });
  };

  const statusOptions = [
    { value: 'online', label: 'En línea', color: 'bg-green-500' },
    { value: 'busy', label: 'Ocupada', color: 'bg-yellow-500' },
    { value: 'offline', label: 'Desconectada', color: 'bg-gray-500' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Perfil Público</h2>
        
        {/* Foto de perfil */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto de perfil
          </label>
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <FaUser className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <FaSpinner className="animate-spin text-white w-8 h-8" />
                  </div>
                )}
              </div>
              <label 
                className={`absolute bottom-0 right-0 ${
                  isUploading ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'
                } text-white p-2 rounded-full shadow-lg cursor-pointer transition-colors`}
                title={isUploading ? 'Subiendo...' : 'Cambiar foto'}
              >
                {isUploading ? (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <FaCamera className="w-4 h-4" />
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isUploading}
                />
              </label>
            </div>
            <div className="text-sm text-gray-500">
              <p>Formatos soportados: JPG, PNG</p>
              <p>Tamaño máximo: 5MB</p>
            </div>
          </div>
        </div>

        {/* Estado actual */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado actual
          </label>
          <div className="flex space-x-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`px-4 py-2 rounded-full text-sm font-medium text-white ${
                  status === option.value 
                    ? `${option.color} ring-2 ring-offset-2 ring-${option.color.split('-')[1]}-500`
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } transition-colors`}
                onClick={() => setStatus(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre artístico *
            </label>
            <input
              id="displayName"
              type="text"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                errors.displayName ? 'border-red-300' : 'border-gray-300'
              }`}
              {...register('displayName', { required: 'Este campo es obligatorio' })}
            />
            {errors.displayName && (
              <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Edad *
            </label>
            <input
              id="age"
              type="number"
              min="18"
              max="99"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                errors.age ? 'border-red-300' : 'border-gray-300'
              }`}
              {...register('age', { 
                required: 'Este campo es obligatorio',
                min: { value: 18, message: 'Debes ser mayor de 18 años' },
                max: { value: 99, message: 'Edad no válida' }
              })}
            />
            {errors.age && (
              <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              País *
            </label>
            <select
              id="country"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              {...register('country', { required: 'Este campo es obligatorio' })}
            >
              <option value="">Selecciona un país</option>
              <option value="MX">México</option>
              <option value="CO">Colombia</option>
              <option value="AR">Argentina</option>
              <option value="ES">España</option>
              <option value="US">Estados Unidos</option>
              <option value="OTRO">Otro</option>
            </select>
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="languages" className="block text-sm font-medium text-gray-700 mb-1">
              Idiomas que hablas *
            </label>
            <input
              id="languages"
              type="text"
              placeholder="Ej: Español, Inglés"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                errors.languages ? 'border-red-300' : 'border-gray-300'
              }`}
              {...register('languages', { required: 'Este campo es obligatorio' })}
            />
            {errors.languages && (
              <p className="mt-1 text-sm text-red-600">{errors.languages.message}</p>
            )}
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-6">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Sobre mí *
          </label>
          <textarea
            id="bio"
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
              errors.bio ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Cuéntales a los usuarios sobre ti, tus intereses y lo que pueden esperar de ti..."
            {...register('bio', { 
              required: 'Este campo es obligatorio',
              minLength: { value: 50, message: 'La descripción debe tener al menos 50 caracteres' },
              maxLength: { value: 1000, message: 'La descripción no puede exceder los 1000 caracteres' }
            })}
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>

        {/* Preferencias */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Preferencias</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 shadow-sm focus:ring-primary-500"
                  {...register('acceptsVideoCalls')}
                />
                <span className="ml-2 text-gray-700">Acepto video llamadas</span>
              </label>
            </div>
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 shadow-sm focus:ring-primary-500"
                  {...register('acceptsPrivateMessages')}
                />
                <span className="ml-2 text-gray-700">Acepto mensajes privados</span>
              </label>
            </div>
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 shadow-sm focus:ring-primary-500"
                  {...register('showInSearch')}
                />
                <span className="ml-2 text-gray-700">Mostrar en búsquedas</span>
              </label>
            </div>
          </div>
        </div>

        {/* Precios */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Precios (en monedas)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="pricePerMinute" className="block text-sm font-medium text-gray-700 mb-1">
                Por minuto de video llamada *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="pricePerMinute"
                  min="1"
                  step="1"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0"
                  {...register('pricePerMinute', { 
                    required: 'Este campo es obligatorio',
                    min: { value: 1, message: 'El precio mínimo es 1 moneda' }
                  })}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm" id="price-currency">
                    monedas
                  </span>
                </div>
              </div>
              {errors.pricePerMinute && (
                <p className="mt-1 text-sm text-red-600">{errors.pricePerMinute.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="pricePerMessage" className="block text-sm font-medium text-gray-700 mb-1">
                Por mensaje privado
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="pricePerMessage"
                  min="0"
                  step="1"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0"
                  {...register('pricePerMessage')}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">
                    monedas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FaTimes className="-ml-1 mr-2 h-4 w-4" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave className="-ml-1 mr-2 h-4 w-4" />
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;
