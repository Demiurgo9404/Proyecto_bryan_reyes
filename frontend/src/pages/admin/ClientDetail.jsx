import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usersApi } from '../../api/client';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaBirthdayCake, 
  FaVenusMars,
  FaGlobe,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ClientDetail = ({ mode = 'view' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    birthDate: '',
    gender: 'other',
    website: '',
    status: 'activo',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const response = await usersApi.getById(token, id);
        const clientData = response.data || response;
        setClient(clientData);
        
        // Set form data from API response
        setFormData({
          name: clientData.name || '',
          email: clientData.email || '',
          phone: clientData.phone || '',
          bio: clientData.bio || '',
          location: clientData.location || '',
          birthDate: clientData.birthDate ? clientData.birthDate.split('T')[0] : '',
          gender: clientData.gender || 'other',
          website: clientData.website || '',
          status: clientData.status || 'activo',
          socialMedia: {
            facebook: clientData.socialMedia?.facebook || '',
            twitter: clientData.socialMedia?.twitter || '',
            instagram: clientData.socialMedia?.instagram || '',
            linkedin: clientData.socialMedia?.linkedin || ''
          }
        });
      } catch (error) {
        console.error('Error fetching client:', error);
        toast.error('Error al cargar los datos del cliente');
      } finally {
        setLoading(false);
      }
    };

    if (id && id !== 'nuevo') {
      fetchClient();
    } else {
      setLoading(false);
    }
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('socialMedia.')) {
      const socialMediaField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialMediaField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (id === 'nuevo') {
        // Create new client
        const response = await usersApi.create(token, formData);
        toast.success('Cliente creado correctamente');
        navigate(`/admin/clientes/${response.id}`);
      } else {
        // Update existing client
        await usersApi.update(token, id, formData);
        toast.success('Cambios guardados correctamente');
        setIsEditing(false);
        // Refresh client data
        const response = await usersApi.getById(token, id);
        setClient(response.data || response);
      }
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error(error.response?.data?.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    if (window.confirm(`¿Estás seguro de que deseas ${client.status === 'activo' ? 'desactivar' : 'activar'} este cliente?`)) {
      try {
        const newStatus = client.status === 'activo' ? 'inactivo' : 'activo';
        await usersApi.update(token, id, { status: newStatus });
        setClient({ ...client, status: newStatus });
        toast.success(`Cliente ${newStatus === 'activo' ? 'activado' : 'desactivado'} correctamente`);
      } catch (error) {
        console.error('Error updating client status:', error);
        toast.error('Error al actualizar el estado del cliente');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!client && id !== 'nuevo') {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Cliente no encontrado</h2>
        <p className="text-gray-600 mb-4">El cliente que estás buscando no existe o no tienes permiso para verlo.</p>
        <button
          onClick={() => navigate('/admin/clientes')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Volver a la lista de clientes
        </button>
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
        <h1 className="text-2xl font-bold text-gray-800">
          {id === 'nuevo' ? 'Nuevo Cliente' : isEditing ? 'Editar Cliente' : client?.name}
        </h1>
        {!isEditing && id !== 'nuevo' && (
          <div className="ml-auto flex space-x-3">
            <button
              onClick={toggleStatus}
              className={`px-4 py-2 rounded-md flex items-center ${
                client.status === 'activo' 
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              {client.status === 'activo' ? (
                <>
                  <FaUserTimes className="mr-2" />
                  Desactivar
                </>
              ) : (
                <>
                  <FaUserCheck className="mr-2" />
                  Activar
                </>
              )}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <FaEdit className="mr-2" />
              Editar
            </button>
          </div>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Información del Cliente
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {isEditing ? 'Edita la información del cliente' : 'Detalles del perfil del cliente'}
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              {/* Profile Picture */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Foto de perfil</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {client?.profileImage ? (
                          <img 
                            src={client.profileImage} 
                            alt={client.name} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 text-xl">
                            {client?.name ? client.name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="ml-4 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {client?.profileImage ? (
                        <img 
                          src={client.profileImage} 
                          alt={client.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 text-xl">
                          {client?.name ? client.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      )}
                    </div>
                  )}
                </dd>
              </div>

              {/* Name */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Nombre completo</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  ) : (
                    client?.name || 'No especificado'
                  )}
                </dd>
              </div>

              {/* Email */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FaEnvelope className="mr-2 text-gray-400" />
                  Correo electrónico
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  ) : (
                    client?.email || 'No especificado'
                  )}
                </dd>
              </div>

              {/* Phone */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FaPhone className="mr-2 text-gray-400" />
                  Teléfono
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    client?.phone || 'No especificado'
                  )}
                </dd>
              </div>

              {/* Location */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-gray-400" />
                  Ubicación
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    client?.location || 'No especificada'
                  )}
                </dd>
              </div>

              {/* Birth Date */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FaBirthdayCake className="mr-2 text-gray-400" />
                  Fecha de nacimiento
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    client?.birthDate ? new Date(client.birthDate).toLocaleDateString() : 'No especificada'
                  )}
                </dd>
              </div>

              {/* Gender */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FaVenusMars className="mr-2 text-gray-400" />
                  Género
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                      <option value="other">Otro</option>
                      <option value="prefer_not_to_say">Prefiero no decirlo</option>
                    </select>
                  ) : (
                    (() => {
                      switch(client?.gender) {
                        case 'male': return 'Masculino';
                        case 'female': return 'Femenino';
                        case 'other': return 'Otro';
                        case 'prefer_not_to_say': return 'Prefiero no decirlo';
                        default: return 'No especificado';
                      }
                    })()
                  )}
                </dd>
              </div>

              {/* Website */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FaGlobe className="mr-2 text-gray-400" />
                  Sitio web
                </dt>
                <dd className="mt-1 text-sm text-blue-600 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="https://ejemplo.com"
                    />
                  ) : client?.website ? (
                    <a 
                      href={client.website.startsWith('http') ? client.website : `https://${client.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {client.website}
                    </a>
                  ) : (
                    'No especificado'
                  )}
                </dd>
              </div>

              {/* Bio */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Biografía</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <textarea
                      name="bio"
                      rows="3"
                      value={formData.bio}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Información sobre el cliente..."
                    />
                  ) : (
                    client?.bio || 'No hay información biográfica disponible.'
                  )}
                </dd>
              </div>

              {/* Social Media */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Redes Sociales</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="space-y-3">
                    {[
                      { name: 'facebook', icon: <FaFacebook className="text-blue-600" /> },
                      { name: 'twitter', icon: <FaTwitter className="text-blue-400" /> },
                      { name: 'instagram', icon: <FaInstagram className="text-pink-500" /> },
                      { name: 'linkedin', icon: <FaLinkedin className="text-blue-700" /> }
                    ].map((social) => (
                      <div key={social.name} className="flex items-center">
                        <span className="w-6">{social.icon}</span>
                        {isEditing ? (
                          <div className="flex-1 ml-2">
                            <div className="text-xs text-gray-500 mb-1">
                              {social.name.charAt(0).toUpperCase() + social.name.slice(1)}
                            </div>
                            <input
                              type="text"
                              name={`socialMedia.${social.name}`}
                              value={formData.socialMedia?.[social.name] || ''}
                              onChange={handleChange}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              placeholder={`@usuario_${social.name}`}
                            />
                          </div>
                        ) : client?.socialMedia?.[social.name] ? (
                          <a
                            href={`https://${social.name}.com/${client.socialMedia[social.name]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:underline"
                          >
                            @{client.socialMedia[social.name]}
                          </a>
                        ) : (
                          <span className="ml-2 text-gray-500">No especificado</span>
                        )}
                      </div>
                    ))}
                  </div>
                </dd>
              </div>

              {/* Status */}
              {isEditing && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Estado de la cuenta</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="pendiente">Pendiente de verificación</option>
                    </select>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Form Actions */}
          {isEditing && (
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                type="button"
                onClick={() => id === 'nuevo' ? navigate('/admin/clientes') : setIsEditing(false)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : id === 'nuevo' ? (
                  'Crear Cliente'
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Additional Information */}
      {!isEditing && id !== 'nuevo' && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <p className="text-sm text-gray-500">
                Aquí se mostrará la actividad reciente del cliente, como interacciones, compras, etc.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;
