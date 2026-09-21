import React, { useState } from 'react';
import BgOrbs from './BgOrbs';
import GameCardVisual from './GameCardVisual';
import {
  BrandLogoIcon,
  CategoryIcon,
  DifficultyBars,
  SunIcon,
  MoonIcon,
  TrophyIcon,
  ArrowRightIcon,
} from './Icons';

const DIFFICULTIES = [
  { key: 'easy',   label: 'Easy',   time: '20s / Q' },
  { key: 'medium', label: 'Medium', time: '15s / Q' },
  { key: 'hard',   label: 'Hard',   time: '10s / Q' },
];

const CATEGORIES = [
  { key: 'all',     label: 'All Mix'  },
  { key: 'math',    label: 'Math'     },
  { key: 'logical', label: 'Logical'  },
  { key: 'verbal',  label: 'Verbal'   },
  { key: 'series',  label: 'Series'   },
  { key: 'spatial', label: 'Spatial'  },
];

const GAMES_LIST = [
  {
    id: 'quiz',
    title: 'Aptitude Quiz',
    tag: 'Cognitive IQ',
    desc: '32 curated reasoning & aptitude challenges across 5 categories with 3 lives, 50:50, and time boosters.',
    accent: 'var(--violet)',
    soft: 'var(--violet-soft)',
  },
  {
    id: 'scramble5',
    title: 'Scramble 5',
    tag: '5 Attempts',
    desc: 'Unscramble the word in 5 attempts! Green reveals exact positions, yellow reveals misplaced letters.',
    accent: 'var(--coral)',
    soft: 'var(--coral-soft)',
  },
  {
    id: 'chronoBeat',
    title: 'Chrono Beat',
    tag: 'Blind Clock',
    desc: 'Can your brain measure seconds without looking? The counter blinds after 1.2s — tap stop at the exact millisecond!',
    accent: 'var(--amber)',
    soft: 'var(--amber-soft)',
  },
  {
    id: 'arrowClash',
    title: 'Arrow Clash',
    tag: 'Inversion Reflex',
    desc: 'Directional arrows flash while rules switch between Direct (same) and Inverted (opposite). Tests cognitive control!',
    accent: 'var(--coral)',
    soft: 'var(--coral-soft)',
  },
  {
    id: 'reflexStrike',
    title: 'Reflex Strike',
    tag: 'Speed & Reaction',
    desc: 'Lightning target taps on a 3×3 grid. Catch targets & bonus golden stars before they vanish, but avoid hazard bombs!',
    accent: 'var(--coral)',
    soft: 'var(--coral-soft)',
  },
  {
    id: 'wordScramble',
    title: 'Word Scramble',
    tag: 'Word Puzzle',
    desc: 'Unscramble jumbled letter tiles against the clock with clue hints, shuffle tools, and bonus time additions.',
    accent: 'var(--amber)',
    soft: 'var(--amber-soft)',
  },
  {
    id: 'sumDrop',
    title: 'Sum Drop',
    tag: 'Math Puzzle',
    desc: 'Pick tiles from a 4×4 grid that sum to the target number to clear rows and build multiplier streaks.',
    accent: 'var(--mint)',
    soft: 'var(--mint-soft)',
  },
  {
    id: 'memoryMatch',
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
  palette,
  onSelectPalette,
}) {
  const [showQuizConfig, setShowQuizConfig] = useState(false);

  return (
    <div className="screen full-home-screen">
      <BgOrbs />
      <div className="full-home-container">

        {/* Top Header Row (Full Width) */}
        <header className="full-home-header">
          <div className="header-brand-wrap">
            <BrandLogoIcon size={38} className="brand-logo-svg" />
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

            {/* Palette Switcher */}
            <div className="palette-pill-selector" role="group" aria-label="Color Palette">
              <button
                className={`btn-palette-pill ${palette === 'crisp' ? 'active' : ''}`}
                onClick={() => onSelectPalette('crisp')}
                title="Crisp Minimal (Pearl & Vibrant Accents)"
              >
                <span className="palette-dot dot-crisp" />
                Crisp
              </button>
              <button
                className={`btn-palette-pill ${palette === 'matcha' ? 'active' : ''}`}
                onClick={() => onSelectPalette('matcha')}
                title="Botanical Sage (Calm Japanese Minimal)"
              >
                <span className="palette-dot dot-sage" />
                Sage
              </button>
              <button
                className={`btn-palette-pill ${palette === 'sand' ? 'active' : ''}`}
                onClick={() => onSelectPalette('sand')}
                title="Warm Sandstone (Desert Minimal)"
              >
                <span className="palette-dot dot-sand" />
                Sand
              </button>
            </div>

            {/* Theme Toggle */}
            <button className="btn-theme-toggle" onClick={onToggleTheme} title="Toggle Dark/Light Mode">
              {theme === 'dark' ? (
                <>
                  <SunIcon size={15} />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <MoonIcon size={15} />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Modern Full-Screen Cards Grid */}
        <div className="full-cards-grid">
          {GAMES_LIST.map((game, index) => {
            const bestScore = stats[game.id === 'quiz' ? 'highScore' : `${game.id}High`] || 0;
            const isQuiz = game.id === 'quiz';

            return (
              <div
                key={game.id}
                className={`full-game-card modern-game-card ${isQuiz && showQuizConfig ? 'card-expanded' : ''}`}
                style={{
                  '--card-accent': game.accent,
                  '--card-soft': game.soft,
                  '--i': index,
                }}
              >
                {/* Visual Header Image Banner */}
                <div className="card-visual-wrapper">
                  <GameCardVisual gameId={game.id} accent={game.accent} soft={game.soft} />
                  <div className="card-banner-badges">
                    <span className="game-card-tag" style={{ background: 'var(--surface)', color: game.accent }}>
                      {game.tag}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="card-title-row">
                    <span className="card-accent-dot" style={{ background: game.accent }} />
                    <h3 className="game-card-title">{game.title}</h3>
                  </div>
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
                            <DifficultyBars level={d.key} size={14} />
                            <span>{d.label}</span>
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
                            <CategoryIcon name={c.key} size={14} />
                            <span>{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="card-footer-row">
                  <div className="card-best-badge">
                    <div className="b-lbl-wrap">
                      <TrophyIcon size={12} className="trophy-icon" />
                      <span className="b-lbl">Best Score</span>
                    </div>
                    <span className="b-val">{bestScore} pts</span>
                  </div>

                  <div className="card-action-wrap">
                    {isQuiz && (
                      <button
                        className="btn-configure-toggle"
                        onClick={() => setShowQuizConfig(prev => !prev)}
                        title="Configure Difficulty & Category"
                      >
                        {showQuizConfig ? 'Close' : 'Setup'}
                      </button>
                    )}
                    <button
                      className="btn-card-launch"
                      onClick={() => {
                        if (isQuiz) onStartQuiz();
                        else onSelectGame(game.id);
                      }}
                    >
                      <span>Play</span>
                      <ArrowRightIcon size={13} className="launch-arrow-icon" />
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
