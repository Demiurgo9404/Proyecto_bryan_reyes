import * as yup from 'yup';
import { RegisterFormData } from '../types';

// Expresión regular para validar contraseñas seguras
// Al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .required('El nombre es requerido'),
  email: yup
    .string()
    .email('Por favor, ingresa un correo electrónico válido')
    .required('El correo electrónico es requerido'),
  password: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      passwordRegex,
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'
    )
    .required('La contraseña es requerida'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('Debes confirmar tu contraseña'),
  gender: yup
    .string()
    .oneOf(
      ['male', 'female', 'other', 'prefer-not-to-say'],
      'Por favor, selecciona un género válido'
    )
    .required('El género es requerido'),
  birthDate: yup
    .string()
    .required('La fecha de nacimiento es requerida')
    .test('is-adult', 'Debes tener al menos 18 años', function (value) {
      if (!value) return false;
      const birthDate = new Date(value);
      const today = new Date();
      const minAgeDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      return birthDate <= minAgeDate;
    }),
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'Debes aceptar los términos y condiciones')
    .required('Debes aceptar los términos y condiciones'),
}) as yup.ObjectSchema<RegisterFormData>;

export type RegisterFormValues = yup.InferType<typeof registerSchema>;
