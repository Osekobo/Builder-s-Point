import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getPostLoginPath } from '../utils/auth';
import { FaEnvelope, FaLock, FaArrowRightToBracket, FaShieldHalved } from 'react-icons/fa6';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate(getPostLoginPath(result.user, location.state?.from), {
        replace: true,
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-warm flex items-center justify-center py-6 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FaShieldHalved className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl font-bold text-black uppercase tracking-tight">Welcome Back</h1>
          <p className="text-ash mt-2">Sign in to your account</p>
          <div className="brick-line mx-auto mt-4"></div>
        </div>

        <div className="bg-white border-4 border-black shadow-hard-lg p-8">
          <h2 className="font-h text-2xl font-bold text-black text-center mb-6 uppercase">
            Login
          </h2>

          {errorMessage && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 mb-4">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
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
                  className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 h-5 text-ash" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="text-right mb-6">
              <Link 
                to="/forgot-password" 
                className="text-sm text-terra hover:text-terra-dark font-semibold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-terra text-white py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <FaArrowRightToBracket className="w-5 h-5" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-ash">
              Don't have an account?{' '}
              <Link to="/register" className="text-terra hover:text-terra-dark font-bold uppercase tracking-wider transition-colors">
                Register
              </Link>
            </p>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-black"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-ash">Secure Login</span>
            </div>
          </div>

          <div className="text-center text-xs text-ash">
            <p>✓ 100% Secure Login</p>
            <p className="mt-1">✓ Protected by M-Pesa security standards</p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-ash">
            Having trouble?{' '}
            <a href="https://wa.me/254714391137" className="text-terra hover:text-terra-dark font-semibold">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;