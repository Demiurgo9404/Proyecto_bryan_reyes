import React from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';
import { RegisterFormValues } from '../schemas/registerSchema';

interface GenderSelectProps {
  register: UseFormRegister<RegisterFormValues>;
  error?: FieldError;
  className?: string;
}

const GenderSelect: React.FC<GenderSelectProps> = ({ register, error, className = '' }) => {
  const genderOptions = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino' },
    { value: 'other', label: 'Otro' },
    { value: 'prefer-not-to-say', label: 'Prefiero no decirlo' },
  ];

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Género <span className="text-red-500">*</span>
      </label>
      <div className="mt-1 space-y-2">
        {genderOptions.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`gender-${option.value}`}
              type="radio"
              value={option.value}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              {...register('gender')}
            />
            <label
              htmlFor={`gender-${option.value}`}
              className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default GenderSelect;
