import React from 'react';
import { motion } from 'framer-motion';

const AgencyDashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 max-w-6xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-primary mb-6">Panel de Agencia</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Gestión de Modelos</h2>
          <p className="text-gray-600">Administra modelos afiliados, altas y bajas.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Finanzas</h2>
          <p className="text-gray-600">Revisa comisiones, pagos y balances.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Rendimiento</h2>
          <p className="text-gray-600">Métricas de performance por modelo y campaña.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AgencyDashboard;
