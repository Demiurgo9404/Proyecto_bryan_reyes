import React from 'react';
import { motion } from 'framer-motion';

const SuperDashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 max-w-6xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-primary mb-6">Superuser Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Full Control</h2>
          <p className="text-gray-600">Access to all administrative and system areas.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">User Management</h2>
          <p className="text-gray-600">Create, edit, deactivate users and manage roles.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Monitoring</h2>
          <p className="text-gray-600">System-wide metrics and audits.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SuperDashboard;
