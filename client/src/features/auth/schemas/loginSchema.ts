import * as yup from 'yup';
import { LoginFormData } from '../types';

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Por favor, ingresa un correo electrónico válido')
    .required('El correo electrónico es requerido'),
  password: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .required('La contraseña es requerida'),
  rememberMe: yup.boolean(),
}) as yup.ObjectSchema<LoginFormData>;

export type LoginFormValues = yup.InferType<typeof loginSchema>;
