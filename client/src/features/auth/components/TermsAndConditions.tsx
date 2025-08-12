import React, { useState } from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';
import { RegisterFormValues } from '../schemas/registerSchema';
import { Dialog } from '@headlessui/react';

interface TermsAndConditionsProps {
  register: UseFormRegister<RegisterFormValues>;
  error?: FieldError;
  className?: string;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
  register,
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${className}`}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="acceptTerms"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            {...register('acceptTerms')}
          />
        </div>
        <div className="ml-3 text-sm">
          <label
            htmlFor="acceptTerms"
            className="font-medium text-gray-700 dark:text-gray-300"
          >
            Acepto los{' '}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 underline"
            >
              Términos y Condiciones
            </button>
          </label>
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {error.message}
            </p>
          )}
        </div>
      </div>

      {/* Modal de Términos y Condiciones */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-3xl rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Términos y Condiciones
            </Dialog.Title>
            <div className="prose dark:prose-invert max-w-none">
              <h3>1. Aceptación de los Términos</h3>
              <p>
                Al registrarte en nuestra plataforma, aceptas cumplir con estos términos y condiciones.
                Si no estás de acuerdo con alguna parte de estos términos, por favor no utilices nuestro servicio.
              </p>

              <h3>2. Uso del Servicio</h3>
              <p>
                Nuestra plataforma está diseñada para proporcionarte una experiencia segura y agradable.
                Te comprometes a no utilizar el servicio para ningún propósito ilegal o no autorizado.
              </p>

              <h3>3. Privacidad</h3>
              <p>
                Respetamos tu privacidad y protegemos tus datos personales de acuerdo con nuestra Política de Privacidad.
                Al registrarte, aceptas nuestra recopilación y uso de tu información personal de acuerdo con dicha política.
              </p>

              <h3>4. Contenido del Usuario</h3>
              <p>
                Eres responsable del contenido que publiques en nuestra plataforma. No debes publicar contenido que sea ofensivo,
                difamatorio, ilegal o que viole los derechos de terceros.
              </p>

              <h3>5. Modificaciones</h3>
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos de cualquier cambio
                importante a través de tu correo electrónico o mediante un aviso en nuestra plataforma.
              </p>

              <h3>6. Terminación</h3>
              <p>
                Podemos suspender o dar por terminado tu acceso a nuestro servicio si violas estos términos o si lo consideramos
                necesario por razones de seguridad o legales.
              </p>

              <p className="mt-4 font-medium">
                Al hacer clic en "Aceptar" a continuación, confirmas que has leído, entendido y aceptado estos términos y condiciones.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
              >
                Cerrar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default TermsAndConditions;
