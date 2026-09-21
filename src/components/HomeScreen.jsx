import React, { useState } from 'react';
import BgOrbs from './BgOrbs';

const DIFFICULTIES = [
  { key: 'easy',   icon: '🌱', label: 'Easy',   time: '20s / Q' },
  { key: 'medium', icon: '⚡', label: 'Medium', time: '15s / Q' },
  { key: 'hard',   icon: '🔥', label: 'Hard',   time: '10s / Q' },
];

const CATEGORIES = [
  { key: 'all',     icon: '🎲', label: 'All Mix'  },
  { key: 'math',    icon: '➕', label: 'Math'     },
  { key: 'logical', icon: '🔗', label: 'Logical'  },
  { key: 'verbal',  icon: '📖', label: 'Verbal'   },
  { key: 'series',  icon: '🔢', label: 'Series'   },
  { key: 'spatial', icon: '🔷', label: 'Spatial'  },
];

const GAMES_CATALOG = [
  {
    id: 'quiz',
    icon: '🧠',
    title: 'Aptitude Quiz',
    tag: 'Cognitive IQ',
    shortDesc: 'Aptitude & Reasoning',
    desc: '32 curated aptitude & reasoning questions across 5 categories with lives, 50:50, and time boosters.',
    accent: 'var(--violet)',
    soft: 'var(--violet-soft)',
  },
  {
    id: 'chronoBeat',
    icon: '⏱️',
    title: 'Chrono Beat',
    tag: 'Unique Time Sense',
    shortDesc: 'Blind Clock Test',
    desc: 'Can your brain measure seconds without looking? Counter blinds at 1.2s — tap stop at the exact millisecond!',
    accent: 'var(--amber)',
    soft: 'var(--amber-soft)',
  },
  {
    id: 'arrowClash',
    icon: '🧭',
    title: 'Arrow Clash',
    tag: 'Unique Spatial Reflex',
    shortDesc: 'Inversion Reflex',
    desc: 'Directional arrows flash rapidly while rules dynamically switch between Direct and Inverted opposites!',
    accent: 'var(--coral)',
    soft: 'var(--coral-soft)',
  },
  {
    id: 'reflexStrike',
    icon: '🎯',
    title: 'Reflex Strike',
    tag: 'Speed & Precision',
    shortDesc: 'Tap & Dodge',
    desc: 'Fast target taps on a 3×3 grid. Catch targets & bonus golden stars while avoiding hazard bombs!',
    accent: 'var(--coral)',
    soft: 'var(--coral-soft)',
  },
  {
    id: 'wordScramble',
    icon: '🔤',
    title: 'Word Scramble',
    tag: 'Word Puzzle',
    shortDesc: 'Anagram Dash',
    desc: 'Unscramble jumbled letter tiles against the clock with clue hints and letter shuffle tools.',
    accent: 'var(--amber)',
    soft: 'var(--amber-soft)',
  },
  {
    id: 'sumDrop',
    icon: '🔢',
    title: 'Sum Drop',
    tag: 'Tactical Math',
    shortDesc: 'Target Sums',
    desc: 'Select tiles from a 4×4 grid that sum to the target number to clear rows and score combos.',
    accent: 'var(--mint)',
    soft: 'var(--mint-soft)',
  },
  {
    id: 'memoryMatch',
    icon: '🃏',
    title: 'Memory Match',
    tag: 'Visual Memory',
    shortDesc: 'Card Pairs',
    desc: 'Clean 3D animal pair matching with streak combos, move counters, and a 3-star rating system.',
    accent: 'var(--orange)',
    soft: 'var(--orange-soft)',
  },
];

