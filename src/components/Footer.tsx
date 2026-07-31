import React from 'react';
import { Link } from 'react-router-dom';

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Destinations', to: '/destinations' },
  { label: 'Guides', to: '/guides' },
  { label: 'About', to: '/about' },
  { label: 'Blog', to: '/blog' },
];

const GUIDE_LINKS = [
  { label: 'Become a Guide', to: '/become-a-guide' },
  { label: 'Guide Dashboard', to: '/guide/dashboard' },
  { label: 'Training', to: '/guide/training' },
  { label: 'Earnings', to: '/guide/earnings' },
];

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
  { label: 'Twitter / X', href: 'https://twitter.com', Icon: TwitterIcon },
  { label: 'Facebook', href: 'https://facebook.com', Icon: FacebookIcon },
];

const RAINBOW_COLORS = [
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#06B6D4', // teal
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
];

export default function Footer() {
  const footerStyle: React.CSSProperties = {
    background: '#0F1340',
    color: '#ffffff',
    marginTop: 'auto',
  };

  const rainbowBarStyle: React.CSSProperties = {
    height: '4px',
    background: `linear-gradient(to right, ${RAINBOW_COLORS.join(', ')})`,
    width: '100%',
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '64px 24px 48px',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px 48px',
    marginBottom: '56px',
  };

  const columnHeadingStyle: React.CSSProperties = {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: '1rem',
    color: '#ffffff',
    marginBottom: '20px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  const footerLinkStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.65)',
    textDecoration: 'none',
    marginBottom: '10px',
    transition: 'color 0.2s',
  };

  const taglineStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: '1.65',
    marginTop: '16px',
    maxWidth: '220px',
  };

  const socialRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  };

  const socialBtnStyle: React.CSSProperties = {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.75)',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background 0.2s, color 0.2s, transform 0.2s',
  };

  const contactTextStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.65)',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  };

  const bottomBarStyle: React.CSSProperties = {
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: '24px',
    textAlign: 'center',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.82rem',
    color: 'rgba(255,255,255,0.4)',
  };

  return (
    <footer style={footerStyle}>
      <div style={rainbowBarStyle} aria-hidden="true" />

      <div style={containerStyle}>
        <div style={gridStyle}>
          {/* Column 1: Brand */}
          <div>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <img src="/logo.png" alt="RouteByRoot" height={36} style={{ display: 'block' }} />
              <span style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: '1.15rem',
                color: '#ffffff',
                letterSpacing: '-0.01em',
              }}>
                RouteByRoot
              </span>
            </Link>
            <p style={taglineStyle}>
              Explore the world with local guides who know their roots.
            </p>
            <div style={socialRowStyle} aria-label="Social media links">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={socialBtnStyle}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'var(--orange)';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#ffffff';
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.75)';
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                  }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 style={columnHeadingStyle}>Quick Links</h3>
            <nav aria-label="Footer quick links">
              {QUICK_LINKS.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  style={footerLinkStyle}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--orange)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.65)')}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: For Guides */}
          <div>
            <h3 style={columnHeadingStyle}>For Guides</h3>
            <nav aria-label="Footer guide links">
              {GUIDE_LINKS.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  style={footerLinkStyle}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--teal)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.65)')}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 style={columnHeadingStyle}>Contact</h3>
            <div style={contactTextStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a
                href="mailto:info@routebyroot.com"
                style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--orange)')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.65)')}
              >
                info@routebyroot.com
              </a>
            </div>
            <div style={contactTextStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.45 2 2 0 0 1 3.57 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.5 16z" />
              </svg>
              <a
                href="tel:+12345678900"
                style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--orange)')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.65)')}
              >
                +1 234 567 890
              </a>
            </div>
            <div style={{ marginTop: '4px' }}>
              <p style={{ ...contactTextStyle, marginBottom: '12px', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Follow us
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {SOCIAL_LINKS.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.82rem',
                      color: 'rgba(255,255,255,0.55)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--teal)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)')}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div style={bottomBarStyle}>
          <p style={{ margin: 0 }}>© 2025 RouteByRoot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
