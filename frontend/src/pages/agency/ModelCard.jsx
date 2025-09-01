import React from 'react';
import { FaUser, FaCoins, FaClock, FaPowerOff, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { agencyApi } from '../../api/client';

const ModelCard = ({ model, onStatusChange }) => {
  const handleStatusToggle = async () => {
    try {
      const newStatus = !model.is_active ? 'active' : 'inactive';
      await agencyApi.updateModelStatus(model.id, newStatus);
      onStatusChange(model.id, newStatus === 'active');
      toast.success(`Modelo ${newStatus === 'active' ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
      console.error('Error updating model status:', error);
      toast.error('Error al actualizar el estado del modelo');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img 
              src={model.profilePicture} 
              alt={model.username}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-avatar.png';
              }}
            />
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${model.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{model.username}</h3>
                <p className="text-sm text-gray-500">{model.email}</p>
              </div>
              <button
                onClick={handleStatusToggle}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  model.is_active 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                {model.is_active ? 'Activo' : 'Inactivo'}
              </button>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center text-gray-600">
                <FaCoins className="mr-1 text-yellow-500" />
                <span>{model.credits || 0} créditos</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaCoins className="mr-1 text-green-500" />
                <span>${model.earnings.toFixed(2)}</span>
              </div>
              <div className="flex items-center text-gray-600 col-span-2">
                <FaClock className="mr-1 text-blue-500" />
                <span>Última conexión: {new Date(model.last_login).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
