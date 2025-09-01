import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';
import { FiX, FiImage, FiMapPin, FiSmile } from 'react-icons/fi';
import { BsEmojiSmile } from 'react-icons/bs';
import Avatar from '../common/Avatar';
import EmojiPicker from 'emoji-picker-react';

const PostForm = ({ onSubmit, initialContent = '', initialImages = [], onCancel, isEditing = false }) => {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [location, setLocation] = useState('');
  const [images, setImages] = useState(initialImages);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Handle file uploads with drag and drop
  const onDrop = useCallback((acceptedFiles) => {
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    
    setImages(prev => [...prev, ...newImages].slice(0, 10)); // Max 10 images
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  // Handle file input change (for the hidden file input)
  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    
    setImages(prev => [...prev, ...newImages].slice(0, 10)); // Max 10 images
  };

  // Remove an image from the preview
  const removeImage = (id) => {
    setImages(prev => {
      const newImages = prev.filter(img => img.id !== id);
      // Revoke the object URL to avoid memory leaks
      const removedImage = prev.find(img => img.id === id);
      if (removedImage && removedImage.preview) {
        URL.revokeObjectURL(removedImage.preview);
      }
      return newImages;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && images.length === 0) {
      return; // Don't submit empty posts
    }
    
    try {
      setIsSubmitting(true);
      
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add content and location if provided
      if (content) {
        formData.append('content', content);
      }
      
      if (location) {
        formData.append('location', location);
      }
      
      // Add image files
      images.forEach((image, index) => {
        if (image.file) {
          formData.append(`images`, image.file);
        }
      });
      
      // Call the onSubmit prop with form data
      await onSubmit(formData);
      
      // Reset form if not in edit mode
      if (!isEditing) {
        setContent('');
        setLocation('');
        setImages([]);
      }
      
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle emoji selection
  const onEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    setContent(prev => 
      prev.substring(0, start) + emoji + prev.substring(end)
    );
    
    // Move cursor after the inserted emoji
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
    
    setShowEmojiPicker(false);
  };

  // Clean up object URLs to avoid memory leaks
  React.useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [images]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Editar publicación' : 'Crear publicación'}
          </h2>
          {onCancel && (
            <button 
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          )}
        </div>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4">
        {/* User info and textarea */}
        <div className="flex space-x-3 mb-4">
          <Avatar 
            src={user?.profileImageUrl} 
            alt={user?.username || 'Usuario'}
            size="md"
          />
          
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`¿Qué estás pensando, ${user?.username || 'usuario'}?`}
              className="w-full border-0 focus:ring-0 resize-none text-gray-800 placeholder-gray-400 text-base"
              rows={3}
            />
            
            {/* Image preview grid */}
            {images.length > 0 && (
              <div className={`mt-3 grid gap-2 ${
                images.length === 1 ? 'grid-cols-1' : 
                images.length === 2 ? 'grid-cols-2' : 
                images.length === 3 ? 'grid-cols-3' :
                'grid-cols-2'
              }`}>
                {images.map((image, index) => (
                  <div key={image.id} className="relative aspect-square rounded-md overflow-hidden">
                    <img 
                      src={image.preview || image.imageUrl} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Location input */}
            {location && (
              <div className="mt-3 flex items-center text-sm text-blue-600">
                <FiMapPin className="mr-1" />
                <span>{location}</span>
                <button 
                  type="button" 
                  onClick={() => setLocation('')}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <FiX size={16} />
                </button>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                  title="Añadir fotos/videos"
                >
                  <FiImage size={20} />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    className="hidden"
                    accept="image/*"
                    multiple
                  />
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    const locationInput = prompt('¿Dónde estás?');
                    if (locationInput) {
                      setLocation(locationInput);
                    }
                  }}
                  className="p-2 text-green-500 hover:bg-green-50 rounded-full"
                  title="Añadir ubicación"
                >
                  <FiMapPin size={20} />
                </button>
                
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-full"
                    title="Añadir emoji"
                  >
                    <FiSmile size={20} />
                  </button>
                  
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 z-10">
                      <EmojiPicker 
                        onEmojiClick={onEmojiClick}
                        width={300}
                        height={350}
                        searchPlaceholder="Buscar emoji"
                        previewConfig={{
                          showPreview: false
                        }}
                        skinTonesDisabled
                        lazyLoadEmojis
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && images.length === 0)}
                className={`px-4 py-2 rounded-full font-medium text-sm ${
                  (!content.trim() && images.length === 0) || isSubmitting
                    ? 'bg-blue-300 text-white cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? 'Guardando...' : 'Publicando...'}
                  </span>
                ) : isEditing ? (
                  'Guardar cambios'
                ) : (
                  'Publicar'
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Dropzone for drag and drop */}
        {!isEditing && (
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <FiImage className="mx-auto text-3xl text-gray-400" />
              <p className="text-sm text-gray-600">
                {isDragActive 
                  ? 'Suelta las imágenes aquí...' 
                  : 'Arrastra y suelta imágenes aquí, o haz clic para seleccionar'
                }
              </p>
              <p className="text-xs text-gray-500">
                Máx. 10 imágenes • JPG, PNG, GIF • Hasta 10MB cada una
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default PostForm;
