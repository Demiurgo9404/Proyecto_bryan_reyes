import React from 'react';
import { FieldError } from 'react-hook-form';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: FieldError | undefined;
  required?: boolean;
  containerClass?: string;
  labelClass?: string;
  inputClass?: string;
  errorClass?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  id,
  error,
  required = false,
  containerClass = '',
  labelClass = '',
  inputClass = '',
  errorClass = '',
  ...props
}) => {
  return (
    <div className={`mb-4 ${containerClass}`}>
      <label
        htmlFor={id}
        className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${labelClass}`}
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={id}
        className={`w-full px-3 py-2 border ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400'
        } rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${inputClass}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${id}-error`}
        {...props}
      />
      {error && (
        <p
          id={`${id}-error`}
          className={`mt-1 text-sm text-red-600 dark:text-red-400 ${errorClass}`}
        >
          {error.message}
        </p>
      )}
    </div>
  );
};

export default FormInput;