export default function HomeScreen({
  difficulty,
  setDifficulty,
  category,
  setCategory,
  onStartQuiz,
  onSelectGame,
  stats,
  theme,
  onToggleTheme,
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  const activeGame = GAMES_CATALOG[activeIdx];
  const activeBestScore = stats[activeGame.id === 'quiz' ? 'highScore' : `${activeGame.id}High`] || 0;

  const handlePrev = () => {
    setActiveIdx((prev) => (prev > 0 ? prev - 1 : GAMES_CATALOG.length - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev < GAMES_CATALOG.length - 1 ? prev + 1 : 0));
  };

  const handleLaunch = () => {
    if (activeGame.id === 'quiz') {
      onStartQuiz();
    } else {
      onSelectGame(activeGame.id);
    }
  };

  return (
    <div className="screen home-screen">
      <BgOrbs />
      <div className="home-content arcade-home">

        {/* Top Header Bar */}
        <div className="top-utility-bar">
          <div className="brand-badge">✨ BrainBlitz Arena</div>
          <button className="btn-theme-toggle" onClick={onToggleTheme} title="Toggle Theme">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Logo */}
        <div className="logo-wrap">
          <span className="logo-icon">🧠</span>
          <h1 className="logo-title">Brain<span>Blitz</span></h1>
          <p className="logo-sub">Interactive Mind Games &amp; Reflex Challenges</p>
        </div>

        {/* ──────────────────────────────────────────────
            ALTERNATIVE TO CARDS: INTERACTIVE GAME DOCK
            ────────────────────────────────────────────── */}
        <div className="game-dock-strip">
          {GAMES_CATALOG.map((g, idx) => {
            const isCurrent = idx === activeIdx;
            return (
              <button
                key={g.id}
                className={`dock-capsule ${isCurrent ? 'active' : ''}`}
                style={{
                  '--capsule-accent': g.accent,
                  '--capsule-soft': g.soft,
                }}
                onClick={() => setActiveIdx(idx)}
              >
                <span className="dock-icon">{g.icon}</span>
                <span className="dock-label">{g.shortDesc}</span>
              </button>
            );
          })}
        </div>

        {/* ──────────────────────────────────────────────
            FEATURED HERO STAGE (CONSOLE ARENA)
            ────────────────────────────────────────────── */}
        <div
          className="hero-stage-console animate-pop"
          key={activeGame.id}
          style={{
            '--hero-accent': activeGame.accent,
            '--hero-soft': activeGame.soft,
          }}
        >
          {/* Navigation Controls */}
          <button className="btn-stage-nav btn-prev" onClick={handlePrev} title="Previous Game">
            ‹
          </button>
          <button className="btn-stage-nav btn-next" onClick={handleNext} title="Next Game">
            ›
          </button>

          {/* Hero Header */}
          <div className="hero-stage-badge" style={{ background: activeGame.soft, color: activeGame.accent }}>
            {activeGame.tag}
          </div>

          <div className="hero-main-icon">
            {activeGame.icon}
          </div>

          <h2 className="hero-game-title">{activeGame.title}</h2>
          <p className="hero-game-desc">{activeGame.desc}</p>

          <div className="hero-meta-row">
            <div className="hero-stat-pill">
              <span className="h-lbl">Personal Best</span>
              <span className="h-val" style={{ color: activeGame.accent }}>
                🏆 {activeBestScore} pts
              </span>
            </div>
            <div className="hero-stat-pill">
              <span className="h-lbl">Game</span>
              <span className="h-val">{activeIdx + 1} of {GAMES_CATALOG.length}</span>
            </div>
          </div>

          {/* If Quiz is active, show category & difficulty configurator */}
          {activeGame.id === 'quiz' && (
            <div className="stage-quiz-config">
              <div className="section-block">
                <p className="section-label">Difficulty</p>
                <div className="difficulty-cards">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d.key}
                      className={`diff-card ${difficulty === d.key ? 'selected' : ''}`}
                      onClick={() => setDifficulty(d.key)}
                    >
                      <span className="diff-icon">{d.icon}</span>
                      <span className="diff-name">{d.label}</span>
                      <span className="diff-time">{d.time}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="section-block">
                <p className="section-label">Category</p>
                <div className="category-grid">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.key}
                      className={`cat-pill ${category === c.key ? 'selected' : ''}`}
                      onClick={() => setCategory(c.key)}
                    >
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Big Action Button */}
          <button
            className="btn-launch-hero"
            style={{ background: activeGame.accent }}
            onClick={handleLaunch}
          >
            <span>Launch {activeGame.title}</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>

        {/* Overall Stats Footer */}
        <div className="stats-row">
          <div className="stat-box">
            <span>{stats.highScore ?? 0}</span>
            <label>Quiz Record</label>
          </div>
          <div className="stat-box">
            <span>{stats.gamesPlayed ?? 0}</span>
            <label>Rounds Played</label>
          </div>
          <div className="stat-box">
            <span>{stats.bestStreak ?? 0}</span>
            <label>Max Streak</label>
          </div>
        </div>

      </div>
    </div>
  );
}
