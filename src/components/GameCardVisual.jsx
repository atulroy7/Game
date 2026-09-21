import React from 'react';

export default function GameCardVisual({ gameId, accent = 'var(--coral)', soft = 'var(--coral-soft)' }) {
  switch (gameId) {
    case 'quiz':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg anim-float" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background Grid Lines */}
            <line x1="20" y1="65" x2="260" y2="65" stroke={accent} strokeOpacity="0.12" strokeDasharray="3 3" />
            <line x1="140" y1="15" x2="140" y2="115" stroke={accent} strokeOpacity="0.12" strokeDasharray="3 3" />

            {/* Neural Connections */}
            <path d="M70 75L140 35L210 75L140 105Z" stroke={accent} strokeWidth="1.5" strokeDasharray="4 2" />
            <path d="M140 35V105" stroke={accent} strokeWidth="2" />
            <path d="M70 75H210" stroke={accent} strokeWidth="2" />
            <line x1="105" y1="55" x2="175" y2="90" stroke={accent} strokeWidth="1.2" strokeOpacity="0.5" />
            <line x1="105" y1="90" x2="175" y2="55" stroke={accent} strokeWidth="1.2" strokeOpacity="0.5" />

            {/* Glowing IQ Nodes */}
            <circle cx="140" cy="35" r="7" fill="var(--surface)" stroke={accent} strokeWidth="2.5" />
            <circle cx="140" cy="35" r="3" fill={accent} />

            <circle cx="70" cy="75" r="6" fill="var(--surface)" stroke={accent} strokeWidth="2" />
            <circle cx="70" cy="75" r="2.5" fill={accent} />

            <circle cx="210" cy="75" r="6" fill="var(--surface)" stroke={accent} strokeWidth="2" />
            <circle cx="210" cy="75" r="2.5" fill={accent} />

            <circle cx="140" cy="105" r="7" fill="var(--surface)" stroke={accent} strokeWidth="2.5" />
            <circle cx="140" cy="105" r="3" fill={accent} />

            {/* Center Cognitive Core */}
            <circle cx="140" cy="70" r="14" fill={accent} fillOpacity="0.15" />
            <circle cx="140" cy="70" r="8" fill={accent} />
            <circle cx="140" cy="70" r="3.5" fill="var(--surface)" />
          </svg>
        </div>
      );

    case 'scramble5':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 5 Wordle-style feedback tiles */}
            <g transform="translate(30, 42)">
              {/* Tile 1: Green exact */}
              <rect x="0" y="0" width="40" height="46" rx="8" fill="var(--mint)" />
              <text x="20" y="30" fill="#fff" fontSize="20" fontWeight="900" textAnchor="middle" fontFamily="Outfit, sans-serif">S</text>

              {/* Tile 2: Amber misplaced */}
              <rect x="46" y="0" width="40" height="46" rx="8" fill="var(--amber)" />
              <text x="66" y="30" fill="#fff" fontSize="20" fontWeight="900" textAnchor="middle" fontFamily="Outfit, sans-serif">H</text>

              {/* Tile 3: Neutral */}
              <rect x="92" y="0" width="40" height="46" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
              <text x="112" y="30" fill="var(--text)" fontSize="20" fontWeight="900" textAnchor="middle" fontFamily="Outfit, sans-serif">A</text>

              {/* Tile 4: Green exact */}
              <rect x="138" y="0" width="40" height="46" rx="8" fill="var(--mint)" />
              <text x="158" y="30" fill="#fff" fontSize="20" fontWeight="900" textAnchor="middle" fontFamily="Outfit, sans-serif">R</text>

              {/* Tile 5: Misplaced */}
              <rect x="184" y="0" width="40" height="46" rx="8" fill="var(--coral)" />
              <text x="204" y="30" fill="#fff" fontSize="20" fontWeight="900" textAnchor="middle" fontFamily="Outfit, sans-serif">P</text>
            </g>

            {/* Attempt Dots Counter */}
            <circle cx="112" cy="108" r="3" fill="var(--mint)" />
            <circle cx="126" cy="108" r="3" fill="var(--amber)" />
            <circle cx="140" cy="108" r="3" fill={accent} />
            <circle cx="154" cy="108" r="3" fill="var(--border)" />
            <circle cx="168" cy="108" r="3" fill="var(--border)" />
          </svg>
        </div>
      );

    case 'chronoBeat':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Precision Radial Stopwatch Ring */}
            <circle cx="140" cy="65" r="44" stroke={accent} strokeWidth="2.5" strokeOpacity="0.25" strokeDasharray="4 4" />
            <circle cx="140" cy="65" r="36" fill="var(--surface)" stroke={accent} strokeWidth="2" />

            {/* Stopwatch Ticks */}
            <line x1="140" y1="33" x2="140" y2="38" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="140" y1="92" x2="140" y2="97" stroke={accent} strokeWidth="2" strokeLinecap="round" />
            <line x1="108" y1="65" x2="113" y2="65" stroke={accent} strokeWidth="2" strokeLinecap="round" />
            <line x1="167" y1="65" x2="172" y2="65" stroke={accent} strokeWidth="2" strokeLinecap="round" />

            {/* Rotating Stopwatch Needle */}
            <g className="anim-spin-needle" style={{ transformOrigin: '140px 65px' }}>
              <line x1="140" y1="65" x2="140" y2="40" stroke={accent} strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* Crown button */}
            <rect x="136" y="22" width="8" height="5" rx="2" fill={accent} />
            <circle cx="140" cy="65" r="5" fill={accent} />

            {/* Millisecond readout */}
            <rect x="110" y="106" width="60" height="16" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
            <text x="140" y="118" fill="var(--text)" fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="JetBrains Mono, monospace">01.000s</text>
          </svg>
        </div>
      );

    case 'arrowClash':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Center Vortex Compass */}
            <circle cx="140" cy="65" r="42" stroke={accent} strokeWidth="1.5" strokeOpacity="0.2" />
            <circle cx="140" cy="65" r="28" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />

            {/* 4 Directions */}
            {/* UP */}
            <path className="anim-arrow-up" d="M140 22L147 32H133L140 22Z" fill={accent} />
            {/* DOWN */}
            <path className="anim-arrow-down" d="M140 108L147 98H133L140 108Z" fill={accent} />
            {/* LEFT */}
            <path className="anim-arrow-left" d="M97 65L107 58V72L97 65Z" fill={accent} />
            {/* RIGHT */}
            <path className="anim-arrow-right" d="M183 65L173 58V72L183 65Z" fill={accent} />

            {/* Center Inversion Badge */}
            <circle cx="140" cy="65" r="14" fill={accent} />
            <path d="M135 63L140 58L145 63M145 67L140 72L135 67" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );

    case 'reflexStrike':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Sonar / Radar Concentric Rings */}
            <circle cx="140" cy="65" r="48" stroke={accent} strokeWidth="1" strokeOpacity="0.2" />
            <circle className="anim-pulse-target" cx="140" cy="65" r="34" stroke={accent} strokeWidth="2" strokeOpacity="0.6" strokeDasharray="6 3" />
            <circle cx="140" cy="65" r="20" fill="var(--surface)" stroke={accent} strokeWidth="2" />

            {/* Crosshairs */}
            <line x1="84" y1="65" x2="120" y2="65" stroke={accent} strokeWidth="2" strokeLinecap="round" />
            <line x1="160" y1="65" x2="196" y2="65" stroke={accent} strokeWidth="2" strokeLinecap="round" />
            <line x1="140" y1="9" x2="140" y2="45" stroke={accent} strokeWidth="2" strokeLinecap="round" />
            <line x1="140" y1="85" x2="140" y2="121" stroke={accent} strokeWidth="2" strokeLinecap="round" />

            {/* Bulls Eye Strike Core */}
            <circle cx="140" cy="65" r="8" fill={accent} />
            <circle cx="140" cy="65" r="3" fill="#fff" />

            {/* Target Brackets */}
            <path d="M126 51H122V55" stroke={accent} strokeWidth="2" strokeLinecap="round" />
            <path d="M154 51H158V55" stroke={accent} strokeWidth="2" strokeLinecap="round" />
            <path d="M126 79H122V75" stroke={accent} strokeWidth="2" strokeLinecap="round" />
            <path d="M154 79H158V75" stroke={accent} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'wordScramble':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Orbital path */}
            <ellipse cx="140" cy="65" rx="85" ry="32" stroke={accent} strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="5 5" />

            {/* Floating Letter Cubes */}
            <g transform="translate(60, 42)" className="anim-float">
              <rect width="32" height="36" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
              <text x="16" y="24" fill="var(--text)" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="Outfit, sans-serif">W</text>
            </g>

            <g transform="translate(105, 30)" className="anim-float" style={{ animationDelay: '0.2s' }}>
              <rect width="34" height="38" rx="8" fill={accent} />
              <text x="17" y="25" fill="#fff" fontSize="18" fontWeight="900" textAnchor="middle" fontFamily="Outfit, sans-serif">O</text>
            </g>

            <g transform="translate(150, 48)" className="anim-float" style={{ animationDelay: '0.4s' }}>
              <rect width="32" height="36" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
              <text x="16" y="24" fill="var(--text)" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="Outfit, sans-serif">R</text>
            </g>

            <g transform="translate(195, 34)" className="anim-float" style={{ animationDelay: '0.6s' }}>
              <rect width="32" height="36" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
              <text x="16" y="24" fill="var(--text)" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="Outfit, sans-serif">D</text>
            </g>
          </svg>
        </div>
      );

    case 'sumDrop':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Number cascade matrix */}
            <g transform="translate(70, 32)">
              <rect x="0" y="0" width="30" height="30" rx="6" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="15" y="20" fill="var(--text)" fontSize="14" fontWeight="800" textAnchor="middle">7</text>

              <rect x="36" y="0" width="30" height="30" rx="6" fill={accent} />
              <text x="51" y="20" fill="#fff" fontSize="14" fontWeight="800" textAnchor="middle">8</text>

              <rect x="72" y="0" width="30" height="30" rx="6" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="87" y="20" fill="var(--text)" fontSize="14" fontWeight="800" textAnchor="middle">3</text>

              <rect x="108" y="0" width="30" height="30" rx="6" fill={accent} />
              <text x="123" y="20" fill="#fff" fontSize="14" fontWeight="800" textAnchor="middle">9</text>

              {/* Second row */}
              <rect x="18" y="36" width="30" height="30" rx="6" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="33" y="56" fill="var(--text)" fontSize="14" fontWeight="800" textAnchor="middle">5</text>

              <rect x="54" y="36" width="30" height="30" rx="6" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="69" y="56" fill="var(--text)" fontSize="14" fontWeight="800" textAnchor="middle">2</text>

              <rect x="90" y="36" width="30" height="30" rx="6" fill={accent} />
              <text x="105" y="56" fill="#fff" fontSize="14" fontWeight="800" textAnchor="middle">6</text>
            </g>

            {/* Equals Pill */}
            <rect x="110" y="106" width="60" height="18" rx="9" fill={accent} />
            <text x="140" y="119" fill="#fff" fontSize="11" fontWeight="900" textAnchor="middle">SUM = 23</text>
          </svg>
        </div>
      );

    case 'memoryMatch':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Card 1 (Tilted Left) */}
            <g transform="translate(100, 65) rotate(-10) translate(-30, -42)" className="anim-float">
              <rect width="48" height="66" rx="10" fill="var(--surface)" stroke={accent} strokeWidth="2.5" />
              <rect x="6" y="6" width="36" height="54" rx="6" fill={accent} fillOpacity="0.12" />
              <circle cx="24" cy="33" r="12" fill={accent} />
              <path d="M20 33L23 36L28 30" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {/* Card 2 (Tilted Right - Match!) */}
            <g transform="translate(180, 65) rotate(10) translate(-30, -42)" className="anim-float" style={{ animationDelay: '0.3s' }}>
              <rect width="48" height="66" rx="10" fill="var(--surface)" stroke={accent} strokeWidth="2.5" />
              <rect x="6" y="6" width="36" height="54" rx="6" fill={accent} fillOpacity="0.12" />
              <circle cx="24" cy="33" r="12" fill={accent} />
              <path d="M20 33L23 36L28 30" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {/* Match Sparkle Rays */}
            <circle cx="140" cy="50" r="3" fill={accent} />
            <path d="M140 40V46M140 54V60M133 50H137M143 50H147" stroke={accent} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    default:
      return null;
  }
}
