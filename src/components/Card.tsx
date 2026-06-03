import React, { ReactNode } from 'react';
import { cn } from '../utils/helpers';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        'bg-white border border-gray-150 rounded shadow-subtle hover:shadow-premium transition-shadow duration-300',
        onClick ? 'cursor-pointer' : '',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={cn('p-4 border-b border-gray-100', className)}>{children}</div>
);

export const CardBody: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={cn('p-4', className)}>{children}</div>
);

export const CardFooter: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={cn('p-4 border-t border-gray-100 bg-gray-50 rounded-b', className)}>{children}</div>
);
