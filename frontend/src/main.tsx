import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './style.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { GOOGLE_CLIENT_ID } from './utils/constants.ts'

// Check if Google Client ID is configured
if (!GOOGLE_CLIENT_ID) {
  console.warn('⚠️ VITE_GOOGLE_CLIENT_ID is not set. Please create a .env file with your Google OAuth Client ID.');
}

const AppWrapper = () => {
  // Always render the app, but conditionally wrap with GoogleOAuthProvider
  if (!GOOGLE_CLIENT_ID) {
    // Render without GoogleOAuthProvider - Login page will show warning
    return (
      <AuthProvider>
        <App />
      </AuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppWrapper />
    </ErrorBoundary>
  </StrictMode>,
)
