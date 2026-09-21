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

const GAMES_LIST = [
  {
    id: 'quiz',
    icon: '🧠',
    title: 'Aptitude Quiz',
    tag: 'Cognitive IQ',
    desc: '32 curated reasoning & aptitude challenges across 5 categories with 3 lives, 50:50, and time boosters.',
    accent: 'var(--violet)',
    soft: 'var(--violet-soft)',
  },
  {
    id: 'scramble5',
    icon: '🔠',
    title: 'Scramble 5',
    tag: '5 Attempts',
    desc: 'Unscramble the word in 5 attempts! Green reveals exact positions, yellow reveals misplaced letters.',
    accent: 'var(--coral)',
    soft: 'var(--coral-soft)',
  },
  {
    id: 'chronoBeat',
    icon: '⏱️',
    title: 'Chrono Beat',
    tag: 'Blind Clock',
    desc: 'Can your brain measure seconds without looking? The counter blinds after 1.2s — tap stop at the exact millisecond!',
    accent: 'var(--amber)',
    soft: 'var(--amber-soft)',
  },
  {
    id: 'arrowClash',
    icon: '🧭',
    title: 'Arrow Clash',
    tag: 'Inversion Reflex',
    desc: 'Directional arrows flash while rules switch between Direct (same) and Inverted (opposite). Tests cognitive control!',
    accent: 'var(--coral)',
    soft: 'var(--coral-soft)',
  },
  {
    id: 'reflexStrike',
    icon: '🎯',
    title: 'Reflex Strike',
    tag: 'Speed & Reaction',
    desc: 'Lightning target taps on a 3×3 grid. Catch targets & bonus golden stars before they vanish, but avoid hazard bombs!',
    accent: 'var(--coral)',
    soft: 'var(--coral-soft)',
  },
  {
    id: 'wordScramble',
    icon: '🔤',
    title: 'Word Scramble',
    tag: 'Word Puzzle',
    desc: 'Unscramble jumbled letter tiles against the clock with clue hints, shuffle tools, and bonus time additions.',
    accent: 'var(--amber)',
    soft: 'var(--amber-soft)',
  },
  {
    id: 'sumDrop',
    icon: '🔢',
    title: 'Sum Drop',
    tag: 'Math Puzzle',
    desc: 'Pick tiles from a 4×4 grid that sum to the target number to clear rows and build multiplier streaks.',
    accent: 'var(--mint)',
    soft: 'var(--mint-soft)',
  },
  {
    id: 'memoryMatch',
    icon: '🃏',
    title: 'Memory Match',
    tag: 'Visual Focus',
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
  const [showQuizConfig, setShowQuizConfig] = useState(false);

  return (
    <div className="screen full-home-screen">
      <BgOrbs />
      <div className="full-home-container">

        {/* Top Header Row (Full Width) */}
        <header className="full-home-header">
          <div className="header-brand-wrap">
            <span className="brand-logo-icon">🧠</span>
            <div>
              <h1 className="brand-heading">Brain<span>Blitz</span></h1>
              <p className="brand-tagline">8 Interactive Mind Games &amp; Cognitive Challenges</p>
            </div>
          </div>

          <div className="header-right-tools">
            {/* Aggregate Stats */}
            <div className="header-stat-badge">
              <span className="h-num">{stats.gamesPlayed ?? 0}</span>
              <span className="h-lbl">Rounds Played</span>
            </div>
            <div className="header-stat-badge">
              <span className="h-num">{stats.highScore ?? 0}</span>
              <span className="h-lbl">Quiz Record</span>
            </div>

            {/* Theme Toggle */}
            <button className="btn-theme-toggle" onClick={onToggleTheme} title="Toggle Theme">
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </header>

        {/* Full-Screen Cards Grid */}
        <div className="full-cards-grid">
          {GAMES_LIST.map((game) => {
            const bestScore = stats[game.id === 'quiz' ? 'highScore' : `${game.id}High`] || 0;
            const isQuiz = game.id === 'quiz';

            return (
              <div
                key={game.id}
                className={`full-game-card ${isQuiz && showQuizConfig ? 'card-expanded' : ''}`}
                style={{
                  '--card-accent': game.accent,
                  '--card-soft': game.soft,
                }}
              >
                <div className="card-top-row">
                  <span className="game-card-icon">{game.icon}</span>
                  <span className="game-card-tag" style={{ background: game.soft, color: game.accent }}>
                    {game.tag}
                  </span>
                </div>

                <div className="card-body">
                  <h3 className="game-card-title">{game.title}</h3>
                  <p className="game-card-desc">{game.desc}</p>
                </div>

                {/* Inline Quiz Config Drawer */}
                {isQuiz && showQuizConfig && (
                  <div className="card-inline-drawer animate-pop">
                    <div className="drawer-group">
                      <label className="drawer-lbl">Difficulty</label>
                      <div className="diff-pill-row">
                        {DIFFICULTIES.map(d => (
                          <button
                            key={d.key}
                            className={`mini-diff-pill ${difficulty === d.key ? 'selected' : ''}`}
                            onClick={() => setDifficulty(d.key)}
                          >
                            {d.icon} {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="drawer-group">
                      <label className="drawer-lbl">Category</label>
                      <div className="cat-pill-wrap">
                        {CATEGORIES.map(c => (
                          <button
                            key={c.key}
                            className={`mini-cat-pill ${category === c.key ? 'selected' : ''}`}
                            onClick={() => setCategory(c.key)}
                          >
                            {c.icon} {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="card-footer-row">
                  <div className="card-best-badge">
                    <span className="b-lbl">Best Score</span>
                    <span className="b-val">{bestScore} pts</span>
                  </div>

                  <div className="card-action-wrap">
                    {isQuiz && (
                      <button
                        className="btn-configure-toggle"
                        onClick={() => setShowQuizConfig(prev => !prev)}
                        title="Configure Difficulty & Category"
                      >
                        ⚙️ {showQuizConfig ? 'Close' : 'Setup'}
                      </button>
                    )}
                    <button
                      className="btn-card-launch"
                      style={{ background: game.accent }}
                      onClick={() => {
                        if (isQuiz) onStartQuiz();
                        else onSelectGame(game.id);
                      }}
                    >
                      Play →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
