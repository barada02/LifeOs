import { useNavigate } from '../hooks/useNavigate';

export function LandingPage() {
  const { goTo } = useNavigate();

  const features = [
    { icon: '✓', title: 'Smart Task Management', desc: 'Prioritize, track, and complete tasks with full CRUD — always in sync with your backend.' },
    { icon: '📝', title: 'Rich Notes', desc: 'Capture ideas with tags and full-text search. Your knowledge base, always at your fingertips.' },
    { icon: '🤖', title: 'AI Assistant', desc: 'Powered by UniMCP — your personal AI agent with direct access to your data.' },
    { icon: '🔒', title: 'Secure by Default', desc: 'JWT authentication, per-user data isolation, and encrypted storage.' },
  ];

  return (
    <div className="landing">
      {/* Background */}
      <div className="landing-bg" aria-hidden="true">
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
        <div className="landing-grid" />
      </div>

      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <span className="landing-nav-icon">⬡</span>
          <span className="landing-nav-name">Life OS</span>
        </div>
        <div className="landing-nav-actions">
          <button id="landing-login-btn" className="landing-nav-login" onClick={() => goTo('auth')}>
            Sign In
          </button>
          <button id="landing-cta-nav-btn" className="landing-nav-cta" onClick={() => goTo('auth')}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          <span className="landing-hero-badge-dot" />
          Now with AI • Powered by UniMCP
        </div>

        <h1 className="landing-hero-title">
          Your life,<br />
          <span className="landing-hero-gradient">intelligently organized.</span>
        </h1>

        <p className="landing-hero-subtitle">
          Life OS is a personal productivity platform that combines task management,
          note-taking, and an AI assistant that <em>actually has access to your data</em>.
        </p>

        <div className="landing-hero-actions">
          <button id="landing-hero-cta-btn" className="landing-btn-primary" onClick={() => goTo('auth')}>
            Start for free →
          </button>
          <button id="landing-hero-demo-btn" className="landing-btn-ghost" onClick={() => goTo('auth')}>
            See the app
          </button>
        </div>

        {/* Stats */}
        <div className="landing-stats">
          {[
            { val: '∞', label: 'Tasks & Notes' },
            { val: 'AI', label: 'Powered Agent' },
            { val: '0ms', label: 'Latency target' },
          ].map(s => (
            <div key={s.label} className="landing-stat">
              <span className="landing-stat-val">{s.val}</span>
              <span className="landing-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <h2 className="landing-section-title">Everything you need</h2>
        <p className="landing-section-subtitle">
          Built with a clean API-first architecture — FastAPI backend, React frontend, UniMCP AI.
        </p>
        <div className="landing-features-grid">
          {features.map(f => (
            <div key={f.title} className="landing-feature-card">
              <div className="landing-feature-icon">{f.icon}</div>
              <h3 className="landing-feature-title">{f.title}</h3>
              <p className="landing-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-final-cta">
        <h2>Ready to reclaim your focus?</h2>
        <p>Join Life OS and let AI handle the organization while you do the thinking.</p>
        <button id="landing-bottom-cta-btn" className="landing-btn-primary landing-btn-lg" onClick={() => goTo('auth')}>
          Create your account
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span>© 2025 Life OS</span>
        <span>Built with FastAPI · React · UniMCP</span>
      </footer>
    </div>
  );
}
