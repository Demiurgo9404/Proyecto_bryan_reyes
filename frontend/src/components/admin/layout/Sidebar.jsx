import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaBox, 
  FaChartLine, 
  FaCog, 
  FaBars, 
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
  FaUserCog,
  FaSignOutAlt
} from 'react-icons/fa';

const menuSections = [
  {
    title: 'Panel Principal',
    icon: <FaHome />,
    items: [
      { 
        to: '/admin/dashboard', 
        label: 'Dashboard',
        style: { 
          border: '2px solid #10B981',  // Verde para Inicio
          borderRadius: '0.5rem', 
          margin: '0.5rem 0', 
          padding: '0.75rem',
          backgroundColor: 'rgba(16, 185, 129, 0.1)'
        }
      },
      { 
        to: '/admin/estadisticas', 
        label: 'Estadísticas',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/notificaciones', 
        label: 'Notificaciones', 
        count: 3,
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
    ]
  },
  {
    title: 'Gestión de Usuarios',
    icon: <FaUsers />,
    items: [
      { 
        to: '/admin/usuarios', 
        label: 'Usuarios', 
        count: 23,
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/clientes', 
        label: 'Clientes', 
        count: 45,
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/roles', 
        label: 'Roles y Permisos',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      }
    ]
  },
  {
    title: 'Productos',
    icon: <FaBox />,
    items: [
      { 
        to: '/admin/productos', 
        label: 'Productos', 
        count: 128,
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/inventario', 
        label: 'Inventario',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/ofertas', 
        label: 'Ofertas',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/descuentos', 
        label: 'Descuentos',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
    ]
  },
  {
    title: 'Ventas y Pedidos',
    icon: <FaChartLine />,
    items: [
      { 
        to: '/admin/ventas', 
        label: 'Ventas', 
        count: 15,
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/pedidos', 
        label: 'Pedidos', 
        count: 8,
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/facturas', 
        label: 'Facturas',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/transacciones', 
        label: 'Transacciones',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/envios', 
        label: 'Envíos',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
    ]
  },
  {
    title: 'Contenido y Marketing',
    icon: <FaCog />,
    items: [
      { 
        to: '/admin/blog', 
        label: 'Blog',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/paginas', 
        label: 'Páginas',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/banners', 
        label: 'Banners',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/email-marketing', 
        label: 'Email Marketing',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/cupones', 
        label: 'Cupones',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
    ]
  },
  {
    title: 'Soporte y Comentarios',
    icon: <FaBars />,
    items: [
      { 
        to: '/admin/tickets', 
        label: 'Tickets de Soporte', 
        count: 5,
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/mensajes', 
        label: 'Mensajes', 
        count: 3,
        style: { 
          border: '2px solid #3B82F6',  // Azul para Mensajes
          borderRadius: '0.5rem', 
          margin: '0.5rem 0', 
          padding: '0.75rem',
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }
      },
      { 
        to: '/admin/comentarios', 
        label: 'Comentarios', 
        count: 12,
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/valoraciones', 
        label: 'Valoraciones',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
    ]
  },
  {
    title: 'Configuración',
    icon: <FaCog />,
    items: [
      { 
        to: '/admin/ajustes', 
        label: 'Ajustes Generales',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/tienda', 
        label: 'Config. de Tienda',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/pagos', 
        label: 'Métodos de Pago',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/envios-config', 
        label: 'Config. de Envíos',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/impuestos', 
        label: 'Impuestos',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
    ]
  },
  {
    title: 'Sistema',
    icon: <FaCog />,
    items: [
      { 
        to: '/admin/backup', 
        label: 'Copias de Seguridad',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/registros', 
        label: 'Registros del Sistema',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/api', 
        label: 'API Keys',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/actualizaciones', 
        label: 'Actualizaciones',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/ayuda', 
        label: 'Ayuda y Soporte',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
      { 
        to: '/admin/acerca', 
        label: 'Acerca del Sistema',
        style: { border: '1px solid #4F46E5', borderRadius: '0.375rem', margin: '0.25rem 0', padding: '0.5rem' }
      },
    ]
  }
];

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    if (window.innerWidth < 768) {
      // onCloseMobile();
    }
  }, [location.pathname]);
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Cerrar el menú en dispositivos móviles al hacer clic en un enlace
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      // onCloseMobile();
    }
  };
  
  // Verificar si una ruta está activa
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Estilos para los ítems del menú
  const getMenuItemStyle = (itemPath, customStyle = {}) => {
    const isItemActive = isActive(itemPath);
    return {
      ...customStyle,
      border: isItemActive ? '1px solid #4F46E5' : '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '0.5rem',
      margin: '0.25rem 0.5rem',
      padding: '0.75rem',
      backgroundColor: isItemActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
      color: isItemActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        color: '#fff',
        transform: 'translateX(4px)'
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '3px',
        backgroundColor: isItemActive ? '#4F46E5' : 'transparent',
        transition: 'all 0.3s ease'
      }
    };
  };

  return (
    <aside className="hidden md:flex flex-col fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-30">
      <div className="p-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-indigo-700">Admin Panel</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {menuSections.map((section) => {
          const isExpanded = expandedSections[section.title] !== undefined 
            ? expandedSections[section.title] 
            : true;
            
          return (
            <div key={section.title} className="mb-1">
              {section.items.length > 1 && (
                <button
                  onClick={() => toggleSection(section.title)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors text-sm font-medium`}
                  title={section.title}
                >
                  <div className="flex items-center">
                    <span className="text-gray-500">
                      {React.cloneElement(section.icon, { className: 'w-4 h-4' })}
                    </span>
                    {section.title}
                  </div>
                  {section.items.length > 1 && (
                    isExpanded ? <FaChevronUp className="w-3 h-3 text-gray-400" /> : <FaChevronDown className="w-3 h-3 text-gray-400" />
                  )}
                </button>
              )}
              
              {(isExpanded) && (
                <div className="space-y-1">
                  {section.items.map((item, index) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={handleLinkClick}
                      className={({ isActive }) => 
                        `group flex items-center justify-between 
                        p-2 rounded-md transition-all text-sm
                        ${isActive 
                          ? 'bg-indigo-50 text-indigo-600 font-medium' 
                          : 'text-gray-600 hover:bg-gray-50'}`
                      }
                      title={item.label}
                    >
                      <div className="flex items-center">
                        <span className="ml-1">
                          {React.cloneElement(section.icon, { 
                            className: 'w-4 h-4',
                            style: { minWidth: '1rem' } 
                          })}
                        </span>
                        <span className="ml-3">{item.label}</span>
                      </div>
                      {item.count && (
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          {item.count}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
            U
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">Usuario Admin</p>
            <p className="text-xs text-gray-400">Administrador</p>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 mt-auto">
          <button 
            className="w-full flex items-center justify-between p-3 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            onClick={onLogout}
          >
            <span className="flex items-center gap-3">
              <FaSignOutAlt className="text-lg" />
              <span>Cerrar sesión</span>
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  onLogout: PropTypes.func.isRequired
};

Sidebar.displayName = 'Sidebar';

export default Sidebar;
