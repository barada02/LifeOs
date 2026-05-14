import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavProvider, useNavigate } from './hooks/useNavigate';
import { LandingPage } from './pages/LandingPage';
import { AuthPage }    from './pages/AuthPage';
import { AppShell }    from './pages/AppShell';

// ── Inner router — reads auth + nav state ─────────────────────────────────────
function Router() {
  const { isAuthenticated } = useAuth();
  const { page, goTo }      = useNavigate();

  // Auto-redirect authenticated users away from landing/auth
  useEffect(() => {
    if (isAuthenticated && (page === 'landing' || page === 'auth')) {
      goTo('app');
    }
    if (!isAuthenticated && page === 'app') {
      goTo('landing');
    }
  }, [isAuthenticated, page, goTo]);

  if (page === 'app' && isAuthenticated) return <AppShell />;
  if (page === 'auth')                   return <AuthPage />;
  return <LandingPage />;
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <NavProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </NavProvider>
  );
}
