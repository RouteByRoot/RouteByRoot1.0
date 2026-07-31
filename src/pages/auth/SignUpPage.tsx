import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
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

export default function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<'traveler' | 'guide'>('traveler');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await signUp(email, password, name, role);
    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    // After successful sign up, redirect to dashboard.
    // If they signed up as traveler -> /dashboard, guide -> /guide/dashboard.
    // The App.tsx router or ProtectedRoute handles redirection, but let's go directly to /dashboard and let ProtectedRoute handle it,
    // or navigate directly based on role:
    if (role === 'guide') {
      navigate('/guide/dashboard');
    } else {
      // Redirect traveler to homepage after signup
      navigate('/');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>

      {/* ──────────────────────────────────────────────
          LEFT PANEL  (hidden on mobile)
      ────────────────────────────────────────────── */}
      <div style={{
        width: '40%',
        background: 'linear-gradient(155deg, #0F1340 0%, #1A1F5E 40%, #252C7A 75%, #3730A3 100%)',
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
          <RainbowStripes />

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)',
            color: '#FFFFFF',
            lineHeight: 1.2,
            fontWeight: 800,
          }}>
            Explore the world<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--teal), var(--green))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              with local roots.
            </span>
          </h2>

          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 320 }}>
            Join thousands of travelers finding authentic, local-led journeys or share your own roots as a verified guide.
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

          {/* Mobile logo */}
          <div className="sign-mobile-logo" style={{ textAlign:'center', marginBottom: 32, display:'none' }}>
            <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, justifyContent:'center' }}>
              <img src="/logo.png" alt="RouteByRoot" style={{ height:36 }} onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
              <span style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.3rem', color:'#2BBCBF' }}>RouteByRoot</span>
            </Link>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 30 }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#2BBCBF', marginBottom: 8 }}>
              Create Account ✨
            </h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem' }}>
              Join RouteByRoot and start your journey
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

            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
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
              <label className="form-label" htmlFor="signup-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="signup-password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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
                  }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Role selection buttons */}
            <div className="form-group">
              <label className="form-label">I am registering as a:</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setRole('traveler')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-lg)',
                    border: role === 'traveler' ? '2px solid #2BBCBF' : '1px solid var(--gray-300)',
                    background: role === 'traveler' ? '#2BBCBF' : '#fff',
                    color: role === 'traveler' ? '#fff' : '#2BBCBF',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  🎒 Traveler
                </button>
                <button
                  type="button"
                  onClick={() => setRole('guide')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-lg)',
                    border: role === 'guide' ? '2px solid #2BBCBF' : '1px solid var(--gray-300)',
                    background: role === 'guide' ? '#2BBCBF' : '#fff',
                    color: role === 'guide' ? '#fff' : '#2BBCBF',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  🧭 Local Guide
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="signup-submit"
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
              }}
            >
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span className="spinner" style={{ width:20, height:20, borderWidth:2 }} />
                  Creating account…
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:16, margin:'32px 0' }}>
            <div className="divider" style={{ flex:1, margin:0 }} />
            <span style={{ color:'var(--gray-400)', fontSize:'0.82rem', whiteSpace:'nowrap' }}>Already have an account?</span>
            <div className="divider" style={{ flex:1, margin:0 }} />
          </div>

          {/* Sign in link */}
          <Link
            to="/signin"
            className="btn btn-outline btn-lg"
            style={{ width:'100%', justifyContent:'center', display:'flex' }}
          >
            Sign In
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
