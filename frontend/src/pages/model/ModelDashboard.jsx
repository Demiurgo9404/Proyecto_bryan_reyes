import React from 'react';
import { motion } from 'framer-motion';

const ModelDashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 max-w-6xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-primary mb-6">Model Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Calendar</h2>
          <p className="text-gray-600">Manage your availability and sessions.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Earnings</h2>
          <p className="text-gray-600">Check your earnings and withdrawals.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Profile</h2>
          <p className="text-gray-600">Update your bio, photos, and preferences.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ModelDashboard;
