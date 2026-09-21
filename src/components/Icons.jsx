import React from 'react';

// Brand Logo
export function BrandLogoIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="10" fill="var(--text)" />
      <path d="M16 6L24.6603 11V21L16 26L7.33975 21V11L16 6Z" stroke="var(--bg)" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="3.5" fill="var(--coral)" />
      <line x1="16" y1="9.5" x2="16" y2="12.5" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="19.5" x2="16" y2="22.5" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" />
      <line x1="10.5" y1="13" x2="13" y2="14.5" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="17.5" x2="21.5" y2="19" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Category Icons
export function CategoryIcon({ name, size = 16, className = '' }) {
  switch (name) {
    case 'all':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'math':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <line x1="5" y1="9" x2="19" y2="9" />
          <line x1="12" y1="2" x2="12" y2="16" />
          <line x1="5" y1="19" x2="19" y2="19" />
        </svg>
      );
    case 'logical':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="18" r="3" />
          <path d="M8.5 8.5L15.5 15.5" />
          <circle cx="18" cy="6" r="2.5" />
          <path d="M8.5 6H15.5" />
        </svg>
      );
    case 'verbal':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="9" y1="7" x2="15" y2="7" />
          <line x1="9" y1="11" x2="13" y2="11" />
        </svg>
      );
    case 'series':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 3v18h18" />
          <path d="M19 9l-5 5-4-4-3 3" />
        </svg>
      );
    case 'spatial':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    default:
      return null;
  }
}

// Difficulty Signal Bars Icon
export function DifficultyBars({ level, size = 16, className = '' }) {
  const bars = level === 'easy' ? 1 : level === 'medium' ? 2 : 3;
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="currentColor" className={className}>
      <rect x="2" y="11" width="3.5" height="5" rx="1" opacity={bars >= 1 ? 1 : 0.25} />
      <rect x="7.5" y="7" width="3.5" height="9" rx="1" opacity={bars >= 2 ? 1 : 0.25} />
      <rect x="13" y="3" width="3.5" height="13" rx="1" opacity={bars >= 3 ? 1 : 0.25} />
    </svg>
  );
}

// Sun & Moon Theme Icons
export function SunIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export function MoonIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// Trophy / Record Icon
export function TrophyIcon({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34" />
      <path d="M18 4H6v7a6 6 0 0 0 12 0V4z" />
    </svg>
  );
}

// Arrow Right Action Icon
export function ArrowRightIcon({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
