import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertTriangle, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError || 'Invalid credentials. Please try again.');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Dot pattern overlay */}
      <div style={styles.dotPattern} />

      {/* Floating orbs */}
      <div style={{ ...styles.orb, ...styles.orb1 }} />
      <div style={{ ...styles.orb, ...styles.orb2 }} />

      {/* Card */}
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrapper}>
          <img src="/logo.png" alt="RouteByRoot" style={styles.logo} />
        </div>

        {/* Title */}
        <h1 style={styles.title}>Admin Portal</h1>
        <p style={styles.subtitle}>Secure access for administrators only</p>

        {/* Restricted Access Badge */}
        <div style={styles.restrictedBadge}>
          <AlertTriangle size={14} color="#ef4444" />
          <span style={styles.restrictedText}>Restricted Access</span>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            <AlertTriangle size={16} color="#ef4444" />
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@routebyroot.com"
                required
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2BBCBF';
                  e.target.style.boxShadow = '0 0 0 3px rgba(43,187,191,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#334155';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ ...styles.input, paddingRight: '48px' }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2BBCBF';
                  e.target.style.boxShadow = '0 0 0 3px rgba(43,187,191,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#334155';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 8px 25px rgba(43,187,191,0.4)';
              }
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 4px 15px rgba(43,187,191,0.3)';
            }}
          >
            {loading ? (
              <span style={styles.loadingContent}>
                <span style={styles.spinner} />
                Signing In...
              </span>
            ) : (
              <span style={styles.btnContent}>
                <Shield size={18} />
                Sign In to Admin
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p style={styles.footer}>
          RouteByRoot © {new Date().getFullYear()} · Admin Portal v2.0
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@400;500&display=swap');
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 20px) scale(1.05); }
        }
      `}</style>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#2BBCBF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  dotPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
    backgroundSize: '28px 28px',
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    pointerEvents: 'none',
  },
  orb1: {
    width: '350px',
    height: '350px',
    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
    top: '-100px',
    right: '-50px',
    animation: 'orb1 8s ease-in-out infinite',
  },
  orb2: {
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
    bottom: '-80px',
    left: '-60px',
    animation: 'orb2 10s ease-in-out infinite',
  },
  card: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '20px',
    padding: '40px 36px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.02)',
    animation: 'fadeIn 0.5s ease-out',
  },
  logoWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  logo: {
    height: '80px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 4px 12px rgba(43,187,191,0.2))',
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '26px',
    fontWeight: 700,
    color: '#1e293b',
    textAlign: 'center',
    margin: '0 0 4px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    textAlign: 'center',
    margin: '0 0 20px 0',
  },
  restrictedBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    backgroundColor: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    padding: '8px 16px',
    marginBottom: '24px',
  },
  restrictedText: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#ef4444',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '10px',
    padding: '12px 14px',
    marginBottom: '20px',
  },
  errorText: {
    fontSize: '13px',
    color: '#fca5a5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#475569',
    letterSpacing: '0.3px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none',
    zIndex: 1,
  },
  input: {
    width: '100%',
    backgroundColor: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '12px 14px 12px 44px',
    color: '#1e293b',
    fontSize: '15px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    zIndex: 1,
  },
  submitBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #2BBCBF, #229ea1)',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: "'Outfit', sans-serif",
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 15px rgba(43,187,191,0.3)',
    marginTop: '4px',
  },
  btnContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
  footer: {
    fontSize: '12px',
    color: '#475569',
    textAlign: 'center',
    marginTop: '24px',
    marginBottom: 0,
  },
};

export default AdminLogin;
