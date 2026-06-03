import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User as UserIcon, Scissors, LayoutDashboard, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on navigate
  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-150 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
              <Scissors className="h-6 w-6 text-primary rotate-90" />
              <span>DhakaCut</span>
              <span className="text-xs bg-primary-light text-primary px-1.5 py-0.5 rounded ml-1 font-semibold">2.0</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-primary border-b-2 border-primary py-5' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Home
            </Link>
            <Link 
              to="/salons" 
              className={`text-sm font-medium transition-colors ${isActive('/salons') ? 'text-primary border-b-2 border-primary py-5' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Book Salon
            </Link>
            <Link 
              to="/map" 
              className={`text-sm font-medium transition-colors ${isActive('/map') ? 'text-primary border-b-2 border-primary py-5' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Map View
            </Link>
            
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none py-2 px-3 hover:bg-gray-50 rounded transition-colors border border-gray-100"
                >
                  <UserIcon className="h-4 w-4 text-gray-500 bg-gray-100 rounded-full p-0.5" />
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user.displayName || 'Client'}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-150 rounded shadow-premium py-1 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>My Bookings</span>
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-primary font-medium hover:bg-primary-light/30 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error-light/20 transition-colors border-t border-gray-100 text-left"
                    >
                      <LogOut className="h-4 w-4 text-error" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Login
                </Link>
                <Button size="sm" onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-900 p-2 rounded focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-150 bg-white px-2 pt-2 pb-4 space-y-1">
          <Link
            to="/"
            className={`block px-3 py-2 rounded text-base font-medium ${isActive('/') ? 'bg-primary-light text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Home
          </Link>
          <Link
            to="/salons"
            className={`block px-3 py-2 rounded text-base font-medium ${isActive('/salons') ? 'bg-primary-light text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Book Salon
          </Link>
          <Link
            to="/map"
            className={`block px-3 py-2 rounded text-base font-medium ${isActive('/map') ? 'bg-primary-light text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Map View
          </Link>

          {user ? (
            <div className="border-t border-gray-100 pt-4 mt-4 px-3">
              <div className="flex items-center gap-3 mb-3">
                <UserIcon className="h-8 w-8 text-gray-500 bg-gray-100 rounded-full p-1.5" />
                <div>
                  <div className="text-base font-medium text-gray-800">{user.displayName}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
              </div>
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                My Bookings
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 rounded text-base font-medium text-primary hover:bg-primary-light/30"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 rounded text-base font-medium text-error hover:bg-error-light/20 mt-2"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="border-t border-gray-100 pt-4 mt-4 flex flex-col gap-2 px-3">
              <Button variant="outline" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button onClick={() => navigate('/signup')}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
