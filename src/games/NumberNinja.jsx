import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

// Generate dynamic series questions
function generateSeriesQuestion(difficulty = 'medium') {
  const types = ['ap', 'diff_inc', 'fib', 'squares', 'alternating', 'geometric'];
  const type = types[Math.floor(Math.random() * types.length)];
  let sequence = [];
  let answer = 0;
  let ruleText = '';

  if (type === 'ap') {
    const start = Math.floor(Math.random() * 20) + 1;
    const diff = (Math.floor(Math.random() * 8) + 2) * (Math.random() > 0.3 ? 1 : -1);
    const len = 6;
    for (let i = 0; i < len; i++) sequence.push(start + i * diff);
    ruleText = diff > 0 ? `Add ${diff} each step` : `Subtract ${Math.abs(diff)} each step`;
  } else if (type === 'diff_inc') {
    const start = Math.floor(Math.random() * 15) + 1;
    const step = Math.floor(Math.random() * 3) + 2;
    sequence.push(start);
    let curr = start;
    let add = step;
    for (let i = 1; i < 6; i++) {
      curr += add;
      sequence.push(curr);
      add += step;
    }
    ruleText = `Differences increase by +${step}`;
  } else if (type === 'fib') {
    const a = Math.floor(Math.random() * 6) + 1;
    const b = Math.floor(Math.random() * 6) + a;
    sequence = [a, b];
    for (let i = 2; i < 6; i++) sequence.push(sequence[i - 1] + sequence[i - 2]);
    ruleText = 'Each term is the sum of the two preceding terms';
  } else if (type === 'squares') {
    const offset = Math.floor(Math.random() * 4);
    const shift = Math.floor(Math.random() * 3) - 1; // e.g. n^2 or n^2+1
    for (let i = 1 + offset; i <= 6 + offset; i++) sequence.push(i * i + shift);
    ruleText = shift === 0 ? 'Consecutive squares (n²)' : `Squares shifted by ${shift}`;
  } else if (type === 'alternating') {
    const start = Math.floor(Math.random() * 20) + 10;
    const add = Math.floor(Math.random() * 6) + 3;
    const sub = Math.floor(Math.random() * 3) + 1;
    sequence.push(start);
    let curr = start;
    for (let i = 1; i < 6; i++) {
      curr = i % 2 === 1 ? curr + add : curr - sub;
      sequence.push(curr);
    }
    ruleText = `Alternating +${add}, -${sub}`;
  } else {
    // Geometric
    const start = Math.floor(Math.random() * 4) + 2;
    const factor = Math.random() > 0.5 ? 2 : 3;
    let curr = start;
    sequence.push(curr);
    for (let i = 1; i < 6; i++) {
      curr *= factor;
      sequence.push(curr);
    }
    ruleText = `Multiply by ${factor} each step`;
  }

  // Choose which index to hide (index 3, 4, or 5)
  const hideIdx = Math.floor(Math.random() * 3) + 3;
  answer = sequence[hideIdx];
  const displaySequence = [...sequence];
  displaySequence[hideIdx] = '?';

  // Generate 4 distinct options
  const optionsSet = new Set([answer]);
  while (optionsSet.size < 4) {
    const offset = (Math.floor(Math.random() * 7) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const fake = answer + offset;
    if (fake > 0 && fake !== answer) optionsSet.add(fake);
  }
  const options = Array.from(optionsSet);
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return { sequence: displaySequence, answer, options, ruleText, hideIdx };
}

export default function NumberNinja({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [qData, setQData] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(15);
  const [slicedIdx, setSlicedIdx] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(15);

  const nextQuestion = useCallback(() => {
    setQData(generateSeriesQuestion());
    setSlicedIdx(null);
    setIsCorrect(null);
    timeLeftRef.current = 15;
    setTimeLeft(15);
  }, []);

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState('gameover');
    sound.playTimeout();
    if (onSaveScore) onSaveScore('numberNinja', scoreRef.current);
  }, [sound, onSaveScore]);

  const startGame = () => {
    scoreRef.current = 0;
    timeLeftRef.current = 15;
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setRound(1);
    setGameState('playing');
    nextQuestion();
  };

  // Timer countdown
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

  const handleSlash = (val, idx) => {
    if (slicedIdx !== null || gameState !== 'playing') return;
    setSlicedIdx(idx);

    if (val === qData.answer) {
      sound.playCorrect();
      setIsCorrect(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(b => Math.max(b, newStreak));

      const mult = newStreak >= 5 ? 3 : newStreak >= 3 ? 2 : 1;
      const speedBonus = timeLeftRef.current * 8;
      const pts = (100 + speedBonus) * mult;

      scoreRef.current += pts;
      setScore(scoreRef.current);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);

      if (newStreak % 3 === 0) sound.playStreak();

      setTimeout(() => {
        setRound(r => r + 1);
        nextQuestion();
      }, 700);
    } else {
      sound.playWrong();
      setIsCorrect(false);
      setStreak(0);
      setTimeout(() => {
        setRound(r => r + 1);
        nextQuestion();
      }, 900);
    }
  };

  return (
    <div className="screen mini-game-screen ninja-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Top Bar */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🥷 Number Ninja</div>
        <div className={`timer-pill ${timeLeft <= 5 ? 'danger' : ''}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop" style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>
            Mental Patterns &amp; Calculation
          </div>
          <h2>Number Ninja</h2>
          <p className="ready-desc">
            Slice the missing number in arithmetic, geometric, and alternating series patterns. Fast slashes award combo multiplier points!
          </p>
          <div className="rules-grid">
            <div className="rule-item">🔢 Identify number series pattern</div>
            <div className="rule-item">⚔️ Slash the correct missing number</div>
            <div className="rule-item">⚡ Faster answers grant speed bonuses</div>
            <div className="rule-item">🔥 Streaks multiply your score up to 3×</div>
          </div>
          <button className="btn-start-mini" style={{ background: 'var(--coral)' }} onClick={startGame}>
            <span>Enter Ninja Arena</span> →
          </button>
        </div>
      )}

      {gameState === 'playing' && qData && (
        <div className="ninja-play-area">
          {/* HUD */}
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

          {/* Series Scroll Display */}
          <div className="ninja-scroll-container">
            <div className="ninja-scroll-banner">
              <span className="scroll-hint-tag">NUMBER SERIES</span>
              <div className="series-tiles-row">
                {qData.sequence.map((num, i) => (
                  <div
                    key={i}
                    className={`series-tile ${num === '?' ? 'mystery-tile' : ''}`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Slicing Answer Options */}
          <div className="ninja-options-grid">
            {qData.options.map((opt, i) => {
              const isSelected = slicedIdx === i;
              let stateClass = '';
              if (isSelected) {
                stateClass = isCorrect ? 'sliced-correct' : 'sliced-wrong';
              } else if (slicedIdx !== null && opt === qData.answer) {
                stateClass = 'revealed-correct';
              }

              return (
                <button
                  key={i}
                  className={`ninja-slice-btn ${stateClass}`}
                  onClick={() => handleSlash(opt, i)}
                  disabled={slicedIdx !== null}
                >
                  <span className="slice-slash-line" />
                  <span className="opt-val">{opt}</span>
                  <span className="ninja-blade-icon">⚔️</span>
                </button>
              );
            })}
          </div>

          {/* Rule feedback revealed on answer */}
          {slicedIdx !== null && (
            <div className="ninja-rule-reveal animate-pop">
              <strong>Pattern:</strong> {qData.ruleText}
            </div>
          )}
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal">
          {score >= 800 && <Confetti />}
          <div className="gameover-icon">🥷</div>
          <h2>Ninja Training Finished!</h2>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Final Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{round - 1}</span>
              <span className="m-lbl">Series Solved</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{bestStreak}🔥</span>
              <span className="m-lbl">Best Streak</span>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-play-again" style={{ background: 'var(--coral)' }} onClick={startGame}>
              Train Again ↺
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
