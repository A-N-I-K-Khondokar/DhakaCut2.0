import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardHeader, CardBody } from '../components/Card';
import { validateEmail, validateRequired } from '../utils/validators';

export const LoginPage: React.FC = () => {
  const { logIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear errors
    setEmailError('');
    setPasswordError('');
    
    // Validate
    const requiredEmail = validateRequired(email, 'Email');
    const requiredPassword = validateRequired(password, 'Password');
    
    let hasError = false;
    
    if (requiredEmail) {
      setEmailError(requiredEmail);
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }
    
    if (requiredPassword) {
      setPasswordError(requiredPassword);
      hasError = true;
    }
    
    if (hasError) return;
    
    setLoading(true);
    try {
      const user = await logIn(email, password);
      toast(`Welcome back, ${user.displayName || 'Client'}!`, 'success');
      
      const redirect = searchParams.get('redirect');
      if (redirect) {
        navigate(`/${redirect}`);
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to sign in. Check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border border-gray-150 animate-fade-in">
        <CardHeader className="text-center py-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to book and manage appointments</p>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              error={emailError}
              autoComplete="email"
              required
            />
            
            <div className="flex flex-col gap-1">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                error={passwordError}
                autoComplete="current-password"
                required
              />
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => toast('Password reset link is only available on production servers.', 'info')}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2 font-semibold"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Sign Up
            </Link>
          </div>
          
          <div className="mt-8 border-t border-gray-150 pt-4 text-center text-xs text-gray-400">
            <p className="font-semibold text-gray-500 mb-1">Quick Login Profiles (Demo Mode):</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => { setEmail('customer@dhacut.com'); setPassword('123456'); }}
                className="hover:underline text-primary"
              >
                Customer Account
              </button>
              <button 
                onClick={() => { setEmail('admin@dhacut.com'); setPassword('123456'); }}
                className="hover:underline text-primary"
              >
                Admin Account
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
