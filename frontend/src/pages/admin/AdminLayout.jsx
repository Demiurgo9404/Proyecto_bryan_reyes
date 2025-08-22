import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  ChartBarIcon, 
  UsersIcon, 
  ExclamationTriangleIcon, 
  SupportIcon,
  CogIcon,
  LogoutIcon
} from '@heroicons/react/outline';

const AdminLayout = () => {
  const location = useLocation();
  const navigation = [
    { name: 'Inicio', href: '/admin/dashboard', icon: ChartBarIcon },
    { name: 'Usuarios', href: '/admin/usuarios', icon: UsersIcon },
    { name: 'Reportes', href: '/admin/reportes', icon: ExclamationTriangleIcon },
    { name: 'Soporte', href: '/admin/soporte', icon: SupportIcon },
    { name: 'Configuración', href: '/admin/configuracion', icon: CogIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra lateral */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-indigo-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-white text-xl font-bold">Panel de Administración</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-100 hover:bg-indigo-600'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      location.pathname === item.href ? 'text-indigo-300' : 'text-indigo-200'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <div className="h-9 w-9 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-800 font-bold">
                    A
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Administrador</p>
                  <Link
                    to="/logout"
                    className="text-xs font-medium text-indigo-200 group-hover:text-white flex items-center"
                  >
                    <LogoutIcon className="h-4 w-4 mr-1" />
                    Cerrar sesión
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
