import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Image, Video, Smile, MapPin, Users } from 'lucide-react';

const CreatePostPage = () => {
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postText.trim() && !selectedImage) return;
    
    setIsSubmitting(true);
    try {
      // Aquí iría la lógica para publicar
      console.log('Publicando:', { postText, hasImage: !!selectedImage });
      // Simular tiempo de carga
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Resetear el formulario
      setPostText('');
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Mostrar mensaje de éxito
      alert('¡Publicación creada exitosamente!');
    } catch (error) {
      console.error('Error al publicar:', error);
      alert('Hubo un error al publicar. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Crear publicación</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="¿En qué estás pensando?"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>
          
          {selectedImage && (
            <div className="relative mb-6 rounded-lg overflow-hidden">
              <img 
                src={selectedImage} 
                alt="Preview" 
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
          
          <div className="border border-gray-200 rounded-lg p-3 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Agregar a tu publicación</p>
            <div className="flex space-x-4">
              <label className="flex items-center text-gray-600 hover:text-pink-500 cursor-pointer">
                <Image className="mr-1" size={20} />
                <span className="text-sm">Foto/Video</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*,video/*"
                  className="hidden"
                />
              </label>
              <button type="button" className="flex items-center text-gray-600 hover:text-pink-500">
                <Smile className="mr-1" size={20} />
                <span className="text-sm">Sentimiento</span>
              </button>
              <button type="button" className="flex items-center text-gray-600 hover:text-pink-500">
                <MapPin className="mr-1" size={20} />
                <span className="text-sm">Ubicación</span>
              </button>
              <button type="button" className="flex items-center text-gray-600 hover:text-pink-500">
                <Users className="mr-1" size={20} />
                <span className="text-sm">Personas</span>
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-sm text-gray-500">
                <span className="font-medium">Audiencia:</span> Público
              </span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || (!postText.trim() && !selectedImage)}
              className={`px-6 py-2 rounded-lg font-medium text-white ${
                (isSubmitting || (!postText.trim() && !selectedImage))
                  ? 'bg-pink-300 cursor-not-allowed'
                  : 'bg-pink-500 hover:bg-pink-600'
              } transition-colors`}
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreatePostPage;
