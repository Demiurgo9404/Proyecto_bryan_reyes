import React, { useState, useEffect } from 'react';
import { 
  FaDollarSign, 
  FaShoppingCart, 
  FaUsers, 
  FaChartLine, 
  FaCalendarAlt,
  FaSearch,
  FaFileExport,
  FaFilter
} from 'react-icons/fa';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { useAuth } from '../../contexts/AuthContext';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SalesDashboard = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('this_month');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Datos de ejemplo (reemplazar con llamadas a la API)
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalCustomers: 0,
    conversionRate: 0,
    salesTrend: [],
    topProducts: [],
    recentTransactions: []
  });

  // Datos de ejemplo para gráficos
  const sampleData = {
    totalRevenue: 12450.75,
    totalSales: 189,
    totalCustomers: 124,
    conversionRate: 3.2,
    salesTrend: [
      { month: 'Ene', sales: 65 },
      { month: 'Feb', sales: 59 },
      { month: 'Mar', sales: 80 },
      { month: 'Abr', sales: 81 },
      { month: 'May', sales: 56 },
      { month: 'Jun', sales: 55 },
      { month: 'Jul', sales: 40 },
      { month: 'Ago', sales: 65 },
      { month: 'Sep', sales: 59 },
      { month: 'Oct', sales: 80 },
      { month: 'Nov', sales: 81 },
      { month: 'Dic', sales: 56 }
    ],
    topProducts: [
      { id: 1, name: 'Paquete Premium', sales: 45, revenue: 899.55 },
      { id: 2, name: 'Paquete Estándar', sales: 38, revenue: 379.62 },
      { id: 3, name: 'Paquete Básico', sales: 28, revenue: 139.72 }
    ],
    recentTransactions: [
      { id: 1001, customer: 'Juan Pérez', product: 'Paquete Premium', amount: 19.99, date: '2023-12-15', status: 'completed' },
      { id: 1002, customer: 'María García', product: 'Paquete Estándar', amount: 9.99, date: '2023-12-14', status: 'completed' },
      { id: 1003, customer: 'Carlos López', product: 'Paquete Básico', amount: 4.99, date: '2023-12-14', status: 'completed' },
      { id: 1004, customer: 'Ana Martínez', product: 'Paquete Premium', amount: 19.99, date: '2023-12-13', status: 'completed' },
      { id: 1005, customer: 'Luis Rodríguez', product: 'Paquete Estándar', amount: 9.99, date: '2023-12-12', status: 'completed' }
    ]
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Aquí iría la llamada a la API real
        // const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/sales/stats?range=${timeRange}`, {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
        // const data = await response.json();
        
        // Usamos datos de ejemplo por ahora
        setSalesData(sampleData);
      } catch (error) {
        console.error('Error al cargar datos de ventas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, token]);

  // Configuración de gráficos
  const salesTrendData = {
    labels: salesData.salesTrend.map(item => item.month),
    datasets: [
      {
        label: 'Ventas',
        data: salesData.salesTrend.map(item => item.sales),
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }
    ]
  };

  const topProductsData = {
    labels: salesData.topProducts.map(item => item.name),
    datasets: [
      {
        label: 'Ventas',
        data: salesData.topProducts.map(item => item.sales),
        backgroundColor: [
          'rgba(79, 70, 229, 0.7)',
          'rgba(99, 102, 241, 0.7)',
          'rgba(129, 140, 248, 0.7)'
        ],
        borderColor: [
          'rgba(79, 70, 229, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(129, 140, 248, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN' 
    }).format(amount);
  };

  const filteredTransactions = salesData.recentTransactions.filter(transaction =>
    transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.id.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel de Ventas</h1>
          <p className="text-gray-600">Estadísticas y análisis de ventas de paquetes de monedas</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className="text-gray-400" />
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="today">Hoy</option>
              <option value="yesterday">Ayer</option>
              <option value="this_week">Esta semana</option>
              <option value="last_week">Semana pasada</option>
              <option value="this_month" selected>Este mes</option>
              <option value="last_month">Mes pasado</option>
              <option value="this_year">Este año</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center">
            <FaFileExport className="mr-2" /> Exportar
          </button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <FaDollarSign className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(salesData.totalRevenue)}
              </p>
              <p className="text-xs text-green-600 flex items-center">
                <FaChartLine className="mr-1" /> 12.5% vs período anterior
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaShoppingCart className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {salesData.totalSales}
              </p>
              <p className="text-xs text-green-600 flex items-center">
                <FaChartLine className="mr-1" /> 8.3% vs período anterior
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaUsers className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Clientes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {salesData.totalCustomers}
              </p>
              <p className="text-xs text-green-600 flex items-center">
                <FaChartLine className="mr-1" /> 5.7% vs período anterior
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaChartLine className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tasa de Conversión</p>
              <p className="text-2xl font-semibold text-gray-900">
                {salesData.conversionRate}%
              </p>
              <p className="text-xs text-red-600 flex items-center">
                <FaChartLine className="mr-1 transform rotate-180" /> 0.8% vs período anterior
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tendencia de Ventas</h3>
          <div className="h-80">
            <Line data={salesTrendData} options={chartOptions} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Productos Más Vendidos</h3>
          <div className="h-80">
            <Bar data={topProductsData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Tabla de transacciones recientes */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Transacciones Recientes</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Historial de compras de paquetes de monedas</p>
          </div>
          <div className="mt-3 sm:mt-0 w-full sm:w-auto">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                placeholder="Buscar transacciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  title="Filtrar"
                >
                  <FaFilter />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status === 'completed' ? 'Completado' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
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
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">5</span> de{' '}
                <span className="font-medium">24</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  1
                </button>
                <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  2
                </button>
                <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  3
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
