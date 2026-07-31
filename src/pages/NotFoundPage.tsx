import React from 'react';
import { Link } from 'react-router-dom';

const RAINBOW_COLORS = [
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#06B6D4',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
];

export default function NotFoundPage() {
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--gray-50, #F8FAFC)',
    padding: '24px',
    textAlign: 'center',
  };

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'notfound-fadein 0.5s ease both',
  };

  const bigNumberStyle: React.CSSProperties = {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 800,
    fontSize: 'clamp(7rem, 18vw, 11rem)',
    color: 'var(--navy, #1A1F5E)',
    lineHeight: 1,
    letterSpacing: '-0.04em',
    margin: 0,
    userSelect: 'none',
  };

  const rainbowBarStyle: React.CSSProperties = {
    height: '5px',
    borderRadius: '4px',
    background: `linear-gradient(to right, ${RAINBOW_COLORS.join(', ')})`,
    width: '100%',
    marginTop: '8px',
    marginBottom: '36px',
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
    color: 'var(--navy, #1A1F5E)',
    margin: '0 0 16px',
  };

  const descStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: '1rem',
    color: '#64748b',
    maxWidth: '400px',
    lineHeight: 1.7,
    margin: '0 auto 36px',
  };

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: '1rem',
    color: '#ffffff',
    background: 'var(--orange, #F97316)',
    textDecoration: 'none',
    padding: '13px 32px',
    borderRadius: '10px',
    boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  };

  return (
    <>
      <style>{`
        @keyframes notfound-fadein {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .notfound-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(249,115,22,0.45) !important;
        }
      `}</style>

      <main style={pageStyle} aria-labelledby="notfound-heading">
        <div style={cardStyle}>
          {/* Large 404 */}
          <p style={bigNumberStyle} aria-label="Error 404">404</p>

          {/* Rainbow stripe */}
          <div style={rainbowBarStyle} aria-hidden="true" />

          {/* Heading */}
          <h1 id="notfound-heading" style={headingStyle}>
            Page Not Found
          </h1>

          {/* Description */}
          <p style={descStyle}>
            Looks like this route has gone off the map! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* CTA */}
          <Link to="/" className="notfound-btn" style={btnStyle} id="notfound-home-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Go Home
          </Link>
        </div>
      </main>
    </>
  );
}
