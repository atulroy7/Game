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

const ARCADE_GAMES = [
  {
    id: 'quiz',
    icon: '🧠',
    title: 'Aptitude Quiz',
    tag: 'Logic & Reasoning',
    desc: '32 questions across 5 categories with 3 lives and tactical power-ups.',
    borderAccent: '#6366f1',
  },
  {
    id: 'reflexStrike',
    icon: '🎯',
    title: 'Reflex Strike',
    tag: 'Speed & Reaction',
    desc: 'Tap incoming targets & stars before they vanish, but avoid hazard bombs!',
    borderAccent: '#e11d48',
  },
  {
    id: 'wordScramble',
    icon: '🔤',
    title: 'Word Scramble',
    tag: 'Word Puzzle',
    desc: 'Unscramble jumbled letter tiles against the clock with clues & hints.',
    borderAccent: '#f59e0b',
  },
  {
    id: 'sumDrop',
    icon: '🔢',
    title: 'Sum Drop',
    tag: 'Math & Tactics',
    desc: 'Pick tiles from the 4×4 grid that sum to the target number to clear rows.',
    borderAccent: '#10b981',
  },
  {
    id: 'memoryMatch',
    icon: '🃏',
    title: 'Memory Match',
    tag: 'Visual Memory',
    desc: 'Flip clean cards to find all 8 animal pairs with streak combos & star ratings.',
    borderAccent: '#3b82f6',
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
}) {
  const [selectedGameId, setSelectedGameId] = useState('quiz');

  return (
    <div className="screen home-screen">
      <BgOrbs />
      <div className="home-content arcade-home">

        {/* Header */}
        <div className="logo-wrap">
          <span className="logo-icon">🧠</span>
          <h1 className="logo-title">Brain<span>Blitz</span> <span className="arcade-tag">GAMES</span></h1>
          <p className="logo-sub">Cognitive Challenges &amp; Fun Mini-Games</p>
        </div>

        {/* Game Mode Cards Grid */}
        <div className="section-block">
          <div className="section-header-row">
            <p className="section-label">Choose Game Mode</p>
            <span className="game-count-badge">5 Games Available</span>
          </div>

          <div className="arcade-cards-grid">
            {ARCADE_GAMES.map((game) => {
              const isSelected = selectedGameId === game.id;
              const bestScore = stats[game.id === 'quiz' ? 'highScore' : `${game.id}High`] || 0;

              return (
                <div
                  key={game.id}
                  className={`arcade-card ${isSelected ? 'selected' : ''}`}
                  style={{ '--card-accent': game.borderAccent }}
                  onClick={() => setSelectedGameId(game.id)}
                >
                  <div className="arcade-card-top">
                    <span className="arcade-game-icon">{game.icon}</span>
                    <span className="arcade-game-tag">{game.tag}</span>
                  </div>
                  <h3 className="arcade-game-title">{game.title}</h3>
                  <p className="arcade-game-desc">{game.desc}</p>

                  <div className="arcade-card-bottom">
                    <span className="arcade-best">
                      Best: <strong>{bestScore}</strong>
                    </span>
                    <button
                      className="btn-arcade-play"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (game.id === 'quiz') {
                          setSelectedGameId('quiz');
                        } else {
                          onSelectGame(game.id);
                        }
                      }}
                    >
                      {game.id === 'quiz' && !isSelected ? 'Configure' : 'Play Now →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quiz Configuration Drawer if Quiz is selected */}
        {selectedGameId === 'quiz' && (
          <div className="quiz-drawer animate-pop">
            <div className="drawer-header">
              <span className="drawer-badge">🧠 Quiz Configuration</span>
              <h4>Setup Aptitude Round</h4>
            </div>

            {/* Difficulty */}
            <div className="section-block">
              <p className="section-label">Select Difficulty</p>
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

            {/* Category */}
            <div className="section-block">
              <p className="section-label">Select Category</p>
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

            {/* Start Quiz */}
            <button className="btn-start" onClick={onStartQuiz}>
              <span>Launch Aptitude Round</span>
              <span className="btn-arrow">→</span>
            </button>
          </div>
        )}

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
