import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaCoins, FaChartLine, FaSync } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ModelCard from './ModelCard';
import { agencyApi } from '../../api/client';

const AgencyDashboard = () => {
  const [stats, setStats] = useState({
    totalModels: 0,
    activeModels: 0,
    totalEarnings: 0,
    totalCredits: 0,
    loading: true,
    error: null
  });
  
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAgencyData = async () => {
    try {
      setRefreshing(true);
      const response = await agencyApi.getAgencyModels();
      
      if (response && response.success) {
        const { stats, models } = response.data;
        setStats({
          totalModels: stats.totalModels,
          activeModels: stats.activeModels,
          totalEarnings: stats.totalEarnings,
          totalCredits: stats.totalCredits,
          loading: false,
          error: null
        });
        setModels(models);
      } else {
        throw new Error(response?.error || 'Error al cargar los datos de la agencia');
      }
    } catch (error) {
      console.error('Error fetching agency data:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar los datos de la agencia'
      }));
      toast.error('Error al cargar los datos de la agencia');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAgencyData();
  }, []);

  const handleRefresh = () => {
    fetchAgencyData();
  };

  const handleModelStatusChange = async (modelId, isActive) => {
    try {
      await agencyApi.updateModelStatus(modelId, isActive ? 'active' : 'inactive');
      
      // Update local state
      setModels(prevModels =>
        prevModels.map(model =>
          model.id === modelId ? { ...model, isActive } : model
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        activeModels: isActive ? prev.activeModels + 1 : prev.activeModels - 1
      }));
    } catch (error) {
      console.error('Error updating model status:', error);
      toast.error('Error al actualizar el estado del modelo');
      // Re-fetch data to ensure consistency
      fetchAgencyData();
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Agencia</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
              <FaUsers size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Modelos Totales</p>
              <p className="text-2xl font-semibold">{stats.totalModels}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <FaUsers size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Modelos Activos</p>
              <p className="text-2xl font-semibold">{stats.activeModels}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
              <FaCoins size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Créditos Totales</p>
              <p className="text-2xl font-semibold">{stats.totalCredits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <FaChartLine size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ganancias Totales</p>
              <p className="text-2xl font-semibold">{formatCurrency(stats.totalEarnings)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Models List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Modelos</h2>
          <span className="text-sm text-gray-500">
            Mostrando {models.length} de {stats.totalModels} modelos
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : models.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map(model => (
              <ModelCard 
                key={model.id} 
                model={model} 
                onStatusChange={handleModelStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay modelos registrados en tu agencia.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AgencyDashboard;
