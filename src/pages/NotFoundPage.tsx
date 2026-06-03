import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import { Button } from '../components/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="space-y-6 max-w-md animate-fade-in flex flex-col items-center">
        <Scissors className="h-16 w-16 text-primary rotate-90 opacity-20 animate-pulse" />
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900">404 - Page Not Found</h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-sm leading-relaxed mx-auto">
            The page you are looking for does not exist or has been moved to another location.
          </p>
        </div>

        <Button size="md" onClick={() => navigate('/')}>
          Return to Homepage
        </Button>
      </div>
    </div>
  );
};
