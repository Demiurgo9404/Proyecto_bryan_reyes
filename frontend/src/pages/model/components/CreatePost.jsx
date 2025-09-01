import React, { useState, useRef } from 'react';
import { FaUser, FaImage, FaVideo, FaSmile, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const CreatePost = ({ userAvatar, onPost, isSubmitting = false }) => {
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setVideoPreview(null);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Por favor, selecciona un archivo de imagen válido');
      }
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        const videoUrl = URL.createObjectURL(file);
        setVideoPreview(videoUrl);
        setImagePreview(null);
      } else {
        alert('Por favor, selecciona un archivo de video válido');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!content.trim() && !imagePreview && !videoPreview) || isSubmitting) return;
    
    const postData = {
      content: content.trim(),
      image: imagePreview,
      video: videoPreview,
      timestamp: new Date().toISOString(),
    };
    
    onPost(postData);
    
    // Reset form
    setContent('');
    setImagePreview(null);
    setVideoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removeMedia = () => {
    setImagePreview(null);
    setVideoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {userAvatar ? (
              <img 
                src={userAvatar} 
                alt="Tu perfil" 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <FaUser className="text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <textarea
                className="w-full border-0 focus:ring-0 resize-none text-gray-800 placeholder-gray-500 text-base"
                rows="3"
                placeholder="¿En qué estás pensando?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              
              {/* Vista previa de la imagen o video */}
              {(imagePreview || videoPreview) && (
                <div className="mt-2 relative rounded-lg overflow-hidden border border-gray-200">
                  <button
                    type="button"
                    onClick={removeMedia}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 z-10 hover:bg-black/70"
                    aria-label="Eliminar archivo"
                  >
                    <FaTimes />
                  </button>
                  
                  {imagePreview && (
                    <img 
                      src={imagePreview} 
                      alt="Vista previa" 
                      className="w-full max-h-96 object-contain bg-gray-100"
                    />
                  )}
                  
                  {videoPreview && (
                    <video 
                      src={videoPreview} 
                      controls 
                      className="w-full max-h-96"
                    />
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex space-x-2">
                  <label className="flex items-center justify-center p-2 rounded-full text-pink-500 hover:bg-pink-50 cursor-pointer">
                    <FaImage className="text-xl" />
                    <span className="sr-only">Añadir imagen</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  
                  <label className="flex items-center justify-center p-2 rounded-full text-green-500 hover:bg-green-50 cursor-pointer">
                    <FaVideo className="text-xl" />
                    <span className="sr-only">Añadir video</span>
                    <input
                      type="file"
                      ref={videoInputRef}
                      className="hidden"
                      accept="video/*"
                      onChange={handleVideoChange}
                    />
                  </label>
                  
                  <button 
                    type="button"
                    className="p-2 rounded-full text-yellow-500 hover:bg-yellow-50"
                  >
                    <FaSmile className="text-xl" />
                    <span className="sr-only">Añadir emoji</span>
                  </button>
                </div>
                
                <motion.button
                  type="submit"
                  className={`px-4 py-2 rounded-full text-white font-medium ${
                    (!content.trim() && !imagePreview && !videoPreview) || isSubmitting
                      ? 'bg-pink-300 cursor-not-allowed'
                      : 'bg-pink-500 hover:bg-pink-600'
                  }`}
                  whileTap={{ scale: 0.98 }}
                  disabled={(!content.trim() && !imagePreview && !videoPreview) || isSubmitting}
                >
                  {isSubmitting ? 'Publicando...' : 'Publicar'}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
