import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAppSelector } from '../store/hooks';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  // Si no hay usuario, redirigir al login
  React.useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  return (
    <>
      <Helmet>
        <title>Panel de Control | LoveRose</title>
        <meta name="description" content="Bienvenido a tu panel de control de LoveRose" />
      </Helmet>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Hola, {user?.name || 'Usuario'}
          </h1>
          
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Tarjeta de bienvenida */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-500 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Perfil
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {user?.profileComplete ? 'Completo' : 'Por completar'}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-5">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard/profile')}
                    className="w-full"
                  >
                    {user?.profileComplete ? 'Ver perfil' : 'Completar perfil'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Tarjeta de matches */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-pink-500 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Matches
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {user?.matches?.length || 0}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-5">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard/matches')}
                    className="w-full"
                  >
                    Ver mis matches
                  </Button>
                </div>
              </div>
            </div>

            {/* Tarjeta de explorar */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Personas cerca
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {user?.nearbyUsers?.length || '0+'}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-5">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard/explore')}
                    className="w-full"
                  >
                    Explorar perfiles
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de actividad reciente */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Actividad reciente
            </h2>
            <div className="mt-4 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-gray-500 dark:text-gray-400">
                  {user?.recentActivity?.length
                    ? 'Aquí verás tu actividad reciente.'
                    : 'Aún no tienes actividad reciente. ¡Comienza a explorar perfiles!'}
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
