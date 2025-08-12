import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="relative overflow-hidden">
        {/* Hero section */}
        <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
          <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 lg:flex lg:items-center">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Encuentra tu</span>
                <span className="block text-primary-600">media naranja</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Conecta con personas increíbles y encuentra el amor de tu vida en nuestra plataforma de citas segura y fácil de usar.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link
                    to="/register"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                  >
                    Crear cuenta
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    to="/explore"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
                  >
                    Explorar perfiles
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                  <img
                    className="w-full"
                    src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                    alt="Pareja feliz"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Características</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Una mejor manera de encontrar el amor
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Nuestra plataforma está diseñada para ayudarte a encontrar a tu pareja ideal de manera rápida y segura.
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                {[
                  {
                    name: 'Búsqueda avanzada',
                    description: 'Encuentra personas que compartan tus intereses y valores con nuestro sistema de búsqueda avanzada.',
                    icon: '🔍',
                  },
                  {
                    name: 'Chat en tiempo real',
                    description: 'Conéctate con tus matches a través de nuestro sistema de mensajería seguro y fácil de usar.',
                    icon: '💬',
                  },
                  {
                    name: 'Videollamadas',
                    description: 'Conoce a tus matches en persona a través de videollamadas seguras sin salir de la plataforma.',
                    icon: '📹',
                  },
                  {
                    name: 'Seguridad',
                    description: 'Tu seguridad es nuestra prioridad. Perfiles verificados y sistema de reportes en tiempo real.',
                    icon: '🛡️',
                  },
                ].map((feature) => (
                  <div key={feature.name} className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white text-2xl">
                        {feature.icon}
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">
                      {feature.description}
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary-700">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">¿Listo para encontrar el amor?</span>
              <span className="block">Crea tu perfil hoy mismo.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-primary-200">
              Únete a miles de personas que ya han encontrado a su media naranja en nuestra plataforma.
            </p>
            <Link
              to="/register"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 sm:w-auto"
            >
              Comenzar ahora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
