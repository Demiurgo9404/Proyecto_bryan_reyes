import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../../store/slices/authSlice';
import { LoginFormValues } from '../schemas/loginSchema';
import { loginSchema } from '../schemas/loginSchema';
import authService from '../services/authService';
import FormInput from './FormInput';
import Button from './Button';
import AuthError from './AuthError';

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, className = '' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError('');
    setIsLoading(true);

    try {
      const { user, token } = await authService.login({
        email: data.email,
        password: data.password,
      });

      // Guardar el token si se marcó "Recordarme"
      if (data.rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }

      // Actualizar el estado de autenticación
      dispatch(loginSuccess({ user, token }));

      // Llamar al callback de éxito si existe
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirigir al dashboard por defecto
        navigate('/dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Iniciar sesión</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>
        </div>

        {error && <AuthError message={error} className="mb-6" />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            id="email"
            type="email"
            label="Correo electrónico"
            placeholder="tucorreo@ejemplo.com"
            error={errors.email}
            autoComplete="email"
            {...register('email')}
          />

          <div className="space-y-2">
            <FormInput
              id="password"
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              error={errors.password}
              autoComplete="current-password"
              {...register('password')}
            />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  {...register('rememberMe')}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Recordarme</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              Iniciar sesión
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            ¿No tienes una cuenta?{' '}
          </span>
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
