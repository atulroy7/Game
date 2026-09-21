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

export default function HomeScreen({ difficulty, setDifficulty, category, setCategory, onStart, stats }) {
  return (
    <div className="screen home-screen">
      <BgOrbs />
      <div className="home-content">

        {/* Logo */}
        <div className="logo-wrap">
          <span className="logo-icon">🧠</span>
          <h1 className="logo-title">Brain<span>Blitz</span></h1>
          <p className="logo-sub">Aptitude &amp; Reasoning Challenge</p>
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

        {/* Start */}
        <button className="btn-start" onClick={onStart}>
          <span>Start Game</span>
          <span className="btn-arrow">→</span>
        </button>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-box">
            <span>{stats.highScore ?? 0}</span>
            <label>Best Score</label>
          </div>
          <div className="stat-box">
            <span>{stats.gamesPlayed ?? 0}</span>
            <label>Games Played</label>
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
