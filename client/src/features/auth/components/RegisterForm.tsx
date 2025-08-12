import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../../store/slices/authSlice';
import { RegisterFormValues, registerSchema } from '../schemas/registerSchema';
import authService from '../services/authService';
import FormInput from './FormInput';
import Button from './Button';
import AuthError from './AuthError';
import GenderSelect from './GenderSelect';
import TermsAndConditions from './TermsAndConditions';

interface RegisterFormProps {
  onSuccess?: () => void;
  className?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, className = '' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: 'prefer-not-to-say',
      birthDate: '',
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError('');
    setIsLoading(true);

    try {
      const { user, token } = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        gender: data.gender,
        birthDate: data.birthDate,
      });

      // Guardar el token
      localStorage.setItem('token', token);

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
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Crea tu cuenta</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Únete a nuestra comunidad y comienza tu experiencia
          </p>
        </div>

        {error && <AuthError message={error} className="mb-6" />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              id="name"
              type="text"
              label="Nombre completo"
              placeholder="Tu nombre"
              error={errors.name}
              autoComplete="name"
              {...register('name')}
            />

            <FormInput
              id="email"
              type="email"
              label="Correo electrónico"
              placeholder="tucorreo@ejemplo.com"
              error={errors.email}
              autoComplete="email"
              {...register('email')}
            />

            <FormInput
              id="password"
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              error={errors.password}
              autoComplete="new-password"
              {...register('password')}
              helpText="Mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos"
            />

            <FormInput
              id="confirmPassword"
              type="password"
              label="Confirmar contraseña"
              placeholder="••••••••"
              error={errors.confirmPassword}
              autoComplete="new-password"
              {...register('confirmPassword')}
            />

            <div className="md:col-span-2">
              <FormInput
                id="birthDate"
                type="date"
                label="Fecha de nacimiento"
                error={errors.birthDate}
                {...register('birthDate')}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
              />
            </div>

            <div className="md:col-span-2">
              <GenderSelect
                register={register}
                error={errors.gender}
              />
            </div>
          </div>

          <div className="pt-2">
            <TermsAndConditions
              register={register}
              error={errors.acceptTerms}
              className="mb-6"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              Crear cuenta
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            ¿Ya tienes una cuenta?{' '}
          </span>
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
