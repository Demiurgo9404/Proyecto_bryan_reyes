import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-secondary text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">Bienvenido a Love Rose</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">Conectando corazones, creando historias de amor inolvidables</p>
        
        <Link 
          to="/login" 
          className="bg-white text-primary font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition-colors"
        >
          Comenzar Ahora
        </Link>
      </div>

      {/* Features Section */}
      <div className="bg-white text-gray-800 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegir Love Rose?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Amplia Comunidad</h3>
              <p className="text-gray-600 text-center">Conecta con miles de personas que buscan el amor verdadero.</p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Seguridad Garantizada</h3>
              <p className="text-gray-600 text-center">Tu privacidad y seguridad son nuestra prioridad.</p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Fácil de Usar</h3>
              <p className="text-gray-600 text-center">Interfaz intuitiva para que encuentres a tu media naranja fácilmente.</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Sobre Nosotros</h2>
            <p className="text-gray-600 mb-8">
              En Love Rose creemos que el amor verdadero puede encontrarse en cualquier momento. 
              Nuestra misión es conectar a las personas de manera significativa, 
              ofreciendo una plataforma segura y divertida para encontrar a esa persona especial.
            </p>
            <p className="text-gray-600">
              Fundada en 2025, nuestra plataforma ha ayudado a miles de personas a encontrar el amor, 
              amistades duraderas y relaciones significativas.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">¿Listo para encontrar el amor?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Únete a nuestra comunidad hoy mismo y comienza tu viaje hacia el amor verdadero.</p>
          <Link 
            to="/login" 
            className="bg-white text-primary font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition-colors inline-block"
          >
            Crear Cuenta Gratis
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Love Rose</h3>
              <p className="text-gray-400">Encuentra tu media naranja</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">Términos</a>
              <a href="#" className="text-gray-400 hover:text-white">Privacidad</a>
              <a href="#" className="text-gray-400 hover:text-white">Contacto</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Love Rose. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
