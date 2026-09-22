import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

// Generate Direction Sense challenges
const DIRECTION_PROBLEMS = [
  {
    story: 'You start at Point A facing North. Walk 4m forward, turn 90° right, walk 3m, then turn 90° right and walk 4m.',
    question: 'How far and in which direction are you from Point A?',
    answer: '3m East',
    options: ['3m West', '3m East', '7m North', '4m South'],
  },
  {
    story: 'A drone flies 10km South, turns 90° left and flies 6km East, then turns 90° left and flies 10km North.',
    question: 'In which direction is the drone from its takeoff pad?',
    answer: 'East',
    options: ['West', 'North-East', 'East', 'South-East'],
  },
  {
    story: 'Facing East, you turn 45° clockwise, then 180° counter-clockwise, then 90° clockwise.',
    question: 'Which cardinal direction are you now facing?',
    answer: 'North-East',
    options: ['North-West', 'South-East', 'South-West', 'North-East'],
  },
  {
    story: 'John walks 5km North. He turns left and walks 10km, then turns left again and walks 5km.',
    question: 'How far is John from his starting point?',
    answer: '10km',
    options: ['15km', '10km', '5km', '20km'],
  },
  {
    story: 'Facing West, you turn 90° clockwise, then 180° counter-clockwise, then 45° clockwise.',
    question: 'Which direction are you facing?',
    answer: 'South-West',
    options: ['South-East', 'South-West', 'North-West', 'North'],
  },
  {
    story: 'You travel 12m West, turn left and travel 5m South.',
    question: 'What is the shortest direct distance back to your start point?',
    answer: '13m (Pythagoras)',
    options: ['17m', '15m', '13m (Pythagoras)', '11m'],
  },
  {
    story: 'A ship sails 8km East, turns North and sails 6km.',
    question: 'What is the direct line-of-sight distance back to the port?',
    answer: '10km',
    options: ['14km', '12km', '8km', '10km'],
  },
  {
    story: 'At sunset, you stand facing your shadow.',
    question: 'Which direction are you facing?',
    answer: 'East',
    options: ['West', 'East', 'North', 'South'],
  },
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function BrainMaze({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready');
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [selectedOpt, setSelectedOpt] = useState(null);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(25);

  const current = DIRECTION_PROBLEMS[qIdx % DIRECTION_PROBLEMS.length];

  const shuffledOptions = React.useMemo(() => {
    return shuffleArray(current.options);
  }, [current]);

  const nextQuestion = useCallback(() => {
    setQIdx(i => i + 1);
    setSelectedOpt(null);
    timeLeftRef.current = 25;
    setTimeLeft(25);
  }, []);

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState('gameover');
    sound.playTimeout();
    if (onSaveScore) onSaveScore('brainMaze', scoreRef.current);
  }, [sound, onSaveScore]);

  const startGame = () => {
    scoreRef.current = 0;
    setScore(0);
    setStreak(0);
    setQIdx(0);
    setGameState('playing');
    nextQuestion();
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
        if (next <= 5) sound.playTick();
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState, endGame, sound]);

  const handleSelect = (opt) => {
    if (selectedOpt !== null || gameState !== 'playing') return;
    setSelectedOpt(opt);

    if (opt === current.answer) {
      sound.playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);
      const mult = newStreak >= 3 ? 2 : 1;
      const pts = (100 + timeLeftRef.current * 4) * mult;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);
      setTimeout(nextQuestion, 700);
    } else {
      sound.playWrong();
      setStreak(0);
      setTimeout(nextQuestion, 1100);
    }
  };

  return (
    <div className="screen mini-game-screen maze-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🌀 Brain Maze</div>
        <div className={`timer-pill ${timeLeft <= 6 ? 'danger' : ''}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop" style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>
            Spatial Direction &amp; Orientation
          </div>
          <h2>Brain Maze</h2>
          <p className="ready-desc">
            Test your mental compass and spatial orientation! Track multi-step turns, distance vectors, and angles in your mind to deduce coordinates.
          </p>
          <div className="rules-grid">
            <div className="rule-item">🧭 Compass navigation &amp; turns</div>
            <div className="rule-item">📐 Vector displacement &amp; Pythagoras</div>
            <div className="rule-item">⚡ 25 seconds per spatial puzzle</div>
            <div className="rule-item">🔥 Streak bonuses for quick deduction</div>
          </div>
          <button className="btn-start-mini" style={{ background: 'var(--coral)' }} onClick={startGame}>
            <span>Enter Maze</span> →
          </button>
        </div>
      )}

      {gameState === 'playing' && current && (
        <div className="maze-play-area">
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
              <span className="lbl">Sector</span>
              <span className="val">#{qIdx + 1}</span>
            </div>
          </div>

          {/* Direction Compass Visual */}
          <div className="maze-compass-container">
            <svg width="120" height="120" viewBox="0 0 120 120" className="maze-compass-svg">
              <circle cx="60" cy="60" r="50" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
              <line x1="60" y1="15" x2="60" y2="105" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="15" y1="60" x2="105" y2="60" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* Compass points */}
              <text x="60" y="28" fill="var(--coral)" fontSize="13" fontWeight="900" textAnchor="middle">N</text>
              <text x="60" y="100" fill="var(--muted)" fontSize="11" fontWeight="800" textAnchor="middle">S</text>
              <text x="100" y="64" fill="var(--muted)" fontSize="11" fontWeight="800" textAnchor="middle">E</text>
              <text x="20" y="64" fill="var(--muted)" fontSize="11" fontWeight="800" textAnchor="middle">W</text>

              {/* Needle */}
              <polygon points="60,35 65,60 55,60" fill="var(--coral)" />
              <polygon points="60,85 65,60 55,60" fill="var(--muted)" />
              <circle cx="60" cy="60" r="4" fill="var(--primary)" />
            </svg>
          </div>

          {/* Scenario Dossier */}
          <div className="maze-story-card">
            <div className="story-txt">{current.story}</div>
            <div className="question-txt">🎯 {current.question}</div>
          </div>

          {/* Options */}
          <div className="maze-options-grid">
            {shuffledOptions.map((opt, i) => {
              const isSelected = selectedOpt === opt;
              const isCorrect = opt === current.answer;
              let stateClass = '';
              if (selectedOpt !== null) {
                if (isSelected) stateClass = isCorrect ? 'maze-opt-correct' : 'maze-opt-wrong';
                else if (isCorrect) stateClass = 'maze-opt-revealed';
              }

              return (
                <button
                  key={i}
                  className={`btn-maze-opt ${stateClass}`}
                  onClick={() => handleSelect(opt)}
                  disabled={selectedOpt !== null}
                >
                  <span className="opt-letter-tag">{['A', 'B', 'C', 'D'][i]}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal">
          {score >= 800 && <Confetti />}
          <div className="gameover-icon">🌀</div>
          <h2>Maze Explored!</h2>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Final Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{qIdx}</span>
              <span className="m-lbl">Paths Solved</span>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-play-again" style={{ background: 'var(--coral)' }} onClick={startGame}>
              Re-enter Maze ↺
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
