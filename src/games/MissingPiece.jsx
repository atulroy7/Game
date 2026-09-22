import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

// Generate visual matrix puzzles
function generateMatrixPuzzle(level = 1) {
  const puzzleTypes = ['rotation', 'counting', 'fill_progression', 'shape_fusion'];
  const type = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];

  let matrix = []; // 9 items: 0..8
  let correctOption = null;
  let options = [];
  let explanation = '';

  if (type === 'rotation') {
    // A pointer/arrow or asymmetric shape rotating
    const baseAngles = [0, 45, 90, 135, 180, 225, 270, 315];
    const startAngle = baseAngles[Math.floor(Math.random() * baseAngles.length)];
    const step = [45, 90][Math.floor(Math.random() * 2)];

    for (let i = 0; i < 9; i++) {
      const angle = (startAngle + i * step) % 360;
      matrix.push({ type: 'arrow', angle, color: 'var(--coral)' });
    }
    correctOption = { ...matrix[8] };
    explanation = `The arrow rotates clockwise by ${step}° at each position.`;

    // Distractors
    options.push(correctOption);
    while (options.length < 4) {
      const fakeAngle = (correctOption.angle + [45, 90, 180, 270][Math.floor(Math.random() * 4)]) % 360;
      if (!options.some(o => o.angle === fakeAngle)) {
        options.push({ type: 'arrow', angle: fakeAngle, color: 'var(--coral)' });
      }
    }
  } else if (type === 'counting') {
    // Count of dots/squares increases row by row or col by col
    const shapes = ['circle', 'diamond'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const count = r + c + 1; // 1 to 5
        matrix.push({ type: 'count', shape, count, color: 'var(--mint)' });
      }
    }
    correctOption = { ...matrix[8] }; // count = 2+2+1 = 5
    explanation = 'The number of elements equals row index + column index + 1.';

    options.push(correctOption);
    while (options.length < 4) {
      const fakeCount = [2, 3, 4, 6][Math.floor(Math.random() * 4)];
      if (!options.some(o => o.count === fakeCount)) {
        options.push({ type: 'count', shape, count: fakeCount, color: 'var(--mint)' });
      }
    }
  } else if (type === 'fill_progression') {
    // Circle with slices filled
    const fills = [1, 2, 3, 2, 3, 4, 3, 4, 5];
    for (let i = 0; i < 9; i++) {
      matrix.push({ type: 'pie', slices: fills[i], color: 'var(--amber)' });
    }
    correctOption = { ...matrix[8] }; // slices = 5
    explanation = 'The number of shaded segments increases by 1 across rows and columns.';

    options.push(correctOption);
    while (options.length < 4) {
      const fake = [2, 3, 4, 6][Math.floor(Math.random() * 4)];
      if (!options.some(o => o.slices === fake)) {
        options.push({ type: 'pie', slices: fake, color: 'var(--amber)' });
      }
    }
  } else {
    // Shape fusion (outer shape + inner shape)
    const outers = ['square', 'circle', 'triangle'];
    const inners = ['plus', 'cross', 'dot'];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        matrix.push({
          type: 'fusion',
          outer: outers[r],
          inner: inners[c],
          color: 'var(--violet)',
        });
      }
    }
    correctOption = { ...matrix[8] };
    explanation = 'Outer shape is determined by the row; inner symbol is determined by the column.';

    options.push(correctOption);
    while (options.length < 4) {
      const fakeOuter = outers[Math.floor(Math.random() * 3)];
      const fakeInner = inners[Math.floor(Math.random() * 3)];
      if (!options.some(o => o.outer === fakeOuter && o.inner === fakeInner)) {
        options.push({ type: 'fusion', outer: fakeOuter, inner: fakeInner, color: 'var(--violet)' });
      }
    }
  }

  // Shuffle options with Fisher-Yates
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return { matrix, correctOption, options, explanation };
}

