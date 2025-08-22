import React, { useState, useEffect } from 'react';
import { 
  FaServer, 
  FaDatabase, 
  FaGlobe, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaSpinner,
  FaRegClock
} from 'react-icons/fa';

const SystemStatus = () => {
  const [status, setStatus] = useState({
    api: 'checking',
    database: 'checking',
    frontend: 'checking',
    lastChecked: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulando la verificación del estado del sistema
    const checkSystemStatus = async () => {
      try {
        // En una aplicación real, aquí harías llamadas a tu API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStatus({
          api: 'online',
          database: 'online',
          frontend: 'online',
          lastChecked: new Date()
        });
      } catch (error) {
        setStatus({
          api: 'error',
          database: 'error',
          frontend: 'error',
          lastChecked: new Date()
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSystemStatus();
    // Configurar verificación periódica cada 5 minutos
    const interval = setInterval(checkSystemStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <FaCheckCircle className="text-green-500" />;
      case 'error':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'checking':
        return <FaSpinner className="animate-spin text-yellow-500" />;
      default:
        return <FaSpinner className="animate-spin text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'En línea';
      case 'error':
        return 'Error';
      case 'checking':
        return 'Verificando...';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Estado del Sistema</h2>
        {status.lastChecked && (
          <div className="flex items-center text-xs text-gray-500">
            <FaRegClock className="mr-1" />
            Actualizado: {new Date(status.lastChecked).toLocaleTimeString()}
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
              <FaServer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">API del Servidor</h3>
              <p className="text-sm text-gray-500">Estado del servicio backend</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-sm font-medium">
              {getStatusText(status.api)}
            </span>
            {getStatusIcon(status.api)}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
              <FaDatabase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Base de Datos</h3>
              <p className="text-sm text-gray-500">Estado de la conexión</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-sm font-medium">
              {getStatusText(status.database)}
            </span>
            {getStatusIcon(status.database)}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
              <FaGlobe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Frontend</h3>
              <p className="text-sm text-gray-500">Estado de la aplicación web</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-sm font-medium">
              {getStatusText(status.frontend)}
            </span>
            {getStatusIcon(status.frontend)}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 text-right">
        <button 
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-end w-full"
          onClick={() => window.location.reload()}
        >
          <FaSpinner className="mr-1" /> Actualizar estado
        </button>
      </div>
    </div>
  );
};

export default SystemStatus;
