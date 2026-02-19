import { useGoogleLogin } from '@react-oauth/google';
import { apiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { FcGoogle } from 'react-icons/fc';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const GoogleLoginButton = ({ onSuccess, onError }: GoogleLoginButtonProps) => {
  const { login } = useAuth();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user info from Google using access_token
        const googleUserInfo = await fetch(
          'https://www.googleapis.com/oauth2/v2/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        ).then((res) => res.json());

        // Send access_token to backend for verification
        // Backend should verify the token and return JWT + user info
        const response = await apiService.loginWithGoogle(tokenResponse.access_token);
        
        // Backend trả về JWT token và user info
        if (response.token && response.user) {
          login(response.token, response.user);
          onSuccess?.();
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Google login error:', error);
        onError?.(error as Error);
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      onError?.(error as Error);
    },
  });

  return (
    <button
      onClick={() => handleGoogleLogin()}
      className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl"
    >
      <FcGoogle className="text-2xl" />
      <span>Đăng nhập bằng Google</span>
    </button>
  );
};
