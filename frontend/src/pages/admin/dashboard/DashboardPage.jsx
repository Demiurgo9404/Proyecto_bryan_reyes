import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaMoneyBillWave, 
  FaShoppingCart, 
  FaShieldAlt, 
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaSync
} from 'react-icons/fa';
import { usersApi } from '../../../api/client';
import { useAuth } from '../../../contexts/AuthContext';

// Statistics Card Component
const StatCard = ({ title, value, icon, change, color, link }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {change && (
          <div className={`mt-2 flex items-center ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change.isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
            <span className="text-sm font-medium">{change.value}% from last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        {React.cloneElement(icon, { className: `${icon.props.className} ${color.replace('bg', 'text')}` })}
      </div>
    </div>
    {link && (
      <div className="mt-4">
        <Link to={link} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          View all
        </Link>
      </div>
    )}
  </div>
);

// Activity Item Component
const ActivityItem = ({ type, title, time, user }) => {
  const getIcon = () => {
    switch (type) {
      case 'new_user':
        return <FaUsers className="h-5 w-5 text-blue-500" />;
      case 'order':
        return <FaShoppingCart className="h-5 w-5 text-green-500" />;
      case 'comment':
        return <FaShieldAlt className="h-5 w-5 text-yellow-500" />;
      default:
        return <FaChartLine className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-start pb-4">
      <div className="mr-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100">
          {getIcon()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{user}</p>
      </div>
      <div className="ml-4 text-sm text-gray-500">
        {time}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    totalOrders: 0
  });
  
  // Check authentication and load data
  useEffect(() => {
    if (authLoading) return; // Wait for auth to initialize
    
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch users data
        const users = await usersApi.list().catch(err => {
          if (err.status === 401) {
            logout();
            navigate('/login', { replace: true });
            return [];
          }
          throw err;
        });
        
        if (!isMounted) return;
        
        setStats({
          totalUsers: Array.isArray(users) ? users.length : 0,
          activeUsers: Math.floor(Math.random() * 100), // Sample data
          totalRevenue: 24850, // Sample data
          totalOrders: 342 // Sample data
        });
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        if (isMounted) {
          setError('Failed to load dashboard data. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, navigate, logout]);

  // Sample data for recent activities
  const [activities] = useState([
    {
      id: 1,
      type: 'new_user',
      title: 'New user registered',
      time: '5 min ago',
      user: 'John Doe'
    },
    {
      id: 2,
      type: 'order',
      title: 'New order received',
      time: '1 hour ago',
      user: 'Jane Smith'
    },
    {
      id: 3,
      type: 'comment',
      title: 'New comment received',
      time: '2 hours ago',
      user: 'Alex Johnson'
    }
  ]);

  // Statistics cards data
  const statCards = [
    { 
      id: 1,
      title: 'Total Users', 
      value: stats.totalUsers.toLocaleString(), 
      icon: <FaUsers className="h-6 w-6" />, 
      change: { value: 12.5, isPositive: true },
      color: 'bg-blue-500',
      link: '/admin/usuarios'
    },
    { 
      id: 2,
      title: 'Active Users', 
      value: stats.activeUsers.toLocaleString(), 
      icon: <FaUsers className="h-6 w-6" />, 
      change: { value: 5.2, isPositive: true },
      color: 'bg-green-500',
      link: '/admin/usuarios?status=active'
    },
    { 
      id: 3,
      title: 'Total Revenue', 
      value: `$${stats.totalRevenue.toLocaleString()}`, 
      icon: <FaMoneyBillWave className="h-6 w-6" />, 
      change: { value: 8.1, isPositive: true },
      color: 'bg-yellow-500',
      link: '/admin/ventas'
    },
    { 
      id: 4,
      title: 'Total Orders', 
      value: stats.totalOrders.toLocaleString(), 
      icon: <FaShoppingCart className="h-6 w-6" />, 
      change: { value: 3.7, isPositive: true },
      color: 'bg-purple-500',
      link: '/admin/ventas'
    }
  ];

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900">Error loading dashboard</h3>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaSync className="mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back, {user?.name || 'Admin'}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <StatCard key={card.id} {...card} />
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              <div className="mt-4 space-y-4">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} {...activity} />
                ))}
                {!activities.length && (
                  <div className="p-6 text-center text-gray-500">
                    No recent activities to display
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
