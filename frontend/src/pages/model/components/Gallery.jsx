import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPlus, FaTrash, FaSpinner } from 'react-icons/fa';

const Gallery = ({ images = [], onAddImages, onRemoveImage, isLoading = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      setIsUploading(true);
      await onAddImages(files);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = null;
    }
  };

  const openPreview = (image) => {
    setPreviewImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closePreview = () => {
    setPreviewImage(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Galería de Fotos</h3>
        <div>
          <label
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              isUploading ? 'bg-gray-400' : 'bg-pink-600 hover:bg-pink-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 cursor-pointer`}
          >
            {isUploading ? (
              <>
                <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                Subiendo...
              </>
            ) : (
              <>
                <FaPlus className="mr-2 h-4 w-4" />
                Añadir Fotos
              </>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {isLoading && !images?.length ? (
        <div className="flex justify-center items-center h-40">
          <FaSpinner className="animate-spin h-8 w-8 text-pink-500" />
        </div>
      ) : images?.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <FaCamera className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay fotos</h3>
          <p className="mt-1 text-sm text-gray-500">Sube fotos para mostrarlas en tu galería.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image) => (
            <div key={image.id} className="group relative aspect-square rounded-lg overflow-hidden">
              <img
                src={image.url}
                alt={`Galería ${image.id}`}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openPreview(image)}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
                    onRemoveImage(image.id);
                  }
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Eliminar imagen"
              >
                <FaTrash className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
            onClick={closePreview}
          >
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 text-white hover:text-gray-200"
              aria-label="Cerrar"
            >
              <FaTimes className="h-6 w-6" />
            </button>
            <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <img
                src={previewImage.url}
                alt="Vista previa"
                className="max-w-full max-h-[80vh] mx-auto object-contain"
              />
              <div className="mt-2 text-center text-white">
                <p className="text-sm">Haz clic fuera de la imagen para cerrar</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