// Render SVG graphic for a tile
function MatrixTileGraphic({ tile, size = 64 }) {
  if (!tile) return null;

  if (tile.type === 'arrow') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <g transform={`rotate(${tile.angle} 50 50)`}>
          <line x1="50" y1="80" x2="50" y2="25" stroke={tile.color} strokeWidth="6" strokeLinecap="round" />
          <polygon points="50,15 35,35 65,35" fill={tile.color} />
          <circle cx="50" cy="80" r="6" fill={tile.color} />
        </g>
      </svg>
    );
  }

  if (tile.type === 'count') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <rect x="5" y="5" width="90" height="90" rx="8" fill="none" stroke="var(--border)" strokeWidth="2" />
        {Array.from({ length: tile.count }).map((_, i) => {
          const spacing = 90 / (tile.count + 1);
          const cx = 5 + (i + 1) * spacing;
          return tile.shape === 'circle' ? (
            <circle key={i} cx={cx} cy="50" r="7" fill={tile.color} />
          ) : (
            <polygon key={i} points={`${cx},42 ${cx+7},50 ${cx},58 ${cx-7},50`} fill={tile.color} />
          );
        })}
      </svg>
    );
  }

  if (tile.type === 'pie') {
    // 6-slice pie chart
    const totalSlices = 6;
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="38" fill="var(--surface2)" stroke="var(--border)" strokeWidth="2" />
        {Array.from({ length: tile.slices }).map((_, i) => {
          const a1 = (i * 360) / totalSlices;
          const a2 = ((i + 1) * 360) / totalSlices;
          const rad1 = (a1 * Math.PI) / 180;
          const rad2 = (a2 * Math.PI) / 180;
          const x1 = 50 + 38 * Math.cos(rad1);
          const y1 = 50 + 38 * Math.sin(rad1);
          const x2 = 50 + 38 * Math.cos(rad2);
          const y2 = 50 + 38 * Math.sin(rad2);
          return (
            <path
              key={i}
              d={`M50,50 L${x1},${y1} A38,38 0 0,1 ${x2},${y2} Z`}
              fill={tile.color}
              stroke="var(--surface)"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    );
  }

  if (tile.type === 'fusion') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Outer */}
        {tile.outer === 'square' && (
          <rect x="18" y="18" width="64" height="64" rx="6" fill="none" stroke={tile.color} strokeWidth="4" />
        )}
        {tile.outer === 'circle' && (
          <circle cx="50" cy="50" r="32" fill="none" stroke={tile.color} strokeWidth="4" />
        )}
        {tile.outer === 'triangle' && (
          <polygon points="50,16 84,78 16,78" fill="none" stroke={tile.color} strokeWidth="4" />
        )}

        {/* Inner */}
        {tile.inner === 'plus' && (
          <g stroke={tile.color} strokeWidth="4" strokeLinecap="round">
            <line x1="50" y1="36" x2="50" y2="64" />
            <line x1="36" y1="50" x2="64" y2="50" />
          </g>
        )}
        {tile.inner === 'cross' && (
          <g stroke={tile.color} strokeWidth="4" strokeLinecap="round">
            <line x1="38" y1="38" x2="62" y2="62" />
            <line x1="62" y1="38" x2="38" y2="62" />
          </g>
        )}
        {tile.inner === 'dot' && (
          <circle cx="50" cy="50" r="9" fill={tile.color} />
        )}
      </svg>
    );
  }

  return null;
}

