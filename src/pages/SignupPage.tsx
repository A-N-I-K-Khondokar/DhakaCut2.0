import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardHeader, CardBody } from '../components/Card';
import { validateEmail, validatePhone, validatePassword, validateRequired } from '../utils/validators';

export const SignupPage: React.FC = () => {
  const { signUp, googleSignIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');

    let hasError = false;

    // Validate name
    const requiredName = validateRequired(name, 'Full Name');
    if (requiredName) {
      setNameError(requiredName);
      hasError = true;
    }

    // Validate email
    const requiredEmail = validateRequired(email, 'Email Address');
    if (requiredEmail) {
      setEmailError(requiredEmail);
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }

    // Validate phone
    const requiredPhone = validateRequired(phone, 'Phone Number');
    if (requiredPhone) {
      setPhoneError(requiredPhone);
      hasError = true;
    } else if (!validatePhone(phone)) {
      setPhoneError('Please enter a valid phone number (10-15 digits).');
      hasError = true;
    }

    // Validate password
    const requiredPassword = validateRequired(password, 'Password');
    if (requiredPassword) {
      setPasswordError(requiredPassword);
      hasError = true;
    } else {
      const passValidation = validatePassword(password);
      if (!passValidation.isValid) {
        setPasswordError(passValidation.message);
        hasError = true;
      }
    }

    if (hasError) return;

    setLoading(true);
    try {
      await signUp(email, password, name, phone);
      toast('Registration successful! Welcome to DhakaCut.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      toast(err.message || 'Failed to create account.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const user = await googleSignIn();
      toast(`Welcome to DhakaCut, ${user.displayName || 'User'}!`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      toast(err.message || 'Google sign-in failed. Please try again.', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border border-gray-150 animate-fade-in">
        <CardHeader className="text-center py-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create an Account</h2>
          <p className="text-sm text-gray-500 mt-1">Join DhakaCut for easy grooming reservations</p>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g., Tanvir Rahman"
              error={nameError}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E.g., tanvir@example.com"
              error={emailError}
              autoComplete="email"
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="E.g., 01711223344"
              error={phoneError}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters (letters & numbers)"
              error={passwordError}
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              className="w-full mt-2 font-semibold"
              isLoading={loading}
            >
              Sign Up
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Sign-In Button */}
          <button
            id="google-signup-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-semibold text-gray-700 shadow-subtle disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5 flex-shrink-0">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
            )}
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="text-center mt-6 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
