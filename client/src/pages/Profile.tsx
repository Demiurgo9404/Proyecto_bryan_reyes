import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateUserProfile } from '../store/slices/authSlice';
import { Button } from '../components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';

const Profile: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    gender: user?.gender || '',
    birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
    interests: user?.interests || [] as string[],
    location: user?.location || '',
  });
  
  // Cargar datos del perfil si es un perfil de otro usuario
  useEffect(() => {
    if (id && id !== user?.id) {
      // Aquí iría la lógica para cargar el perfil de otro usuario
      console.log('Cargando perfil de usuario:', id);
    } else {
      // Si no hay ID o es el perfil del usuario actual, usar los datos del estado de autenticación
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          bio: user.bio || '',
          gender: user.gender || '',
          birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
          interests: user.interests || [],
          location: user.location || '',
        });
      }
    }
  }, [id, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      interests: checked
        ? [...prev.interests, value]
        : prev.interests.filter(interest => interest !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    try {
      setIsLoading(true);
      // Aquí iría la llamada a la API para actualizar el perfil
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación de llamada a API
      
      // Actualizar el estado global con los nuevos datos
      dispatch(updateUserProfile(formData));
      
      toast.success('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    navigate('/login');
    return null;
  }

  const isOwnProfile = !id || id === user.id;
  const profileUser = isOwnProfile ? user : null; // Aquí irían los datos del perfil de otro usuario

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{isOwnProfile ? 'Mi Perfil' : `Perfil de ${profileUser?.name}`} | LoveRose</title>
        <meta name="description" content={`Perfil de ${isOwnProfile ? 'usuario' : profileUser?.name} en LoveRose`} />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Encabezado del perfil */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-48 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 overflow-hidden">
                <img 
                  src={user.profileImage || '/default-avatar.png'} 
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            {isOwnProfile && (
              <div className="absolute top-4 right-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                  disabled={isLoading}
                >
                  {isEditing ? 'Cancelar' : 'Editar perfil'}
                </Button>
              </div>
            )}
          </div>

          {/* Contenido del perfil */}
          <div className="pt-20 px-8 pb-8">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing || isLoading}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing || isLoading}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Género</Label>
                    <Select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={!isEditing || isLoading}
                    >
                      <option value="">Seleccionar género</option>
                      <option value="male">Hombre</option>
                      <option value="female">Mujer</option>
                      <option value="other">Otro</option>
                      <option value="prefer-not-to-say">Prefiero no decirlo</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                    <Input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      disabled={!isEditing || isLoading}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing || isLoading}
                      placeholder="Ciudad, País"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Intereses</Label>
                    <div className="space-y-2 mt-2">
                      {['Música', 'Deportes', 'Viajes', 'Cine', 'Lectura', 'Tecnología', 'Cocina', 'Fotografía'].map((interest) => (
                        <label key={interest} className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded text-pink-500 focus:ring-pink-500"
                            value={interest.toLowerCase()}
                            checked={formData.interests.includes(interest.toLowerCase())}
                            onChange={handleInterestsChange}
                            disabled={!isEditing || isLoading}
                            name="interests"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">{interest}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing || isLoading}
                      rows={4}
                      placeholder="Cuéntanos sobre ti..."
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-8 flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Sección de fotos */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Mis fotos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div 
                key={item} 
                className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden"
              >
                {item === 1 && user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={`Foto de perfil de ${user.name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <span className="text-sm">Foto {item}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
