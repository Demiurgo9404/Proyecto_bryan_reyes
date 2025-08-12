import React from 'react';

interface AuthErrorProps {
  message: string;
  className?: string;
}

const AuthError: React.FC<AuthErrorProps> = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div 
      className={`p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800 ${className}`}
      role="alert"
    >
      <div className="flex items-center">
        <svg
          className="w-5 h-5 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-medium">Error:</span> {message}
      </div>
    </div>
  );
};

export default AuthError;
