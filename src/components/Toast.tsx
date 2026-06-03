import React from 'react';
import { useToast, ToastItem } from '../hooks/useToast';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../utils/helpers';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onClose: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onClose }) => {
  const { message, type } = toast;

  const typeStyles = {
    success: 'bg-white border-l-4 border-success text-gray-900 shadow-premium',
    error: 'bg-white border-l-4 border-error text-gray-900 shadow-premium',
    info: 'bg-white border-l-4 border-primary text-gray-900 shadow-premium',
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-success" />,
    error: <AlertCircle className="h-5 w-5 text-error" />,
    info: <Info className="h-5 w-5 text-primary" />,
  };

  return (
    <div
      className={cn(
        'flex items-start p-4 border border-gray-150 rounded shadow-premium pointer-events-auto transform transition-all duration-300 animate-slide-in',
        typeStyles[type]
      )}
    >
      <div className="flex-shrink-0 mr-3">{icons[type]}</div>
      <div className="flex-1 text-sm font-medium mr-2">{message}</div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
