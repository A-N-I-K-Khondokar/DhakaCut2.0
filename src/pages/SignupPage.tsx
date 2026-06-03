import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardHeader, CardBody } from '../components/Card';
import { validateEmail, validatePhone, validatePassword, validateRequired } from '../utils/validators';

export const SignupPage: React.FC = () => {
  const { signUp } = useAuth();
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
