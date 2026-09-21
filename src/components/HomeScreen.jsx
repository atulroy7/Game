import React, { useState } from 'react';
import BgOrbs from './BgOrbs';

const DIFFICULTIES = [
  { key: 'easy',   icon: '🌱', label: 'Easy',   time: '20s / Q' },
  { key: 'medium', icon: '🔥', label: 'Medium', time: '15s / Q' },
  { key: 'hard',   icon: '💀', label: 'Hard',   time: '10s / Q' },
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
    tag: 'Classic Logic',
    desc: '32 questions across 5 categories with 3 lives & power-ups.',
    color: '#7c3aed',
    accent: 'linear-gradient(135deg, #7c3aed, #a855f7)',
  },
  {
    id: 'colorClash',
    icon: '⚡',
    title: 'Color Clash',
    tag: 'Reflex & Focus',
    desc: 'The Stroop effect! Word vs Ink vs Reflex with 3× frenzy combos.',
    color: '#06b6d4',
    accent: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
  },
  {
    id: 'quantumMatrix',
    icon: '🔮',
    title: 'Quantum Matrix',
    tag: 'Sensory Recall',
    desc: '9-pad harmonic synthesizer! Repeat the expanding cyber pattern.',
    color: '#ec4899',
    accent: 'linear-gradient(135deg, #ec4899, #a855f7)',
  },
  {
    id: 'cyberFlip',
    icon: '🃏',
    title: 'Cyber Flip 3D',
    tag: 'Spatial Memory',
    desc: '3D card matching with X-Ray Scan, Cryo-Freeze & Radar gadgets.',
    color: '#10b981',
    accent: 'linear-gradient(135deg, #10b981, #06b6d4)',
  },
  {
    id: 'speedMath',
    icon: '🔢',
    title: 'Speed Math',
    tag: 'Mental Overdrive',
    desc: 'Rapid arithmetic blitz! Charge reactor energy for 2.5× Frenzy.',
    color: '#f59e0b',
    accent: 'linear-gradient(135deg, #f59e0b, #ef4444)',
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

        {/* Logo Header */}
        <div className="logo-wrap">
          <span className="logo-icon">🧠</span>
          <h1 className="logo-title">Brain<span>Blitz</span> <span className="arcade-tag">ARCADE</span></h1>
          <p className="logo-sub">Cognitive &amp; Reflex Mind Arena</p>
        </div>

        {/* Game Mode Cards Grid */}
        <div className="section-block">
          <div className="section-header-row">
            <p className="section-label">Select Game Experience</p>
            <span className="game-count-badge">5 Games Ready</span>
          </div>

          <div className="arcade-cards-grid">
            {ARCADE_GAMES.map((game) => {
              const isSelected = selectedGameId === game.id;
              const bestScore = stats[game.id === 'quiz' ? 'highScore' : `${game.id}High`] || 0;

              return (
                <div
                  key={game.id}
                  className={`arcade-card ${isSelected ? 'selected' : ''}`}
                  style={{ '--accent-grad': game.accent }}
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
                      {game.id === 'quiz' && !isSelected ? 'Customize' : 'Launch →'}
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
              <span className="drawer-badge">🧠 Quiz Settings</span>
              <h4>Configure Aptitude Challenge</h4>
            </div>

            {/* Difficulty */}
            <div className="section-block">
              <p className="section-label">Choose Difficulty</p>
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
              <p className="section-label">Pick Category</p>
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

            {/* Launch Quiz Button */}
            <button className="btn-start" onClick={onStartQuiz}>
              <span>Launch Quiz Challenge</span>
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
            <label>Total Runs</label>
          </div>
          <div className="stat-box">
            <span>{stats.bestStreak ?? 0}</span>
            <label>Best Streak</label>
          </div>
        </div>

      </div>
    </div>
  );
}
