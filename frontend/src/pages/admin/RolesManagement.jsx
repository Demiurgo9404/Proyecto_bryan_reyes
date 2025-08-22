import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUsers, FaUserShield, FaUserTie, FaUser, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { toast } from 'react-toastify';

const RolesManagement = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [expandedRole, setExpandedRole] = useState(null);

  // Datos de ejemplo para los roles (reemplazar con datos reales de la API)
  const rolesData = [
    {
      id: 'admin',
      name: 'Administradores',
      description: 'Acceso completo al sistema',
      icon: <FaUserShield className="text-red-500" />,
      users: [
        { id: 1, name: 'Admin Principal', email: 'admin@example.com', status: 'active' },
        { id: 2, name: 'Soporte Técnico', email: 'soporte@example.com', status: 'active' }
      ],
      permissions: [
        'Gestionar usuarios', 'Gestionar roles', 'Ver reportes', 'Configuración del sistema'
      ]
    },
    {
      id: 'agency',
      name: 'Agencias',
      description: 'Gestión de modelos y contenido',
      icon: <FaUserTie className="text-blue-500" />,
      users: [
        { id: 3, name: 'Agencia Uno', email: 'agencia1@example.com', status: 'active' },
        { id: 4, name: 'Agencia Dos', email: 'agencia2@example.com', status: 'inactive' }
      ],
      permissions: [
        'Gestionar modelos', 'Subir contenido', 'Ver reportes de modelos'
      ]
    },
    {
      id: 'model',
      name: 'Modelos',
      description: 'Creadores de contenido',
      icon: <FaUserTie className="text-purple-500" />,
      users: [
        { id: 5, name: 'Modelo Uno', email: 'modelo1@example.com', status: 'active' },
        { id: 6, name: 'Modelo Dos', email: 'modelo2@example.com', status: 'active' },
        { id: 7, name: 'Modelo Tres', email: 'modelo3@example.com', status: 'inactive' }
      ],
      permissions: [
        'Subir contenido', 'Gestionar perfil', 'Ver estadísticas propias'
      ]
    },
    {
      id: 'user',
      name: 'Usuarios',
      description: 'Clientes de la plataforma',
      icon: <FaUser className="text-green-500" />,
      users: [
        { id: 8, name: 'Usuario Uno', email: 'usuario1@example.com', status: 'active' },
        { id: 9, name: 'Usuario Dos', email: 'usuario2@example.com', status: 'active' },
        { id: 10, name: 'Usuario Tres', email: 'usuario3@example.com', status: 'active' },
        { id: 11, name: 'Usuario Cuatro', email: 'usuario4@example.com', status: 'inactive' }
      ],
      permissions: [
        'Ver contenido', 'Compartir publicaciones', 'Guardar favoritos'
      ]
    }
  ];

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // Aquí iría la llamada a la API real
        // const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/roles`, {
        //   headers: {
        //     'Authorization': `Bearer ${token}`,
        //     'Content-Type': 'application/json'
        // }
        // });
        // const data = await response.json();
        
        // Por ahora usamos datos de ejemplo
        setRoles(rolesData);
      } catch (error) {
        console.error('Error al cargar los roles:', error);
        toast.error('Error al cargar los roles y permisos');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [token]);

  const toggleRole = (roleId) => {
    setExpandedRole(expandedRole === roleId ? null : roleId);
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    if (status === 'active') {
      return <span className={`${baseClasses} bg-green-100 text-green-800`}>Activo</span>;
    }
    return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Inactivo</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Roles y Permisos</h1>
        <p className="text-gray-600">Administra los roles de usuario y sus permisos en la plataforma</p>
      </div>

      <div className="space-y-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <div 
              className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={() => toggleRole(role.id)}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gray-100 mr-4">
                  {role.icon || <FaUsers className="text-gray-500" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{role.name}</h3>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">
                  {role.users.length} {role.users.length === 1 ? 'usuario' : 'usuarios'}
                </span>
                {expandedRole === role.id ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>
            
            {expandedRole === role.id && (
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Usuarios con este rol:</h4>
                  <div className="space-y-2">
                    {role.users.map(user => (
                      <div key={user.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        {getStatusBadge(user.status)}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Permisos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permission, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    onClick={() => navigate(`/admin/roles/${role.id}/edit`)}
                  >
                    Editar Rol
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolesManagement;
