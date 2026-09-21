// src/pages/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaLock, FaCheck, FaArrowLeft, FaShieldHalved, FaCircleExclamation, FaCircleCheck } from 'react-icons/fa6';
import api from '../api/client';

const ResetPassword = () => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email] = useState(() => sessionStorage.getItem("reset_email") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

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
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!validatePassword(newPassword)) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/reset-password', {
        email,
        otp,
        new_password: newPassword
      });
      
      if (response.data.success) {
        setIsSuccess(true);
        // Clear stored email
        sessionStorage.removeItem('reset_email');
        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center py-6 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white border-4 border-black shadow-hard-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center w-20 h-20 bg-green-100 border-4 border-green-500 mb-6">
              <FaCheck className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="font-h text-2xl font-bold text-black uppercase mb-2">Password Reset!</h2>
            <div className="brick-line mx-auto mb-4"></div>
            <p className="text-ash mb-4">
              Your password has been successfully reset.
            </p>
            <p className="text-sm text-ash mb-6">
              Redirecting you to login page...
            </p>
            <Link
              to="/login"
              className="inline-block w-full bg-terra text-white py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-center"
            >
              Go to Login
            </Link>
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
          <h1 className="font-h text-3xl font-bold text-black uppercase tracking-tight">Reset Password</h1>
          <div className="brick-line mx-auto mt-4"></div>
        </div>

        <div className="bg-white border-4 border-black shadow-hard-lg p-8">
          <div className="text-center mb-6">
            <Link to="/forgot-password" className="inline-flex items-center text-sm text-terra hover:text-terra-dark font-semibold transition-colors group">
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Forgot Password
            </Link>
          </div>

          <h2 className="font-h text-2xl font-bold text-black text-center uppercase mb-2">
            Create New Password
          </h2>
          <p className="text-ash text-center mb-6">
            Enter the reset code sent to <strong className="text-terra">{email}</strong> and your new password.
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
            <div className="mb-4">
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Reset Code (OTP)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-ash" />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra text-center tracking-widest text-lg"
                  placeholder="• • • • • •"
                  required
                  disabled={isLoading}
                  maxLength={6}
                />
              </div>
              <p className="text-xs text-ash mt-1">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-ash" />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                  placeholder="Create new password"
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
                Confirm New Password
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
                  placeholder="Confirm your new password"
                  required
                  disabled={isLoading}
                />
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <FaCircleExclamation className="w-3 h-3 mr-1" />
                  Passwords do not match
                </p>
              )}
              {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
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
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Resetting Password...</span>
                </>
              ) : (
                <>
                  <FaLock className="w-5 h-5" />
                  <span>Reset Password</span>
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
                <span className="px-2 bg-white text-ash">Need help?</span>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/forgot-password" className="text-terra hover:text-terra-dark font-bold uppercase tracking-wider transition-colors">
                Didn't receive a code? Try again
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t-2 border-black text-center">
            <p className="text-xs text-ash flex items-center justify-center space-x-1">
              <FaShieldHalved className="w-3 h-3 text-terra" />
              <span>Your new password will be encrypted</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;