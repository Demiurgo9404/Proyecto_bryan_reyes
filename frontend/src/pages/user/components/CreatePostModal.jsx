import React, { useState, useRef } from 'react';
import { FaTimes, FaImage, FaSmile, FaMapMarkerAlt, FaUserTag } from 'react-icons/fa';

const CreatePostModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    
    const formData = new FormData();
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }
    
    onSubmit(formData);
    // Reset form
    setContent('');
    setImage(null);
    setImagePreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Crear publicación</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="¿Qué estás pensando?"
                className="w-full border-0 focus:ring-0 text-gray-900 placeholder-gray-500 text-lg resize-none"
                rows={4}
              />

              {imagePreview && (
                <div className="mt-4 relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-gray-100 text-blue-500"
                  >
                    <FaImage className="h-5 w-5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-gray-100 text-yellow-500"
                  >
                    <FaSmile className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-gray-100 text-red-500"
                  >
                    <FaMapMarkerAlt className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-gray-100 text-blue-400"
                  >
                    <FaUserTag className="h-5 w-5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || (!content.trim() && !image)}
                  className={`px-4 py-2 rounded-full font-medium text-white ${
                    (!content.trim() && !image) || isSubmitting
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isSubmitting ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
