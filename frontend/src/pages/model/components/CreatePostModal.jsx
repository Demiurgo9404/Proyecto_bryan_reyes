import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaImage, FaVideo, FaSmile, FaUserTag, FaGlobeAmericas } from 'react-icons/fa';

const CreatePostModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [privacy, setPrivacy] = useState('public');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (!validTypes.includes(file.type)) {
      alert('Formato de archivo no soportado. Usa imágenes JPG, PNG, GIF o MP4.');
      return;
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;
    
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (selectedFile) formData.append('media', selectedFile);
    formData.append('privacy', privacy);
    
    onSubmit(formData);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Crear publicación</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto flex-1">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0">
                  <img
                    src="/default-avatar.png"
                    alt="Perfil"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">Tú</div>
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value)}
                    className="text-sm text-gray-600 border rounded-md p-1 mt-1"
                    disabled={isSubmitting}
                  >
                    <option value="public"><FaGlobeAmericas className="inline mr-1" /> Público</option>
                    <option value="followers"><FaUserTag className="inline mr-1" /> Seguidores</option>
                    <option value="private"><FaUserCircle className="inline mr-1" /> Solo yo</option>
                  </select>
                </div>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="¿En qué estás pensando?"
                className="w-full border-0 focus:ring-0 text-lg resize-none min-h-[100px] p-0 mb-4"
                disabled={isSubmitting}
              />

              {selectedFile && (
                <div className="relative mb-4 rounded-lg overflow-hidden">
                  {selectedFile.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Vista previa"
                      className="w-full max-h-96 object-contain rounded-lg"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(selectedFile)}
                      controls
                      className="w-full max-h-96 rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
                    disabled={isSubmitting}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t">
              <div className="border rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between text-gray-600 mb-2">
                  <span>Agregar a tu publicación</span>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                    disabled={isSubmitting}
                  >
                    <FaImage size={20} />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                    disabled={isSubmitting}
                  >
                    <FaVideo size={20} />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-full"
                    disabled={isSubmitting}
                  >
                    <FaSmile size={20} />
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || (!content.trim() && !selectedFile)}
                className={`w-full py-2 px-4 rounded-lg font-medium text-white ${
                  (!content.trim() && !selectedFile) || isSubmitting
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isSubmitting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
