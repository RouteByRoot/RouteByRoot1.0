import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// ─── Decorative rainbow stripe block ─────────────────────────────────────────
function RainbowStripes() {
  const colors = ['#8B21A8', '#E91E8C', '#E53935', '#F97316', '#FFC107', '#22C55E', '#06B6D4'];
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {colors.map((c, i) => (
        <div
          key={i}
          style={{ width: 6, height: 80, background: c, borderRadius: 4, opacity: 0.8 }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SignInPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await signIn(email, password);
    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    // Determine role from mock user for correct redirect
    const mockUserStr = localStorage.getItem('routebyroot_mock_user');
    let role = 'traveler';
    if (mockUserStr) {
      try {
        const mockUser = JSON.parse(mockUserStr);
        role = mockUser.role || 'traveler';
      } catch (e) { /* ignore */ }
    }

    // Route to the correct panel based on role
    if (role === 'guide') {
      navigate('/guide/dashboard');
    } else if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>

      {/* ──────────────────────────────────────────────
          LEFT PANEL  (hidden on mobile)
      ────────────────────────────────────────────── */}
      <div style={{
        width: '40%',
        background: 'linear-gradient(155deg, #187E80 0%, #22A3A6 40%, #2BBCBF 75%, #59DFE2 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 44px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
        className="sign-left-panel"
      >
        {/* Background orbs */}
        <div style={{ position:'absolute', top:'-100px', right:'-100px', width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,33,168,0.25) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-80px', left:'-80px', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)', pointerEvents:'none' }} />

        {/* Logo */}
        <div style={{ position:'relative', zIndex:2 }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:12 }}>
            <img
              src="/logo.png"
              alt="RouteByRoot"
              style={{ height: 44, width: 'auto', objectFit: 'contain' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.35rem', color: '#fff' }}>
              RouteByRoot
            </span>
          </Link>
        </div>

        {/* Quote block */}
        <div style={{ position:'relative', zIndex:2, flex: 1, display:'flex', flexDirection:'column', justifyContent:'center', gap:28 }}>
          {/* Rainbow accent */}
          <RainbowStripes />

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)',
            color: '#FFFFFF',
            lineHeight: 1.2,
            fontWeight: 800,
          }}>
            Your next adventure<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--orange), var(--pink))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              starts here.
            </span>
          </h2>

          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 320 }}>
            Sign in to connect with local guides, discover hidden gems, and plan the journey of a lifetime.
          </p>

          {/* Stat pills */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {[
              { label: '500+ Guides', color: 'var(--teal)' },
              { label: '80+ Countries', color: 'var(--purple)' },
              { label: '10K+ Travelers', color: 'var(--orange)' },
            ].map(s => (
              <span key={s.label} style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255,255,255,0.10)',
                border: `1px solid ${s.color}55`,
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 600,
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.04em',
              }}>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom stripe bar */}
        <div style={{ position:'relative', zIndex:2 }}>
          <div className="stripe-bar" />
          <p style={{ marginTop: 16, color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
            © 2026 RouteByRoot — Explore with one of your own.
          </p>
        </div>
      </div>

      {/* ──────────────────────────────────────────────
          RIGHT PANEL — Form
      ────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Mobile logo (shown when left panel is hidden) */}
          <div className="sign-mobile-logo" style={{ textAlign:'center', marginBottom: 32, display:'none' }}>
            <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, justifyContent:'center' }}>
              <img src="/logo.png" alt="RouteByRoot" style={{ height:36 }} onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
              <span style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.3rem', color:'#2BBCBF' }}>RouteByRoot</span>
            </Link>
          </div>

          {/* Back to Home Button */}
          <div style={{ marginBottom: 24 }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--gray-500)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'color 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#2BBCBF')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--gray-500)')}
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#2BBCBF', marginBottom: 8 }}>
              Welcome back 👋
            </h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem' }}>
              Sign in to your RouteByRoot account
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#DC2626',
              fontSize: '0.9rem',
            }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚠️</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="signin-email">Email address</label>
              <input
                id="signin-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="signin-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="signin-password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--gray-400)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#2BBCBF')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--gray-400)')}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: 4 }}>
                <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: '#2BBCBF', fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="signin-submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: 8,
                background: loading
                  ? 'var(--gray-300)'
                  : '#2BBCBF',
                cursor: loading ? 'not-allowed' : 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span className="spinner" style={{ width:20, height:20, borderWidth:2 }} />
                  Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:16, margin:'32px 0' }}>
            <div className="divider" style={{ flex:1, margin:0 }} />
            <span style={{ color:'var(--gray-400)', fontSize:'0.82rem', whiteSpace:'nowrap' }}>New to RouteByRoot?</span>
            <div className="divider" style={{ flex:1, margin:0 }} />
          </div>

          {/* Sign up link */}
          <Link
            to="/signup"
            className="btn btn-outline btn-lg"
            style={{ width:'100%', justifyContent:'center', display:'flex' }}
          >
            Create an account
          </Link>
        </div>
      </div>

      {/* Responsive: hide left panel on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .sign-left-panel { display: none !important; }
          .sign-mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
}
