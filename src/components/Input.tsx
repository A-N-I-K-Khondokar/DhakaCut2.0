import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../utils/helpers';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={cn(
          'w-full px-3 py-2 border rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors',
          error 
            ? 'border-error focus:border-error focus:ring-error-light focus:ring-2' 
            : 'border-gray-300 focus:border-primary focus:ring-primary-light focus:ring-2',
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-xs text-error font-medium">{error}</span>
      )}
      {!error && helperText && (
        <span className="text-xs text-gray-500">{helperText}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
