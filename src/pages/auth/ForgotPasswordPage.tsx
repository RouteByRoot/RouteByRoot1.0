import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/signin`,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage('Password reset link has been sent to your email.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-container" style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Left decorative panel */}
      <div className="sign-left-panel" style={{
        flex: 1.2,
        background: '#2BBCBF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative elements matching signup/signin pages */}
        <div style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: -150,
          left: -50,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          filter: 'blur(60px)'
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 480 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: 64 }}>
            <img src="/logo.png" alt="RouteByRoot" style={{ height: 44, filter: 'brightness(0) invert(1)' }} />
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.6rem',
              color: '#fff',
              letterSpacing: '-0.5px'
            }}>RouteByRoot</span>
          </Link>
          
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2.8rem',
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: 24,
            letterSpacing: '-1px'
          }}>
            Retrieve your path. 🧭
          </h2>
          <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
            Don't worry! Enter your registered email address and we'll send you instructions to reset your password.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="sign-right-panel" style={{
        flex: 1,
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Logo on Mobile */}
          <div className="sign-mobile-logo" style={{ textAlign: 'center', marginBottom: 32, display: 'none' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
              <img src="/logo.png" alt="RouteByRoot" style={{ height: 36 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.3rem', color: '#2BBCBF' }}>RouteByRoot</span>
            </Link>
          </div>

          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#2BBCBF', marginBottom: 8 }}>
              Forgot Password
            </h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem' }}>
              Enter your email to receive password reset links
            </p>
          </div>

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

          {message ? (
            <div style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              marginBottom: 24,
              textAlign: 'center',
            }}>
              <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--gray-700)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                {message}
              </p>
              <Link to="/signin" className="btn btn-primary" style={{ width: '100%', marginTop: 24, background: '#2BBCBF', justifyContent: 'center' }}>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="forgot-email"
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    style={{ paddingRight: 40 }}
                  />
                  <Mail size={18} color="var(--gray-400)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: loading ? 'var(--gray-300)' : '#2BBCBF',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Sending instruction...' : 'Send Reset Link'}
              </button>

              <Link to="/signin" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                color: 'var(--gray-500)',
                fontSize: '0.9rem',
                textDecoration: 'none',
                marginTop: 8
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#2BBCBF')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--gray-500)')}
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sign-left-panel { display: none !important; }
          .sign-mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;
