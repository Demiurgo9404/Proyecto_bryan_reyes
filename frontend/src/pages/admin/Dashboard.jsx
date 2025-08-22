import React from 'react';
import { 
  UserGroupIcon, 
  ClockIcon, 
  GlobeAltIcon, 
  UserCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Datos de ejemplo - en una aplicación real estos vendrían de una API
const userStats = {
  totalUsers: 1245,
  newUsersToday: 42,
  activeNow: 187,
  userGrowth: 12.5,
};

const timeData = [
  { hour: '00:00', users: 45 },
  { hour: '04:00', users: 32 },
  { hour: '08:00', users: 78 },
  { hour: '12:00', users: 156 },
  { hour: '16:00', users: 189 },
  { hour: '20:00', users: 210 },
  { hour: '23:59', users: 92 },
];

const locationData = [
  { name: 'México', value: 400 },
  { name: 'Colombia', value: 300 },
  { name: 'Argentina', value: 200 },
  { name: 'España', value: 150 },
  { name: 'Otros', value: 195 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panel de Control</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Resumen general de la plataforma y estadísticas de uso.
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tarjeta 1: Usuarios Totales */}
        <div className="group relative bg-gradient-to-br from-indigo-50 to-white p-5 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-gray-100">
          <div className="flex items-start">
            <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm">
              <UserGroupIcon className="w-5 h-5" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-indigo-800/80">Usuarios Totales</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-indigo-900">{userStats.totalUsers.toLocaleString()}</p>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                  {userStats.userGrowth}%
                </span>
              </div>
              <div className="mt-1 h-1 w-full bg-indigo-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Nuevos Hoy */}
        <div className="group relative bg-gradient-to-br from-green-50 to-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-green-50">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-800/80">Nuevos Hoy</p>
              <p className="text-2xl font-bold text-green-900">+{userStats.newUsersToday}</p>
              <div className="mt-1 h-1 w-full bg-green-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta 3: Usuarios Activos */}
        <div className="group relative bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-amber-50">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md">
              <ClockIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-amber-800/80">Usuarios Activos</p>
              <p className="text-2xl font-bold text-amber-900">{userStats.activeNow}</p>
              <div className="mt-1 h-1 w-full bg-amber-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta 4: Países */}
        <div className="group relative bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-purple-50">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md">
              <GlobeAltIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-800/80">Países</p>
              <p className="text-2xl font-bold text-purple-900">+25</p>
              <div className="mt-1 h-1 w-full bg-purple-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-2">
        <div className="p-5 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Actividad por Hora</h3>
            <p className="text-sm text-gray-500 mt-1">Distribución de usuarios en las últimas 24h</p>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E7FF" />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4B5563', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4B5563', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.96)',
                    border: '1px solid #E0E7FF',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="users" 
                  name="Usuarios" 
                  radius={[4, 4, 0, 0]}
                  fill="url(#colorUsers)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Distribución por País</h3>
            <p className="text-sm text-gray-500 mt-1">Porcentaje de usuarios por ubicación</p>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {COLORS.map((color, index) => (
                    <linearGradient key={index} id={`colorPie${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0.3}/>
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={locationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {locationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#colorPie${index % COLORS.length})`}
                      stroke="#fff"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value} usuarios`, props.payload.name]}
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.96)',
                    border: '1px solid #EDE9FE',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend 
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Últimas actividades */}
      <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
              <p className="text-sm text-gray-500 mt-1">Últimas acciones en la plataforma</p>
            </div>
            <button className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200 border border-gray-200 hover:border-indigo-300">
              Ver todo
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { 
              id: 1, 
              user: 'María García', 
              action: 'Creó una cuenta', 
              time: 'Hace 5m',
              icon: '👤',
              color: 'bg-blue-50 text-blue-600'
            },
            { 
              id: 2, 
              user: 'Carlos López', 
              action: 'Actualizó su perfil', 
              time: 'Hace 15m',
              icon: '✏️',
              color: 'bg-green-50 text-green-600'
            },
            { 
              id: 3, 
              user: 'Ana Martínez', 
              action: 'Completó su perfil', 
              time: 'Hace 30m',
              icon: '✅',
              color: 'bg-purple-50 text-purple-600'
            },
            { 
              id: 4, 
              user: 'Juan Pérez', 
              action: 'Inició sesión', 
              time: 'Hace 1h',
              icon: '🔑',
              color: 'bg-amber-50 text-amber-600'
            },
            { 
              id: 5, 
              user: 'Laura Sánchez', 
              action: 'Subió una foto', 
              time: 'Hace 2h',
              icon: '🖼️',
              color: 'bg-pink-50 text-pink-600'
            },
          ].map((activity) => (
            <div key={activity.id} className="px-5 sm:px-6 py-3 hover:bg-gray-50/50 transition-colors duration-150">
              <div className="flex items-start">
                <div className={`flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center ${activity.color} text-base mt-0.5`}>
                  {activity.icon}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.user}</p>
                    <p className="ml-2 text-xs text-gray-400 whitespace-nowrap">{activity.time}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{activity.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 sm:px-6 py-3 bg-gray-50 text-center border-t border-gray-100">
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-colors duration-200">
            Cargar más actividad
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
