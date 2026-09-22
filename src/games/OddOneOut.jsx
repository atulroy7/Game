import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const ODD_ONE_DATA = [
  {
    category: 'Astronomy',
    items: ['Mercury', 'Venus', 'Mars', 'Moon'],
    odd: 'Moon',
    reason: 'The Moon is a natural satellite, while the others are planets orbiting the Sun.',
  },
  {
    category: 'Mathematics',
    items: ['17', '19', '23', '27'],
    odd: '27',
    reason: '27 is a composite number (3³ = 27), while 17, 19, and 23 are prime numbers.',
  },
  {
    category: 'Geometry',
    items: ['Hexagon', 'Pentagon', 'Cube', 'Octagon'],
    odd: 'Cube',
    reason: 'Cube is a 3-dimensional solid, whereas the others are 2-dimensional polygons.',
  },
  {
    category: 'Chemistry / Metallurgy',
    items: ['Copper', 'Silver', 'Gold', 'Bronze'],
    odd: 'Bronze',
    reason: 'Bronze is an alloy (copper + tin), while copper, silver, and gold are pure elemental metals.',
  },
  {
    category: 'Zoology',
    items: ['Eagle', 'Penguin', 'Ostrich', 'Kiwi'],
    odd: 'Eagle',
    reason: 'The Eagle can fly, whereas the Penguin, Ostrich, and Kiwi are flightless birds.',
  },
  {
    category: 'Number Theory',
    items: ['8', '27', '64', '100'],
    odd: '100',
    reason: '8 (2³), 27 (3³), and 64 (4³) are perfect cubes, while 100 is only a square (10²).',
  },
  {
    category: 'Geography',
    items: ['Canberra', 'Sydney', 'Ottawa', 'Tokyo'],
    odd: 'Sydney',
    reason: 'Sydney is a major city but not a national capital (Canberra is Australia’s capital).',
  },
  {
    category: 'Music',
    items: ['Guitar', 'Violin', 'Cello', 'Flute'],
    odd: 'Flute',
    reason: 'Flute is a woodwind instrument, while the others are string instruments.',
  },
  {
    category: 'Botany',
    items: ['Potato', 'Carrot', 'Ginger', 'Tomato'],
    odd: 'Tomato',
    reason: 'Tomato is a fruit that grows above ground, while potatoes, carrots, and ginger are underground tubers/roots.',
  },
  {
    category: 'Computer Science',
    items: ['Python', 'Java', 'HTML', 'C++'],
    odd: 'HTML',
    reason: 'HTML is a markup language, while Python, Java, and C++ are programming languages.',
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

export default function OddOneOut({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready');
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedItem, setSelectedItem] = useState(null);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(15);

  const current = ODD_ONE_DATA[qIdx % ODD_ONE_DATA.length];

  const shuffledItems = React.useMemo(() => {
    return shuffleArray(current.items);
  }, [current]);

  const nextQuestion = useCallback(() => {
    setQIdx(i => i + 1);
    setSelectedItem(null);
    timeLeftRef.current = 15;
    setTimeLeft(15);
  }, []);

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState('gameover');
    sound.playTimeout();
    if (onSaveScore) onSaveScore('oddOneOut', scoreRef.current);
  }, [sound, onSaveScore]);

  const startGame = () => {
    scoreRef.current = 0;
    setScore(0);
    setStreak(0);
    setSolved(0);
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
        if (next <= 4) sound.playTick();
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState, endGame, sound]);

  const handleSelect = (item) => {
    if (selectedItem !== null || gameState !== 'playing') return;
    setSelectedItem(item);

    if (item === current.odd) {
      sound.playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setSolved(s => s + 1);

      const mult = newStreak >= 4 ? 2 : 1;
      const pts = (100 + timeLeftRef.current * 5) * mult;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);

      setTimeout(nextQuestion, 900);
    } else {
      sound.playWrong();
      setStreak(0);
      setTimeout(nextQuestion, 1400);
    }
  };

  return (
    <div className="screen mini-game-screen odd-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🎯 Odd One Out</div>
        <div className={`timer-pill ${timeLeft <= 4 ? 'danger' : ''}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop" style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>
            Classification &amp; Observation
          </div>
          <h2>Odd One Out</h2>
          <p className="ready-desc">
            Spot the unique outlier! Examine taxonomic, mathematical, and geometric patterns to identify which item does not belong with the others.
          </p>
          <div className="rules-grid">
            <div className="rule-item">🎯 4 choices per round</div>
            <div className="rule-item">💡 Discover subtle shared properties</div>
            <div className="rule-item">⚡ 15s speed countdown</div>
            <div className="rule-item">🔥 Streak multipliers up to 2×</div>
          </div>
          <button className="btn-start-mini" style={{ background: 'var(--coral)' }} onClick={startGame}>
            <span>Start Observation</span> →
          </button>
        </div>
      )}

      {gameState === 'playing' && current && (
        <div className="odd-play-area">
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
              <span className="lbl">Identified</span>
              <span className="val">{solved}</span>
            </div>
          </div>

          <div className="odd-prompt-card">
            <span className="odd-category-tag">{current.category}</span>
            <h3>Which one does NOT belong?</h3>
          </div>

          {/* 4 Items Grid */}
          <div className="odd-items-grid">
            {shuffledItems.map((item, i) => {
              const isSelected = selectedItem === item;
              const isCorrect = item === current.odd;
              let stateClass = '';
              if (selectedItem !== null) {
                if (isSelected) stateClass = isCorrect ? 'odd-correct' : 'odd-wrong';
                else if (isCorrect) stateClass = 'odd-revealed';
              }

              return (
                <button
                  key={i}
                  className={`btn-odd-item ${stateClass}`}
                  onClick={() => handleSelect(item)}
                  disabled={selectedItem !== null}
                >
                  <span className="odd-item-name">{item}</span>
                </button>
              );
            })}
          </div>

          {selectedItem !== null && (
            <div className="odd-explanation-toast animate-pop">
              <strong>Why:</strong> {current.reason}
            </div>
          )}
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal">
          {score >= 800 && <Confetti />}
          <div className="gameover-icon">🎯</div>
          <h2>Classification Complete!</h2>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Final Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{solved}</span>
              <span className="m-lbl">Outliers Found</span>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-play-again" style={{ background: 'var(--coral)' }} onClick={startGame}>
              Play Again ↺
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
