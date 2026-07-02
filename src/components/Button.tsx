import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../utils/helpers';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-white' | 'outline-theme' | 'white' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-700 text-white border border-blue-700 hover:bg-blue-800 focus:ring-blue-700 transition-colors duration-200',
    secondary: 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 focus:ring-gray-400 transition-colors duration-200',
    outline: 'bg-white text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-blue-700 transition-colors duration-200',
    'outline-white': 'bg-transparent text-white border border-white hover:bg-white hover:text-blue-700 focus:ring-white transition-colors duration-200',
    'outline-theme': 'bg-transparent text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-blue-700 transition-colors duration-200',
    white: 'bg-white text-blue-700 border border-white hover:bg-white hover:text-blue-700 focus:ring-blue-200 transition-colors duration-200',
    danger: 'bg-red-600 text-white border border-red-600 hover:bg-red-700 focus:ring-red-500 transition-colors duration-200',
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-xs sm:text-sm min-h-[38px]',
    md: 'px-5 py-2.5 text-sm sm:text-base min-h-[44px]',
    lg: 'px-7 py-3.5 text-base sm:text-lg min-h-[52px]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};
