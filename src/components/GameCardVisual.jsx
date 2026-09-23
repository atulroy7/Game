import React from 'react';

export default function GameCardVisual({ gameId, accent = 'var(--coral)', soft = 'var(--coral-soft)' }) {
  switch (gameId) {
    case 'numberNinja':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(30, 36)">
              {/* Wooden scroll tiles */}
              <rect x="0" y="8" width="36" height="42" rx="6" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="18" y="34" fill="var(--text)" fontSize="16" fontWeight="900" textAnchor="middle">4</text>

              <rect x="44" y="8" width="36" height="42" rx="6" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="62" y="34" fill="var(--text)" fontSize="16" fontWeight="900" textAnchor="middle">8</text>

              <rect x="88" y="8" width="36" height="42" rx="6" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="106" y="34" fill="var(--text)" fontSize="16" fontWeight="900" textAnchor="middle">16</text>

              {/* Missing tile slashed */}
              <rect x="132" y="8" width="36" height="42" rx="6" fill={accent} />
              <text x="150" y="34" fill="#fff" fontSize="18" fontWeight="900" textAnchor="middle">32</text>

              <rect x="176" y="8" width="36" height="42" rx="6" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="194" y="34" fill="var(--text)" fontSize="16" fontWeight="900" textAnchor="middle">64</text>
            </g>

            {/* Ninja Katana Slash Trail */}
            <line x1="60" y1="110" x2="220" y2="20" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeDasharray="180" />
            <polygon points="220,20 205,25 215,35" fill={accent} />

            <rect x="96" y="106" width="88" height="17" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
            <text x="140" y="118" fill="var(--text)" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="0.8">SERIES SLICE</text>
          </svg>
        </div>
      );

    case 'funnySort':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 3 Ranked Humorous Scenario Cards in Cascade */}
            <g transform="translate(45, 18)">
              {/* Card 1 */}
              <rect x="0" y="8" width="56" height="74" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
              <rect x="4" y="12" width="16" height="16" rx="4" fill="#10B981" />
              <text x="12" y="24" fill="#fff" fontSize="10" fontWeight="900" textAnchor="middle">1</text>
              <text x="28" y="46" fill="var(--text)" fontSize="20" textAnchor="middle">🍕</text>
              <path d="M22 66 L28 60 L34 66" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

              {/* Card 2 (Elevated / Active) */}
              <rect x="66" y="2" width="58" height="82" rx="9" fill="var(--surface)" stroke={accent} strokeWidth="2.5" />
              <rect x="70" y="6" width="18" height="18" rx="5" fill="#F59E0B" />
              <text x="79" y="19" fill="#fff" fontSize="11" fontWeight="900" textAnchor="middle">2</text>
              <text x="95" y="44" fill="var(--text)" fontSize="24" textAnchor="middle">🤪</text>
              <text x="95" y="68" fill={accent} fontSize="8" fontWeight="800" textAnchor="middle">SWAP</text>

              {/* Card 3 */}
              <rect x="134" y="12" width="56" height="70" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
              <rect x="138" y="16" width="16" height="16" rx="4" fill="#EF4444" />
              <text x="146" y="28" fill="#fff" fontSize="10" fontWeight="900" textAnchor="middle">3</text>
              <text x="162" y="48" fill="var(--text)" fontSize="20" textAnchor="middle">💥</text>
              <path d="M156 62 L162 68 L168 62" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            <rect x="88" y="106" width="104" height="17" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
            <text x="140" y="118" fill="var(--text)" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="0.8">COMEDY RANK</text>
          </svg>
        </div>
      );

    case 'missingPiece':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(95, 20)">
              {/* 3x3 Mini Grid */}
              {[0, 1, 2].map(r => [0, 1, 2].map(c => {
                const isMissing = r === 2 && c === 2;
                return (
                  <g key={`${r}-${c}`} transform={`translate(${c * 32}, ${r * 32})`}>
                    <rect
                      x="0"
                      y="0"
                      width="26"
                      height="26"
                      rx="4"
                      fill={isMissing ? accent : 'var(--surface)'}
                      stroke={isMissing ? accent : 'var(--border)'}
                      strokeWidth="1.5"
                    />
                    {!isMissing ? (
                      <circle cx="13" cy="13" r={4 + r + c} fill="var(--text)" fillOpacity="0.4" />
                    ) : (
                      <text x="13" y="18" fill="#fff" fontSize="14" fontWeight="900" textAnchor="middle">?</text>
                    )}
                  </g>
                );
              }))}
            </g>

            <rect x="90" y="110" width="100" height="16" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
            <text x="140" y="122" fill="var(--text)" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="0.8">RAVEN MATRIX</text>
          </svg>
        </div>
      );

    case 'speedMath':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Speed Lightning bolt */}
            <path d="M145 15L115 65H142L128 115L170 55H140L145 15Z" fill={accent} opacity="0.2" />

            {/* Arithmetic Formula Badges */}
            <g transform="translate(45, 42)">
              <rect x="0" y="0" width="60" height="36" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="30" y="24" fill="var(--text)" fontSize="13" fontWeight="900" textAnchor="middle">15% of 80</text>
            </g>

            <g transform="translate(115, 38)">
              <circle cx="25" cy="20" r="22" fill={accent} />
              <text x="25" y="26" fill="#fff" fontSize="16" fontWeight="900" textAnchor="middle">=</text>
            </g>

            <g transform="translate(175, 42)">
              <rect x="0" y="0" width="60" height="36" rx="8" fill="var(--surface)" stroke={accent} strokeWidth="2" />
              <text x="30" y="25" fill={accent} fontSize="16" fontWeight="900" textAnchor="middle">12 ⚡</text>
            </g>

            <rect x="96" y="106" width="88" height="17" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
            <text x="140" y="118" fill="var(--text)" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="0.8">SPRINT MATH</text>
          </svg>
        </div>
      );

    case 'codeBreaker':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(45, 34)">
              <rect x="0" y="0" width="85" height="38" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="42" y="24" fill="var(--text)" fontSize="14" fontWeight="900" textAnchor="middle" letterSpacing="2">TIGER</text>

              <path d="M95 19H115M110 13L118 19L110 25" stroke={accent} strokeWidth="2" strokeLinecap="round" />

              <rect x="125" y="0" width="85" height="38" rx="8" fill={accent} />
              <text x="167" y="24" fill="#fff" fontSize="14" fontWeight="900" textAnchor="middle" letterSpacing="2">VKIGT</text>
            </g>

            <rect x="75" y="85" width="130" height="18" rx="9" fill="var(--surface2)" stroke="var(--border)" strokeWidth="1" />
            <text x="140" y="97" fill="var(--muted)" fontSize="9" fontWeight="800" textAnchor="middle">SHIFT (+2) CIPHER</text>
          </svg>
        </div>
      );

    case 'brainMaze':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="140" cy="58" r="42" stroke={accent} strokeWidth="2" strokeOpacity="0.3" strokeDasharray="4 4" />
            <circle cx="140" cy="58" r="32" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />

            <text x="140" y="32" fill={accent} fontSize="11" fontWeight="900" textAnchor="middle">N</text>
            <text x="140" y="94" fill="var(--muted)" fontSize="10" fontWeight="800" textAnchor="middle">S</text>
            <text x="170" y="62" fill="var(--muted)" fontSize="10" fontWeight="800" textAnchor="middle">E</text>
            <text x="110" y="62" fill="var(--muted)" fontSize="10" fontWeight="800" textAnchor="middle">W</text>

            <polygon points="140,38 145,58 135,58" fill={accent} />
            <polygon points="140,78 145,58 135,58" fill="var(--muted)" />

            <rect x="96" y="106" width="88" height="17" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
            <text x="140" y="118" fill="var(--text)" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="0.8">COMPASS SENSE</text>
          </svg>
        </div>
      );

    case 'seatingShuffle':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(35, 42)">
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i} transform={`translate(${i * 44}, 0)`}>
                  <rect x="0" y="10" width="34" height="34" rx="8" fill={i === 2 ? accent : 'var(--surface)'} stroke="var(--border)" strokeWidth="1.5" />
                  <circle cx="17" cy="0" r="7" fill={i === 2 ? accent : 'var(--muted)'} fillOpacity="0.6" />
                  <text x="17" y="32" fill={i === 2 ? '#fff' : 'var(--text)'} fontSize="12" fontWeight="900" textAnchor="middle">
                    {['A', 'B', 'C', 'D', 'E'][i]}
                  </text>
                </g>
              ))}
            </g>

            <rect x="85" y="106" width="110" height="17" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
            <text x="140" y="118" fill="var(--text)" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="0.8">CHAIR LOGIC</text>
          </svg>
        </div>
      );

    case 'oddOneOut':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(35, 40)">
              <rect x="0" y="0" width="45" height="45" rx="10" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="22" y="28" fill="var(--text)" fontSize="13" fontWeight="800" textAnchor="middle">17</text>

              <rect x="55" y="0" width="45" height="45" rx="10" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="77" y="28" fill="var(--text)" fontSize="13" fontWeight="800" textAnchor="middle">19</text>

              <rect x="110" y="0" width="45" height="45" rx="10" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="132" y="28" fill="var(--text)" fontSize="13" fontWeight="800" textAnchor="middle">23</text>

              {/* Outlier */}
              <rect x="165" y="0" width="45" height="45" rx="10" fill={accent} />
              <text x="187" y="28" fill="#fff" fontSize="14" fontWeight="900" textAnchor="middle">27 ✕</text>
            </g>

            <rect x="90" y="106" width="100" height="17" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
            <text x="140" y="118" fill="var(--text)" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="0.8">SPOT OUTLIER</text>
          </svg>
        </div>
      );

    case 'detectiveMystery':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Clue Magnifier */}
            <circle cx="120" cy="55" r="26" stroke={accent} strokeWidth="3.5" fill="var(--surface)" fillOpacity="0.4" />
            <line x1="140" y1="75" x2="165" y2="100" stroke={accent} strokeWidth="5" strokeLinecap="round" />

            <circle cx="120" cy="50" r="10" fill="var(--surface2)" />
            <path d="M108 65C108 58 114 55 120 55C126 55 132 58 132 65" fill="var(--surface2)" />

            <rect x="160" y="30" width="60" height="40" rx="6" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
            <text x="190" y="54" fill="var(--text)" fontSize="11" fontWeight="800" textAnchor="middle">CASE 101</text>

            <rect x="85" y="106" width="110" height="17" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
            <text x="140" y="118" fill="var(--text)" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="0.8">BLOOD RELATIONS</text>
          </svg>
        </div>
      );

    case 'countdown60':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Clock ring */}
            <circle cx="140" cy="58" r="40" stroke={accent} strokeWidth="3" strokeDasharray="180 50" />
            <circle cx="140" cy="58" r="32" fill="var(--surface)" />
            <text x="140" y="65" fill={accent} fontSize="18" fontWeight="900" textAnchor="middle" fontFamily="JetBrains Mono">60s</text>

            <rect x="96" y="108" width="88" height="17" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
            <text x="140" y="120" fill="var(--text)" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="0.8">RAPID BLITZ</text>
          </svg>
        </div>
      );

    case 'equationEscape':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(35, 42)">
              <rect x="0" y="0" width="34" height="34" rx="6" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="17" y="23" fill="var(--text)" fontSize="16" fontWeight="900" textAnchor="middle">3</text>

              <rect x="42" y="0" width="34" height="34" rx="6" fill="var(--surface2)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="59" y="23" fill="var(--text)" fontSize="18" fontWeight="900" textAnchor="middle">×</text>

              <rect x="84" y="0" width="34" height="34" rx="6" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="101" y="23" fill="var(--text)" fontSize="16" fontWeight="900" textAnchor="middle">8</text>

              <rect x="126" y="0" width="34" height="34" rx="6" fill="var(--surface2)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="143" y="23" fill="var(--text)" fontSize="18" fontWeight="900" textAnchor="middle">=</text>

              {/* Target */}
              <rect x="168" y="0" width="42" height="34" rx="6" fill={accent} />
              <text x="189" y="23" fill="#fff" fontSize="16" fontWeight="900" textAnchor="middle">24 🔓</text>
            </g>

            <rect x="90" y="106" width="100" height="17" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
            <text x="140" y="118" fill="var(--text)" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="0.8">EQUATION LOCK</text>
          </svg>
        </div>
      );

    case 'chronoBeat':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="140" cy="65" r="44" stroke={accent} strokeWidth="2.5" strokeOpacity="0.25" strokeDasharray="4 4" />
            <circle cx="140" cy="65" r="36" fill="var(--surface)" stroke={accent} strokeWidth="2" />

            <line x1="140" y1="33" x2="140" y2="38" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="140" y1="92" x2="140" y2="97" stroke={accent} strokeWidth="2" strokeLinecap="round" />
            <line x1="108" y1="65" x2="113" y2="65" stroke={accent} strokeWidth="2" strokeLinecap="round" />
            <line x1="167" y1="65" x2="172" y2="65" stroke={accent} strokeWidth="2" strokeLinecap="round" />

            <g className="anim-spin-needle" style={{ transformOrigin: '140px 65px' }}>
              <line x1="140" y1="65" x2="140" y2="40" stroke={accent} strokeWidth="3" strokeLinecap="round" />
            </g>

            <rect x="136" y="22" width="8" height="5" rx="2" fill={accent} />
            <circle cx="140" cy="65" r="5" fill={accent} />

            <rect x="110" y="106" width="60" height="16" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
            <text x="140" y="118" fill="var(--text)" fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="JetBrains Mono, monospace">01.000s</text>
          </svg>
        </div>
      );

    case 'memoryMatch':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(68, 32)">
              <rect x="0" y="0" width="42" height="52" rx="10" fill={accent} stroke="#fff" strokeWidth="2" />
              <text x="21" y="34" fontSize="20" textAnchor="middle">🦊</text>

              <rect x="52" y="0" width="42" height="52" rx="10" fill={accent} stroke="#fff" strokeWidth="2" />
              <text x="73" y="34" fontSize="20" textAnchor="middle">🦊</text>

              <rect x="104" y="0" width="42" height="52" rx="10" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
              <text x="125" y="34" fontSize="18" textAnchor="middle">?</text>
            </g>

            <rect x="96" y="106" width="88" height="17" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
            <text x="140" y="118" fill="var(--text)" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="0.8">PAIR FOCUS</text>
          </svg>
        </div>
      );

    case 'tabooReasoning':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(45, 24)">
              {/* Central Target Badge */}
              <rect x="50" y="0" width="90" height="28" rx="8" fill={accent} />
              <text x="95" y="19" fill="#fff" fontSize="12" fontWeight="900" textAnchor="middle" letterSpacing="1">TARGET</text>

              {/* Forbidden Taboo Cross Badges */}
              <g transform="translate(0, 36)">
                <rect x="0" y="0" width="56" height="22" rx="6" fill="var(--surface)" stroke="var(--coral)" strokeWidth="1.2" />
                <text x="28" y="15" fill="var(--coral)" fontSize="10" fontWeight="900" textAnchor="middle">🚫 CLUE 1</text>

                <rect x="64" y="0" width="62" height="22" rx="6" fill="var(--surface)" stroke="var(--coral)" strokeWidth="1.2" />
                <text x="95" y="15" fill="var(--coral)" fontSize="10" fontWeight="900" textAnchor="middle">🚫 TABOO</text>

                <rect x="134" y="0" width="56" height="22" rx="6" fill="var(--surface)" stroke="var(--coral)" strokeWidth="1.2" />
                <text x="162" y="15" fill="var(--coral)" fontSize="10" fontWeight="900" textAnchor="middle">🚫 CLUE 2</text>
              </g>

              {/* Verified Clean Check */}
              <rect x="42" y="66" width="106" height="18" rx="6" fill="var(--mint-soft)" stroke="var(--mint)" strokeWidth="1.2" />
              <text x="95" y="79" fill="var(--mint)" fontSize="9" fontWeight="900" textAnchor="middle">✓ CLEAN DEDUCTION</text>
            </g>

            <rect x="88" y="110" width="104" height="16" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
            <text x="140" y="122" fill="var(--text)" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="0.8">FORBIDDEN CLUES</text>
          </svg>
        </div>
      );

    case 'picturePuzzle':
      return (
        <div className="card-visual-banner" style={{ background: soft }}>
          <svg className="card-visual-svg" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(60, 20)">
              {/* Mini Rebus Stand/I */}
              <rect x="15" y="0" width="130" height="78" rx="12" fill="var(--surface)" stroke={accent} strokeWidth="2" />
              <text x="80" y="32" fill="var(--text)" fontSize="18" fontWeight="900" textAnchor="middle" letterSpacing="3">STAND</text>
              <line x1="40" y1="42" x2="120" y2="42" stroke={accent} strokeWidth="2" strokeLinecap="round" />
              <text x="80" y="66" fill={accent} fontSize="20" fontWeight="900" textAnchor="middle">I</text>
            </g>

            <rect x="90" y="110" width="100" height="16" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
            <text x="140" y="122" fill="var(--text)" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="0.8">VISUAL REBUS</text>
          </svg>
        </div>
      );

    default:
      return null;
  }
}
