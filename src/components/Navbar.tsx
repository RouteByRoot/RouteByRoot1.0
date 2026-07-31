import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Destinations', to: '/destinations' },
  { label: 'Guides', to: '/guides' },
  { label: 'About', to: '/about' },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const parts = name.trim().split(' ');
      return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0][0].toUpperCase();
    }
    if (email) return email[0].toUpperCase();
    return 'U';
  };

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate('/');
  };

  const navbarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    transition: 'background 0.3s ease, box-shadow 0.3s ease',
    background: scrolled ? '#ffffff' : 'transparent',
    boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.10)' : 'none',
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '68px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  };

  const logoTextStyle: React.CSSProperties = {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: '1.25rem',
    color: scrolled ? 'var(--navy)' : '#ffffff',
    letterSpacing: '-0.02em',
    transition: 'color 0.3s',
  };

  const centerNavStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    justifyContent: 'center',
  };

  const navLinkStyle = (label: string): React.CSSProperties => ({
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '0.95rem',
    color: scrolled ? 'var(--navy)' : '#ffffff',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    position: 'relative',
    transition: 'color 0.2s',
    borderBottom: hoveredLink === label ? '2px solid var(--orange)' : '2px solid transparent',
  });

  const rightStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const signInLinkStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '0.95rem',
    color: scrolled ? 'var(--navy)' : '#ffffff',
    textDecoration: 'none',
    padding: '6px 12px',
    transition: 'opacity 0.2s',
  };

  const getStartedBtnStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#ffffff',
    background: 'var(--orange)',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 20px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 2px 8px rgba(249,115,22,0.35)',
  };

  const avatarStyle: React.CSSProperties = {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--orange), var(--teal))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    border: '2px solid rgba(255,255,255,0.6)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    userSelect: 'none',
    flexShrink: 0,
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
    minWidth: '180px',
    overflow: 'hidden',
    zIndex: 999,
    border: '1px solid rgba(0,0,0,0.06)',
  };

  const dropdownItemStyle: React.CSSProperties = {
    display: 'block',
    padding: '11px 18px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '0.9rem',
    color: 'var(--navy)',
    textDecoration: 'none',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    transition: 'background 0.15s',
  };

  const hamburgerStyle: React.CSSProperties = {
    display: 'none',
    flexDirection: 'column',
    gap: '5px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
  };

  const hamburgerBarStyle: React.CSSProperties = {
    width: '24px',
    height: '2px',
    borderRadius: '2px',
    background: scrolled ? 'var(--navy)' : '#ffffff',
    transition: 'background 0.3s',
  };

  const mobilePanelStyle: React.CSSProperties = {
    position: 'fixed',
    top: '68px',
    left: 0,
    right: 0,
    background: '#ffffff',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    padding: '16px 24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    zIndex: 999,
    transform: mobileOpen ? 'translateY(0)' : 'translateY(-110%)',
    transition: 'transform 0.3s ease',
  };

  const mobileLinkStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '1rem',
    color: 'var(--navy)',
    textDecoration: 'none',
    padding: '10px 0',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    display: 'block',
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .navbar-center { display: none !important; }
          .navbar-hamburger { display: flex !important; }
          .navbar-desktop-right .navbar-signin,
          .navbar-desktop-right .navbar-getstarted { display: none !important; }
        }
        .navbar-dropdown-item:hover { background: var(--gray-50, #f8fafc) !important; }
        .navbar-getstarted:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(249,115,22,0.45) !important; }
      `}</style>

      <nav style={navbarStyle} role="navigation" aria-label="Main navigation">
        <div style={innerStyle}>
          {/* Logo */}
          <Link to="/" style={logoStyle}>
            <img src="/logo.png" alt="RouteByRoot logo" height={40} style={{ display: 'block' }} />
            <span style={logoTextStyle}>RouteByRoot</span>
          </Link>

          {/* Center nav links */}
          <div className="navbar-center" style={centerNavStyle}>
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                style={navLinkStyle(label)}
                onMouseEnter={() => setHoveredLink(label)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="navbar-desktop-right" style={rightStyle}>
            {user ? (
              <div ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div
                  style={avatarStyle}
                  onClick={() => setDropdownOpen(prev => !prev)}
                  role="button"
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  aria-label="User menu"
                >
                  {getInitials(user.name, user.email)}
                </div>
                {dropdownOpen && (
                  <div style={dropdownStyle} role="menu">
                    <div style={{ padding: '12px 18px 8px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <p style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy)' }}>
                        {user.name || user.email}
                      </p>
                      {user.name && (
                        <p style={{ margin: '2px 0 0', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#64748b' }}>
                          {user.email}
                        </p>
                      )}
                    </div>
                    <Link
                      to="/dashboard"
                      style={dropdownItemStyle}
                      className="navbar-dropdown-item"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Dashboard
                    </Link>
                    <button
                      style={dropdownItemStyle}
                      className="navbar-dropdown-item"
                      role="menuitem"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/signin" className="navbar-signin" style={signInLinkStyle}>
                  Sign In
                </Link>
                <Link to="/signup" className="navbar-getstarted" style={getStartedBtnStyle}>
                  Get Started
                </Link>
              </>
            )}

            {/* Hamburger */}
            <button
              className="navbar-hamburger"
              style={hamburgerStyle}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(prev => !prev)}
            >
              <span style={hamburgerBarStyle} />
              <span style={hamburgerBarStyle} />
              <span style={hamburgerBarStyle} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div style={mobilePanelStyle} aria-hidden={!mobileOpen}>
        {NAV_LINKS.map(({ label, to }) => (
          <Link
            key={label}
            to={to}
            style={mobileLinkStyle}
            onClick={() => setMobileOpen(false)}
          >
            {label}
          </Link>
        ))}
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {user ? (
            <>
              <Link
                to="/dashboard"
                style={{ ...mobileLinkStyle, borderBottom: 'none' }}
                onClick={() => setMobileOpen(false)}
              >
                My Dashboard
              </Link>
              <button
                style={{ ...getStartedBtnStyle, justifyContent: 'center', background: '#ef4444' }}
                onClick={() => { setMobileOpen(false); handleSignOut(); }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                style={{ ...mobileLinkStyle, borderBottom: 'none' }}
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                style={{ ...getStartedBtnStyle, justifyContent: 'center' }}
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
