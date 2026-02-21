import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLoginButton } from '../components/Auth/GoogleLoginButton';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { FaLock, FaExclamationTriangle, FaEnvelope, FaKey } from 'react-icons/fa';
import { GOOGLE_CLIENT_ID } from '../utils/constants';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const hasGoogleClientId = !!GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = () => {
    navigate('/dashboard');
  };

  const handleGoogleError = (error: Error) => {
    setError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiService.login(email, password);
      
      if (response.token && response.user) {
        login(response.token, response.user);
        navigate('/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-50 border border-primary-green-50/20 rounded-2xl p-8 shadow-2xl">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-green-50/10 rounded-full mb-4 border border-primary-green-50/30">
              <FaLock className="text-primary-green-50 text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">TikTok Live Assistant</h1>
            <p className="text-gray-400">Đăng nhập để tiếp tục</p>
          </div>

          {/* Configuration Warning */}
          {!hasGoogleClientId && (
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-yellow-400 text-xl flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-yellow-400 font-semibold mb-2">Cấu hình chưa hoàn tất</h3>
                  <p className="text-yellow-300 text-sm mb-2">
                    Google OAuth Client ID chưa được cấu hình. Vui lòng tạo file <code className="bg-black/30 px-1.5 py-0.5 rounded">.env</code> trong thư mục frontend với:
                  </p>
                  <pre className="bg-black/30 p-2 rounded text-xs text-yellow-200 overflow-x-auto mb-2">
{`VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-client-id-here`}
                  </pre>
                  <p className="text-yellow-300/80 text-xs">
                    Xem <code className="bg-black/30 px-1.5 py-0.5 rounded">docs/installation.md</code> để biết thêm chi tiết.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Email/Password Login Form */}
          <form onSubmit={handleEmailLogin} className="mb-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2 bg-dark-100 border border-primary-green-50/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-green-50/50 focus:border-primary-green-50/50"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaKey className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2 bg-dark-100 border border-primary-green-50/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-green-50/50 focus:border-primary-green-50/50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary-green-50 text-black rounded-lg font-medium hover:bg-primary-green-200 transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <FaLock />
                    <span>Đăng nhập</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          {hasGoogleClientId && (
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-50 text-gray-400">hoặc</span>
              </div>
            </div>
          )}

          {/* Google Login Button */}
          {hasGoogleClientId && (
            <div className="mb-6">
              <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
            </div>
          )}

          {/* Info */}
          <div className="text-center text-sm text-gray-500">
            <p>Bằng cách đăng nhập, bạn đồng ý với các điều khoản sử dụng của chúng tôi.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>© 2026 thiết kế và phát triển bởi tranbaloc.io.vn.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
