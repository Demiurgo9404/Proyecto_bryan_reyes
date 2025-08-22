import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const StatsCard = ({ title, value, change, icon, color, link, loading = false }) => {
  const isPositive = change && (change.startsWith('+') || !change.startsWith('-'));
  const changeValue = change ? change.replace(/[+-]/, '') : null;
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <Link to={link} className="block h-full">
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300 p-6 h-full">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className="flex items-baseline mt-1">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {change && (
                <span 
                  className={`ml-2 flex items-center text-sm font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isPositive ? (
                    <FaArrowUp className="mr-1 h-3 w-3" />
                  ) : (
                    <FaArrowDown className="mr-1 h-3 w-3" />
                  )}
                  {changeValue}
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-full ${color} text-white`}>
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StatsCard;