export default function MissingPiece({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready');
  const [puzzle, setPuzzle] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(20);
  const [revealed, setRevealed] = useState(false);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(20);

  const nextPuzzle = useCallback(() => {
    setPuzzle(generateMatrixPuzzle());
    setSelectedIdx(null);
    setRevealed(false);
    timeLeftRef.current = 20;
    setTimeLeft(20);
  }, []);

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState('gameover');
    sound.playTimeout();
    if (onSaveScore) onSaveScore('missingPiece', scoreRef.current);
  }, [sound, onSaveScore]);

  const startGame = () => {
    scoreRef.current = 0;
    setScore(0);
    setStreak(0);
    setRound(1);
    setGameState('playing');
    nextPuzzle();
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      const next = timeLeftRef.current - 1;
      if (next <= 0) {
        timeLeftRef.current = 0;
        setTimeLeft(0);
        endGame();
      } else {
        timeLeftRef.current = next;
        setTimeLeft(next);
        if (next <= 3) sound.playTick();
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState, endGame, sound]);

  const handleSelectOption = (option, idx) => {
    if (selectedIdx !== null || gameState !== 'playing') return;
    setSelectedIdx(idx);
    setRevealed(true);

    const isMatch = JSON.stringify(option) === JSON.stringify(puzzle.correctOption);

    if (isMatch) {
      sound.playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);
      const mult = newStreak >= 4 ? 2 : 1;
      const pts = (120 + timeLeftRef.current * 5) * mult;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);

      setTimeout(() => {
        setRound(r => r + 1);
        nextPuzzle();
      }, 1000);
    } else {
      sound.playWrong();
      setStreak(0);
      setTimeout(() => {
        setRound(r => r + 1);
        nextPuzzle();
      }, 1400);
    }
  };

  return (
    <div className="screen mini-game-screen matrix-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Nav */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🧩 Missing Piece</div>
        <div className={`timer-pill ${timeLeft <= 5 ? 'danger' : ''}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop" style={{ background: 'var(--mint-soft)', color: 'var(--mint)' }}>
            Raven Matrix Visual Reasoning
          </div>
          <h2>Missing Piece</h2>
          <p className="ready-desc">
            Analyze the 3×3 matrix of geometric shapes. Discover the horizontal and vertical transformation rules to select the missing 9th tile!
          </p>
          <div className="rules-grid">
            <div className="rule-item">🔍 Examine row &amp; column rules</div>
            <div className="rule-item">🔄 Rotation, counting &amp; shape fusion</div>
            <div className="rule-item">⚡ 20 seconds per visual puzzle</div>
            <div className="rule-item">🔥 Streak bonuses for quick answers</div>
          </div>
          <button className="btn-start-mini" style={{ background: 'var(--mint)' }} onClick={startGame}>
            <span>Start Matrix Puzzle</span> →
          </button>
        </div>
      )}

      {gameState === 'playing' && puzzle && (
        <div className="matrix-play-area">
          <div className="hud-strip">
            <div className="hud-badge">
              <span className="lbl">Score</span>
              <span className="val">{score}</span>
            </div>
            <div className="hud-badge">
              <span className="lbl">Streak</span>
              <span className="val">🔥 {streak}</span>
            </div>
            <div className="hud-badge">
              <span className="lbl">Round</span>
              <span className="val">#{round}</span>
            </div>
          </div>

          {/* 3x3 Matrix Grid */}
          <div className="matrix-3x3-wrapper">
            <div className="matrix-3x3-grid">
              {puzzle.matrix.map((tile, i) => (
                <div
                  key={i}
                  className={`matrix-tile ${i === 8 ? 'tile-missing' : ''}`}
                >
                  {i === 8 ? (
                    <span className="missing-qm">?</span>
                  ) : (
                    <MatrixTileGraphic tile={tile} size={70} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4 Answer Candidates */}
          <div className="matrix-candidates-header">Choose the Missing Tile:</div>
          <div className="matrix-candidates-grid">
            {puzzle.options.map((opt, i) => {
              const isSelected = selectedIdx === i;
              const isCorrect = JSON.stringify(opt) === JSON.stringify(puzzle.correctOption);
              let stateClass = '';
              if (revealed) {
                if (isSelected) stateClass = isCorrect ? 'candidate-correct' : 'candidate-wrong';
                else if (isCorrect) stateClass = 'candidate-revealed';
              }

              return (
                <button
                  key={i}
                  className={`matrix-candidate-btn ${stateClass}`}
                  onClick={() => handleSelectOption(opt, i)}
                  disabled={revealed}
                >
                  <MatrixTileGraphic tile={opt} size={60} />
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className="matrix-rule-reveal animate-pop">
              💡 {puzzle.explanation}
            </div>
          )}
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal">
          {score >= 800 && <Confetti />}
          <div className="gameover-icon">🧩</div>
          <h2>Matrix Assessment Complete!</h2>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Final Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{round - 1}</span>
              <span className="m-lbl">Puzzles Solved</span>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-play-again" style={{ background: 'var(--mint)' }} onClick={startGame}>
              Try Again ↺
            </button>
            <button className="btn-hub" onClick={onBack}>
              Arcade Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
