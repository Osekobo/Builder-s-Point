// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaShieldHalved, FaCircleCheck, FaCircleExclamation } from 'react-icons/fa6';
import api from '../api/client';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setIsEmailSent(true);
        // Store email in sessionStorage for OTP verification
        sessionStorage.setItem('reset_email', email);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center py-6 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white border-4 border-black shadow-hard-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center w-20 h-20 bg-terra/10 border-4 border-terra mb-6">
              <FaEnvelope className="h-10 w-10 text-terra" />
            </div>
            <h2 className="font-h text-2xl font-bold text-black uppercase mb-2">Check Your Email</h2>
            <div className="brick-line mx-auto mb-4"></div>
            <p className="text-ash mb-4">
              We've sent a password reset code to <strong className="text-terra">{email}</strong>
            </p>
            <p className="text-sm text-ash mb-6">
              Enter the code on the next page to reset your password.
            </p>
            <button
              onClick={() => navigate('/reset-password')}
              className="w-full bg-terra text-white py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              Enter Reset Code
            </button>
            <button
              onClick={() => {
                setIsEmailSent(false);
                setEmail('');
              }}
              className="w-full mt-3 text-terra hover:text-terra-dark text-sm font-semibold transition-colors"
            >
              ← Back to forgot password
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm flex items-center justify-center py-6 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FaShieldHalved className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl font-bold text-black uppercase tracking-tight">Forgot Password?</h1>
          <div className="brick-line mx-auto mt-4"></div>
        </div>

        <div className="bg-white border-4 border-black shadow-hard-lg p-8">
          <div className="text-center mb-6">
            <Link to="/login" className="inline-flex items-center text-sm text-terra hover:text-terra-dark font-semibold transition-colors group">
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Login
            </Link>
          </div>

          <h2 className="font-h text-2xl font-bold text-black text-center uppercase mb-2">
            Reset Your Password
          </h2>
          <p className="text-ash text-center mb-6">
            Enter your email address and we'll send you a code to reset your password.
          </p>

          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 mb-4 flex items-start space-x-2">
              <FaCircleExclamation className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Email Address
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-terra text-white py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <FaEnvelope className="w-5 h-5" />
                  <span>Send Reset Code</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-black"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-ash">Remember your password?</span>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/login" className="text-terra hover:text-terra-dark font-bold uppercase tracking-wider transition-colors">
                Back to Login
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t-2 border-black text-center">
            <p className="text-xs text-ash flex items-center justify-center space-x-1">
              <FaShieldHalved className="w-3 h-3 text-terra" />
              <span>Your information is secure</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;