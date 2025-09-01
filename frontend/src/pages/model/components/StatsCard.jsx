import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const StatsCard = ({ title, value, icon, trend, trendType = 'up', className = '' }) => {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={`bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`mt-2 inline-flex items-center text-sm font-medium ${
          trendType === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trendType === 'up' ? (
            <FaArrowUp className="mr-1" />
          ) : (
            <FaArrowDown className="mr-1" />
          )}
          {trend}
        </div>
      )}
    </motion.div>
  );
};

export default StatsCard;
