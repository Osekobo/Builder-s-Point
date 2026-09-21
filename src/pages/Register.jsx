// Register.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaUserPlus, FaShieldHalved, FaCircleCheck, FaCircleExclamation } from 'react-icons/fa6';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Clear any stale errors when register page loads
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Validate phone number (Kenyan format)
  const validatePhone = (phoneNum) => {
    if (!phoneNum) {
      setPhoneError('');
      return true; // Phone is optional
    }
    // Kenyan phone number regex: starts with 0 or 254, followed by 9 digits
    const kenyanPhoneRegex = /^(254|0)[17]\d{8}$/;
    if (!kenyanPhoneRegex.test(phoneNum)) {
      setPhoneError('Enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678)');
      return false;
    }
    setPhoneError('');
    return true;
  };

  // Validate password strength
  const validatePassword = (pass) => {
    if (pass.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (!validatePassword(password)) {
      return;
    }
    
    // Validate phone (optional but format check)
    if (!validatePhone(phone)) {
      return;
    }

    const result = await register({ name, email, phone, password });
    if (result.success) {
      // Auto-login successful, redirect to home
      navigate('/');
    }
  };

  // Helper function to format error messages
  const formatErrorMessage = (error) => {
    if (!error) return null;
    
    if (typeof error === 'string') return error;
    
    if (Array.isArray(error)) {
      return error.map(err => err.msg || JSON.stringify(err)).join(', ');
    }
    
    if (error.detail) {
      if (Array.isArray(error.detail)) {
        return error.detail.map(err => err.msg).join(', ');
      }
      return error.detail;
    }
    
    if (error.message) return error.message;
    
    return 'An error occurred. Please try again.';
  };

  const errorMessage = formatErrorMessage(error);

  // Format phone number as user types
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 12) value = value.slice(0, 12);
    setPhone(value);
    validatePhone(value);
  };

  return (
    <div className="min-h-screen bg-warm flex items-center justify-center py-6 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FaUserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl font-bold text-black uppercase tracking-tight">Join Kione</h1>
          <p className="text-ash mt-2">Create your account to start shopping</p>
          <div className="brick-line mx-auto mt-4"></div>
        </div>

        <div className="bg-white border-4 border-black shadow-hard-lg p-8">
          <h2 className="font-h text-2xl font-bold text-black text-center mb-6 uppercase">
            Create Account
          </h2>
          
          {errorMessage && (
            <div className={`border-2 mb-4 p-4 ${errorMessage.includes('already registered') ? 'bg-yellow-50 border-yellow-500 text-yellow-700' : 'bg-red-100 border-red-500 text-red-700'}`}>
              <div className="flex items-start space-x-2">
                <FaCircleExclamation className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">
                    {errorMessage.includes('already registered') ? 'Account Exists' : 'Registration Error'}
                  </p>
                  <p className="text-sm">{errorMessage}</p>
                  {errorMessage.includes('Email already registered') && (
                    <div className="mt-2">
                      <Link to="/login" className="text-sm font-semibold underline hover:no-underline">
                        Login instead? Click here
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-ash" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                  placeholder="Enter your full name"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-ash" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Phone Number
                <span className="text-xs text-ash font-normal ml-1">(Optional but recommended)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-ash" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                  placeholder="0712345678"
                  disabled={isLoading}
                />
              </div>
              {phoneError && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <FaCircleExclamation className="w-3 h-3 mr-1" />
                  {phoneError}
                </p>
              )}
              <p className="text-ash text-xs mt-1">
                ✓ Used for order updates
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-ash" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                  placeholder="Create a password"
                  required
                  disabled={isLoading}
                />
              </div>
              {passwordError && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <FaCircleExclamation className="w-3 h-3 mr-1" />
                  {passwordError}
                </p>
              )}
              <p className="text-ash text-xs mt-1">
                ✓ Password must be at least 6 characters
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-ash" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                  placeholder="Confirm your password"
                  required
                  disabled={isLoading}
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <FaCircleExclamation className="w-3 h-3 mr-1" />
                  Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && password.length >= 6 && (
                <p className="text-green-600 text-xs mt-1 flex items-center">
                  <FaCircleCheck className="w-3 h-3 mr-1" />
                  Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-terra text-white py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <FaUserPlus className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-ash">
              Already have an account?{' '}
              <Link to="/login" className="text-terra hover:text-terra-dark font-bold uppercase tracking-wider transition-colors">
                Sign In
              </Link>
            </p>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-black"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-ash">Secure Registration</span>
            </div>
          </div>

          <div className="text-center text-xs text-ash">
            <p className="flex items-center justify-center space-x-1">
              <FaShieldHalved className="w-3 h-3" />
              <span>Your data is protected</span>
            </p>
            <p className="mt-2">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-terra hover:text-terra-dark font-semibold">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-terra hover:text-terra-dark font-semibold">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-ash">
            Need help?{' '}
            <a href="https://wa.me/254714391137" className="text-terra hover:text-terra-dark font-semibold">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;