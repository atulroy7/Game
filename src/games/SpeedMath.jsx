import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

function generateSpeedMathProblem() {
  const categories = ['percent', 'ratio', 'arithmetic', 'quick_root'];
  const cat = categories[Math.floor(Math.random() * categories.length)];
  let question = '';
  let answer = 0;
  let tag = '';

  if (cat === 'percent') {
    tag = 'Percentages';
    const percentPool = [10, 15, 20, 25, 30, 40, 50, 75];
    const p = percentPool[Math.floor(Math.random() * percentPool.length)];
    const base = (Math.floor(Math.random() * 18) + 2) * 20; // e.g. 40, 60, 80, 120...
    answer = (p * base) / 100;
    question = `What is ${p}% of ${base}?`;
  } else if (cat === 'ratio') {
    tag = 'Ratios';
    const r1 = Math.floor(Math.random() * 4) + 1;
    const r2 = Math.floor(Math.random() * 4) + r1 + 1;
    const multiplier = Math.floor(Math.random() * 8) + 4;
    const total = (r1 + r2) * multiplier;
    const askSmaller = Math.random() > 0.5;
    answer = askSmaller ? r1 * multiplier : r2 * multiplier;
    question = `Divide ${total} in ratio ${r1}:${r2}. Find ${askSmaller ? 'smaller' : 'larger'} part.`;
  } else if (cat === 'quick_root') {
    tag = 'Powers & Roots';
    const n = Math.floor(Math.random() * 15) + 6;
    if (Math.random() > 0.5) {
      question = `√${n * n} = ?`;
      answer = n;
    } else {
      const small = Math.floor(Math.random() * 8) + 12;
      question = `${small}² = ?`;
      answer = small * small;
    }
  } else {
    tag = 'Speed Arithmetic';
    const op = ['×', '÷', '+', '-'][Math.floor(Math.random() * 4)];
    if (op === '×') {
      const a = Math.floor(Math.random() * 15) + 11;
      const b = Math.floor(Math.random() * 8) + 4;
      question = `${a} × ${b} = ?`;
      answer = a * b;
    } else if (op === '÷') {
      const div = Math.floor(Math.random() * 8) + 3;
      answer = Math.floor(Math.random() * 20) + 12;
      const dividend = div * answer;
      question = `${dividend} ÷ ${div} = ?`;
    } else {
      const a = Math.floor(Math.random() * 80) + 45;
      const b = Math.floor(Math.random() * 60) + 25;
      question = `${a} + ${b} = ?`;
      answer = a + b;
    }
  }

  // Generate 4 distinct options
  const optionsSet = new Set([answer]);
  while (optionsSet.size < 4) {
    const delta = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1) * (answer > 100 ? 5 : 1);
    const fake = answer + delta;
    if (fake > 0 && fake !== answer) optionsSet.add(fake);
  }
  const options = Array.from(optionsSet);
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return { question, answer, options, tag };
}

export default function SpeedMath({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready');
  const [currentProblem, setCurrentProblem] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [solvedCount, setSolvedCount] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(40);

  const nextProblem = useCallback(() => {
    setCurrentProblem(generateSpeedMathProblem());
    setSelectedIdx(null);
  }, []);

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState('gameover');
    sound.playTimeout();
    if (onSaveScore) onSaveScore('speedMath', scoreRef.current);
  }, [sound, onSaveScore]);

  const startGame = () => {
    scoreRef.current = 0;
    timeLeftRef.current = 40;
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSolvedCount(0);
    setTimeLeft(40);
    setGameState('playing');
    nextProblem();
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

  const handleAnswer = (val, idx) => {
    if (selectedIdx !== null || gameState !== 'playing') return;
    setSelectedIdx(idx);

    if (val === currentProblem.answer) {
      sound.playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(b => Math.max(b, newStreak));
      setSolvedCount(c => c + 1);

      const mult = newStreak >= 6 ? 3 : newStreak >= 3 ? 2 : 1;
      const pts = 80 * mult;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);

      // +2s bonus
      timeLeftRef.current = Math.min(timeLeftRef.current + 2, 50);
      setTimeLeft(timeLeftRef.current);

      if (newStreak % 4 === 0) sound.playStreak();
      setTimeout(nextProblem, 400);
    } else {
      sound.playWrong();
      setStreak(0);
      // -3s penalty
      timeLeftRef.current = Math.max(0, timeLeftRef.current - 3);
      setTimeLeft(timeLeftRef.current);
      setTimeout(nextProblem, 600);
    }
  };

  return (
    <div className="screen mini-game-screen speedmath-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Top Nav */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">⚡ Speed Math</div>
        <div className={`timer-pill ${timeLeft <= 8 ? 'danger' : ''}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>
            Mental Sprint: Percentages &amp; Ratios
          </div>
          <h2>Speed Math Challenge</h2>
          <p className="ready-desc">
            Test your rapid mental calculation skills! Solve percentage shortcuts, ratio splits, and speed arithmetic against a ticking clock.
          </p>
          <div className="rules-grid">
            <div className="rule-item">⚡ 40 seconds initial speed blitz</div>
            <div className="rule-item">➕ Correct answers grant +2s bonus</div>
            <div className="rule-item">➖ Wrong answers incur -3s penalty</div>
            <div className="rule-item">🔥 Streak multipliers up to 3×</div>
          </div>
          <button className="btn-start-mini" style={{ background: 'var(--amber)' }} onClick={startGame}>
            <span>Start Sprint</span> →
          </button>
        </div>
      )}

      {gameState === 'playing' && currentProblem && (
        <div className="speedmath-play-area">
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
              <span className="lbl">Solved</span>
              <span className="val">{solvedCount}</span>
            </div>
          </div>

          <div className="speedmath-card">
            <div className="speedmath-tag">{currentProblem.tag}</div>
            <div className="speedmath-question">{currentProblem.question}</div>
          </div>

          <div className="speedmath-options-grid">
            {currentProblem.options.map((opt, i) => {
              const isSelected = selectedIdx === i;
              const isCorrect = opt === currentProblem.answer;
              let stateClass = '';
              if (selectedIdx !== null) {
                if (isSelected) stateClass = isCorrect ? 'opt-correct' : 'opt-wrong';
                else if (isCorrect) stateClass = 'opt-revealed';
              }

              return (
                <button
                  key={i}
                  className={`btn-speedmath-opt ${stateClass}`}
                  onClick={() => handleAnswer(opt, i)}
                  disabled={selectedIdx !== null}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal">
          {score >= 1000 && <Confetti />}
          <div className="gameover-icon">⚡</div>
          <h2>Sprint Finished!</h2>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Final Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{solvedCount}</span>
              <span className="m-lbl">Problems Solved</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{bestStreak}🔥</span>
              <span className="m-lbl">Best Streak</span>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-play-again" style={{ background: 'var(--amber)' }} onClick={startGame}>
              Sprint Again ↺
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
