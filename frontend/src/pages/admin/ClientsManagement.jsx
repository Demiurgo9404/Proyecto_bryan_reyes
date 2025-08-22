import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usersApi } from '../../api/client';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaUserPlus,
  FaUserCheck,
  FaUserTimes,
  FaSortAmountDown,
  FaSortAmountUp,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ClientsManagement = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchClients = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        // Usar el endpoint específico para clientes (usuarios con rol 'user')
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/clients`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al cargar los clientes');
        }
        
        const data = await response.json();
        setClients(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
        toast.error(error.message || 'Error al cargar la lista de clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [token]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm);
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && client.status === 'activo') ||
      (filterStatus === 'inactive' && client.status === 'inactivo');
    
    return matchesSearch && matchesStatus;
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleViewClient = (id) => {
    navigate(`/admin/clientes/${id}`);
  };

  const handleEditClient = (id) => {
    navigate(`/admin/clientes/${id}/editar`);
  };

  const handleDeleteClient = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await usersApi.delete(token, id);
        setClients(clients.filter(client => client.id !== id));
        toast.success('Cliente eliminado correctamente');
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('Error al eliminar el cliente');
      }
    }
  };

  const toggleStatus = async (client) => {
    const newStatus = client.status === 'activo' ? 'inactivo' : 'activo';
    try {
      await usersApi.update(token, client.id, { status: newStatus });
      setClients(clients.map(c => 
        c.id === client.id ? { ...c, status: newStatus } : c
      ));
      toast.success(`Cliente ${newStatus} correctamente`);
    } catch (error) {
      console.error('Error updating client status:', error);
      toast.error('Error al actualizar el estado del cliente');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona los clientes de la plataforma
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => navigate('/admin/clientes/nuevo')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <FaUserPlus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar clientes por nombre, correo o teléfono..."
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                value={filterStatus}
                onChange={handleStatusChange}
                className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Nombre
                    {sortConfig.key === 'name' ? (
                      sortConfig.direction === 'asc' ? 
                        <FaSortAmountUp className="ml-1" /> : 
                        <FaSortAmountDown className="ml-1" />
                    ) : (
                      <span className="ml-1 w-4"></span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Teléfono
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Estado
                    {sortConfig.key === 'status' ? (
                      sortConfig.direction === 'asc' ? 
                        <FaSortAmountUp className="ml-1" /> : 
                        <FaSortAmountDown className="ml-1" />
                    ) : (
                      <span className="ml-1 w-4"></span>
                    )}
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedClients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron clientes</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || filterStatus !== 'all' 
                          ? 'Prueba a ajustar tu búsqueda o filtro.' 
                          : 'Comienza creando un nuevo cliente.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                          {client.name ? client.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.name || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {client.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.email}</div>
                      <div className="text-xs text-gray-500">
                        {client.lastLogin 
                          ? `Último acceso: ${new Date(client.lastLogin).toLocaleDateString()}` 
                          : 'Nunca ha accedido'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.phone || 'No especificado'}</div>
                      <div className="text-xs text-gray-500">
                        {client.createdAt && `Creado: ${new Date(client.createdAt).toLocaleDateString()}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        client.status === 'activo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {client.status === 'activo' ? (
                          <span className="flex items-center">
                            <FaCheck className="mr-1" /> Activo
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <FaTimes className="mr-1" /> Inactivo
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleViewClient(client.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Ver detalles"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditClient(client.id)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {sortedClients.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Anterior
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">10</span> de{' '}
                <span className="font-medium">{sortedClients.length}</span> clientes
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Anterior</span>
                  <FaChevronLeft className="h-4 w-4" />
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Siguiente</span>
                  <FaChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsManagement;
