import { useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

// Simple event emitter or pub-sub pattern to allow toasts to be triggered globally without context nesting
type Listener = (toast: ToastItem) => void;
const listeners = new Set<Listener>();

export const emitToast = (message: string, type: ToastType = 'success') => {
  const toastItem: ToastItem = {
    id: Math.random().toString(36).substring(2, 9),
    message,
    type
  };
  listeners.forEach(listener => listener(toastItem));
};

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleNewToast = (newToast: ToastItem) => {
      setToasts(prev => [...prev, newToast]);
      
      // Auto remove after 3.5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 3500);
    };

    listeners.add(handleNewToast);
    return () => {
      listeners.delete(handleNewToast);
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Return trigger function and active items
  return {
    toasts,
    toast: useCallback((message: string, type: ToastType = 'success') => {
      emitToast(message, type);
    }, []),
    removeToast
  };
};
