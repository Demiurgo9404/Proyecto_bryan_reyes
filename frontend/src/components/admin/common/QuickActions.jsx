import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, 
  FaUserPlus, 
  FaFileInvoiceDollar, 
  FaBullhorn,
  FaCog,
  FaChartBar
} from 'react-icons/fa';

const QuickActions = () => {
  const actions = [
    {
      title: 'Nuevo Usuario',
      icon: <FaUserPlus className="w-6 h-6" />,
      link: '/admin/usuarios/nuevo',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Nuevo Producto',
      icon: <FaPlus className="w-6 h-6" />,
      link: '/admin/productos/nuevo',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Nueva Factura',
      icon: <FaFileInvoiceDollar className="w-6 h-6" />,
      link: '/admin/facturas/nueva',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Anuncios',
      icon: <FaBullhorn className="w-6 h-6" />,
      link: '/admin/anuncios',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      title: 'Reportes',
      icon: <FaChartBar className="w-6 h-6" />,
      link: '/admin/reportes',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      title: 'Configuración',
      icon: <FaCog className="w-6 h-6" />,
      link: '/admin/configuracion',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className={`flex flex-col items-center justify-center p-4 rounded-lg ${action.color} text-white transition-colors duration-200 transform hover:scale-105`}
          >
            <div className="p-3 rounded-full bg-white bg-opacity-20 mb-2">
              {action.icon}
            </div>
            <span className="text-sm font-medium text-center">{action.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
