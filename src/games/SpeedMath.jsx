import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

function generateProblem() {
  const types = ['add', 'sub', 'mul', 'missing', 'square'];
  const type = types[Math.floor(Math.random() * types.length)];
  let equation = '';
  let answer = 0;

  switch (type) {
    case 'add': {
      const a = Math.floor(Math.random() * 85) + 12;
      const b = Math.floor(Math.random() * 85) + 12;
      equation = `${a} + ${b}`;
      answer = a + b;
      break;
    }
    case 'sub': {
      const a = Math.floor(Math.random() * 90) + 25;
      const b = Math.floor(Math.random() * (a - 10)) + 5;
      equation = `${a} - ${b}`;
      answer = a - b;
      break;
    }
    case 'mul': {
      const a = Math.floor(Math.random() * 12) + 3;
      const b = Math.floor(Math.random() * 12) + 3;
      equation = `${a} × ${b}`;
      answer = a * b;
      break;
    }
    case 'missing': {
      const a = Math.floor(Math.random() * 40) + 10;
      const b = Math.floor(Math.random() * 40) + 10;
      const sum = a + b;
      equation = `${a} + ? = ${sum}`;
      answer = b;
      break;
    }
    case 'square': {
      const n = Math.floor(Math.random() * 10) + 4; // 4 to 13
      equation = `${n}²`;
      answer = n * n;
      break;
    }
    default:
      equation = '12 + 15';
      answer = 27;
  }

  // Generate 3 plausible distractors
  const distractors = new Set();
  while (distractors.size < 3) {
    const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? 1 : -1) * (type === 'mul' || type === 'square' ? 2 : 1);
    const d = answer + offset;
    if (d !== answer && d >= 0) {
      distractors.add(d);
    }
  }

  const options = [...distractors, answer].sort(() => 0.5 - Math.random());
  return { equation, answer, options };
}

export default function SpeedMath({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [timeLeft, setTimeLeft] = useState(40);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [overdrive, setOverdrive] = useState(0); // 0 to 100
  const [isOverdrive, setIsOverdrive] = useState(false);
  const [problem, setProblem] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);

  const timerRef = useRef(null);
  const overdriveTimerRef = useRef(null);
  const scoreRef = useRef(0);

  const nextProblem = useCallback(() => {
    setProblem(generateProblem());
  }, []);

  const startGame = () => {
    scoreRef.current = 0;
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setOverdrive(0);
    setIsOverdrive(false);
    setTotalSolved(0);
    setTimeLeft(40);
    setFeedback(null);
    setGameState('playing');
    nextProblem();
  };

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    clearTimeout(overdriveTimerRef.current);
    setGameState('gameover');
    sound.playTimeout();
    if (onSaveScore) onSaveScore('speedMath', scoreRef.current);
  }, [sound, onSaveScore]);

  // Main timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          endGame();
          return 0;
        }
        if (t <= 5) sound.playTick();
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState, endGame, sound]);

  // Handle Option Click
  const handleSelect = (selectedVal) => {
    if (gameState !== 'playing' || !problem) return;

    const isCorrect = selectedVal === problem.answer;

    if (isCorrect) {
      sound.playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(b => Math.max(b, newStreak));
      setTotalSolved(s => s + 1);

      // Overdrive gauge
      const nextOd = Math.min(overdrive + 25, 100);
      setOverdrive(nextOd);

      if (nextOd >= 100 && !isOverdrive) {
        // Trigger Overdrive Mode!
        setIsOverdrive(true);
        sound.playStreak();
        clearTimeout(overdriveTimerRef.current);
        overdriveTimerRef.current = setTimeout(() => {
          setIsOverdrive(false);
          setOverdrive(0);
        }, 8000);
      }

      const multiplier = isOverdrive ? 2.5 : newStreak >= 5 ? 1.5 : 1;
      const pts = Math.round(80 * multiplier);
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);
      setFeedback('correct');

      // Add time bonus
      setTimeLeft(t => Math.min(t + 1, 55));
    } else {
      sound.playWrong();
      setStreak(0);
      setOverdrive(Math.max(overdrive - 20, 0));
      setFeedback('wrong');
      // Deduct time
      setTimeLeft(t => Math.max(t - 3, 0));
    }

    setTimeout(() => {
      setFeedback(null);
      nextProblem();
    }, 160);
  };

  return (
    <div className={`screen mini-game-screen speedmath-screen ${isOverdrive ? 'overdrive-active' : ''}`}>
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Top Bar */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🔢 Speed Math Reactor</div>
        <div className={`timer-pill ${timeLeft <= 8 ? 'danger' : ''}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop">🔢 Arithmetic Overdrive</div>
          <h2>Speed Math Reactor</h2>
          <p className="ready-desc">
            High-octane mental arithmetic! Solve rapid calculations to charge the <strong>Overdrive Core</strong>. Reach 100% to unleash Frenzy Mode with 2.5× points!
          </p>
          <div className="rules-grid">
            <div className="rule-item">⚡ Rapid Addition, Multiples &amp; Squares</div>
            <div className="rule-item">🔥 Fill Overdrive gauge for 2.5× Frenzy</div>
            <div className="rule-item">⏱️ +1s per correct answer</div>
            <div className="rule-item">⚠️ -3s penalty for errors</div>
          </div>
          <button className="btn-start-mini" onClick={startGame}>
            <span>Ignite Reactor Core</span> →
          </button>
        </div>
      )}

      {gameState === 'playing' && problem && (
        <div className="speedmath-play-area">
          {/* HUD Bar */}
          <div className="hud-strip">
            <div className="hud-badge">
              <span className="lbl">Score</span>
              <span className="val">{score}</span>
            </div>
            <div className={`hud-badge ${isOverdrive ? 'frenzy' : ''}`}>
              <span className="lbl">Mode</span>
              <span className="val">{isOverdrive ? '⚡ OVERDRIVE 2.5×' : `🔥 Streak: ${streak}`}</span>
            </div>
            <div className="hud-badge">
              <span className="lbl">Solved</span>
              <span className="val">{totalSolved}</span>
            </div>
          </div>

          {/* Overdrive Meter Bar */}
          <div className="overdrive-meter-wrap">
            <div className="meter-label">
              <span>REACTOR ENERGY</span>
              <span className="meter-pct">{isOverdrive ? 'MAX OVERDRIVE 🔥' : `${overdrive}%`}</span>
            </div>
            <div className="meter-track">
              <div
                className={`meter-fill ${isOverdrive ? 'overdrive-pulse' : ''}`}
                style={{ width: `${isOverdrive ? 100 : overdrive}%` }}
              />
            </div>
          </div>

          {/* Problem Display */}
          <div className={`math-problem-box ${feedback ? `feedback-${feedback}` : ''}`}>
            <span className="math-equation">{problem.equation}</span>
          </div>

          {/* 4 Options */}
          <div className="math-options-grid">
            {problem.options.map((opt, i) => (
              <button
                key={i}
                className="btn-math-opt"
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal">
          {score >= 1200 && <Confetti />}
          <div className="gameover-icon">💥</div>
          <h2>Reactor Depleted!</h2>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Final Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{totalSolved}</span>
              <span className="m-lbl">Solved</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{bestStreak}🔥</span>
              <span className="m-lbl">Max Streak</span>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-play-again" onClick={startGame}>
              Recharge Core ↺
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
