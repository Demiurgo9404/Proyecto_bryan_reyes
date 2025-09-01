import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../api/userService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaCoins, 
  FaHistory, 
  FaUserClock, 
  FaChartLine, 
  FaUserFriends, 
  FaArrowLeft, 
  FaUser, 
  FaEnvelope, 
  FaShieldAlt, 
  FaCalendarAlt, 
  FaClock,
  FaSignInAlt,
  FaSignOutAlt,
  FaExchangeAlt,
  FaSpinner
} from 'react-icons/fa';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [loading, setLoading] = useState({
    user: true,
    stats: true,
    transactions: true,
    activity: true
  });
  
  const [stats, setStats] = useState({
    coins: 0,
    totalSpent: 0,
    loginHours: 0,
    profileViews: 0,
    lastLogin: null,
    memberSince: null,
    status: 'inactive',
    role: 'user',
    loginCount: 0
  });
  
  const [transactions, setTransactions] = useState([]);
  const [activity, setActivity] = useState([]);

  // Función para cargar los datos del usuario
  const fetchUserData = async () => {
    try {
      console.log(`[UserDetail] Fetching user data for ID: ${id}`);
      const response = await userService.getUserById(id);
      console.log('[UserDetail] User data response:', response);
      
      // Handle different response formats
      if (response.success && response.data) {
        setUser(response.data);
      } else if (response.id) {
        // If response is the user object directly
        setUser(response);
      } else {
        throw new Error(response.error || 'Formato de respuesta no válido');
      }
      
      setLoading(prev => ({ ...prev, user: false }));
    } catch (err) {
      console.error('[UserDetail] Error loading user data:', {
        error: err,
        message: err.message,
        stack: err.stack
      });
      
      toast.error(err.message || 'Error al cargar los datos del usuario');
      setLoading(prev => ({ ...prev, user: false }));
      setUser({});
      
      // Redirect to users list if user not found
      if (err.message.includes('404') || err.message.includes('no encontrado')) {
        setTimeout(() => navigate('/admin/usuarios'), 2000);
      }
    }
  };

  // Función para cargar las estadísticas
  const fetchUserStats = async () => {
    try {
      const response = await userService.getUserStats(id);
      const statsData = response?.data || {};
      setStats({
        coins: statsData.coins || 0,
        totalSpent: statsData.totalSpent || 0,
        loginHours: statsData.loginHours || 0,
        profileViews: statsData.profileViews || 0,
        lastLogin: statsData.lastLogin || null,
        memberSince: statsData.memberSince || null,
        status: statsData.status || 'inactive',
        role: statsData.role || 'user',
        loginCount: statsData.loginCount || 0
      });
      setLoading(prev => ({ ...prev, stats: false }));
    } catch (err) {
      console.error('Error al cargar las estadísticas:', err);
      toast.error('Error al cargar las estadísticas del usuario');
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Función para cargar las transacciones
  const fetchTransactions = async () => {
    try {
      const response = await userService.getUserTransactions(id);
      setTransactions(Array.isArray(response.data) ? response.data : []);
      setLoading(prev => ({ ...prev, transactions: false }));
    } catch (err) {
      console.error('Error al cargar las transacciones:', err);
      toast.error('Error al cargar el historial de transacciones');
      setLoading(prev => ({ ...prev, transactions: false }));
      setTransactions([]);
    }
  };

  // Función para cargar la actividad
  const fetchActivity = async () => {
    try {
      const response = await userService.getUserActivity(id);
      setActivity(Array.isArray(response.data) ? response.data : []);
      setLoading(prev => ({ ...prev, activity: false }));
    } catch (err) {
      console.error('Error al cargar la actividad:', err);
      toast.error('Error al cargar el registro de actividad');
      setLoading(prev => ({ ...prev, activity: false }));
      setActivity([]);
    }
  };

  // Cargar todos los datos al montar el componente
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        fetchUserData(),
        fetchUserStats(),
        fetchTransactions(),
        fetchActivity()
      ]);
    };

    loadAllData();
  }, [id]);

  // Función para mostrar el estado de carga
  const renderLoader = (isLoading) => {
    if (!isLoading) return null;
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  };

  // Mostrar carga general
  if (loading.user && !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Usuario no encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">El usuario que buscas no existe o no tienes permiso para verlo.</p>
      </div>
    );
  }

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calcular total gastado
  const totalSpent = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Formatear fecha
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Nunca';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Renderizar tarjeta de estadísticas
  const renderStatCard = (icon, title, value, color = 'blue') => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  // Renderizar tarjeta de perfil
  const renderProfileCard = () => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
            <FaUser className="h-8 w-8 text-gray-500" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900">{user.username}</h2>
            <p className="text-sm text-gray-600">{user.email}</p>
            <div className="mt-1 flex items-center">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.is_active ? 'Activo' : 'Inactivo'}
              </span>
              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 px-6 py-4">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Miembro desde</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(user.created_at)}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Último inicio de sesión</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDateTime(user.last_login)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Estado de verificación</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {user.is_verified ? 'Cuenta verificada' : 'Cuenta no verificada'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );

  // Renderizar tabla de transacciones
  const renderTransactionsTable = () => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Historial de Transacciones</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(tx.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tx.description || 'Transacción'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                    tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tx.status === 'completed' ? 'Completado' : 
                       tx.status === 'pending' ? 'Pendiente' : 'Fallido'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron transacciones
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Renderizar actividad reciente
  const renderActivityFeed = () => (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Actividad Reciente</h3>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {loading.activity ? (
            <li className="px-6 py-4 text-center text-sm text-gray-500">
              Cargando actividad...
            </li>
          ) : activity.length > 0 ? (
            activity.map((act) => (
              <li key={act.id} className="px-6 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {act.type === 'login' && <FaSignInAlt className="h-5 w-5 text-green-500" />}
                    {act.type === 'logout' && <FaSignOutAlt className="h-5 w-5 text-gray-500" />}
                    {!['login', 'logout'].includes(act.type) && <FaExchangeAlt className="h-5 w-5 text-blue-500" />}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      {act.description || 'Actividad del usuario'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(act.created_at)}
                    </p>
                    {act.metadata && (
                      <div className="mt-1 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <pre className="whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(act.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-4 text-center text-sm text-gray-500">
              No hay actividad reciente para mostrar
            </li>
          )}
        </ul>
      </div>
    </div>
  );

  // Main component render
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Detalles del Usuario
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaArrowLeft className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Volver
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Transacciones
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Actividad
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6 mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {renderProfileCard()}
            {renderTransactionsTable()}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Historial de Transacciones
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Todas las transacciones realizadas por este usuario.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading.transactions ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                          Cargando transacciones...
                        </td>
                      </tr>
                    ) : transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                            {new Intl.NumberFormat('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              minimumFractionDigits: 0
                            }).format(transaction.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                transaction.status === 'completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : transaction.status === 'pending' 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {transaction.status === 'completed' 
                                ? 'Completada'
                                : transaction.status === 'pending' 
                                  ? 'Pendiente' 
                                  : 'Fallida'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                          No se encontraron transacciones
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Actividad Reciente
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {loading.activity ? (
                  <li className="px-6 py-4 text-center text-sm text-gray-500">
                    Cargando actividad...
                  </li>
                ) : activity.length > 0 ? (
                  activity.map((act) => (
                    <li key={act.id} className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {act.type === 'login' && (
                            <FaSignInAlt className="h-5 w-5 text-green-500" />
                          )}
                          {act.type === 'logout' && (
                            <FaSignOutAlt className="h-5 w-5 text-gray-500" />
                          )}
                          {!['login', 'logout'].includes(act.type) && (
                            <FaExchangeAlt className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {act.description || 'Actividad del usuario'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {act.timestamp ? new Date(act.timestamp).toLocaleString() : 'Fecha no disponible'}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay actividad reciente para mostrar
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
