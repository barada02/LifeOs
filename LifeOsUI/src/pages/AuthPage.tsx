import { useState } from 'react';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

type Mode = 'login' | 'signup';

export function AuthPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = mode === 'signup'
        ? await authApi.signup(name, email, password)
        : await authApi.login(email, password);
      login(res.access_token, res.user);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-grid" />
      </div>

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">⬡</div>
          <span className="auth-logo-text">Life OS</span>
        </div>

        <h1 className="auth-title">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Sign in to your personal productivity OS'
            : 'Start organizing your life intelligently'}
        </p>

        {error && (
          <div className="auth-error" role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="auth-field">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Alex Johnson"
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="alex@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <span className="auth-spinner" aria-label="Loading" />
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          {' '}
          <button
            type="button"
            className="auth-switch-btn"
            onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); }}
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
