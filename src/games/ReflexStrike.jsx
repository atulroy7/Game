import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

export default function ReflexStrike({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [bombsHit, setBombsHit] = useState(0);

  // 3x3 grid state: each cell has null | { type: 'target' | 'star' | 'bomb', id: number }
  const [grid, setGrid] = useState(Array(9).fill(null));
  const [shake, setShake] = useState(false);
  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const timerRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);
  const itemCounterRef = useRef(0);

  // Spawn random target or hazard on the grid
  const spawnItem = useCallback(() => {
    setGrid(prev => {
      // Find empty cells
      const emptyIndices = prev
        .map((val, idx) => (val === null ? idx : -1))
        .filter(idx => idx !== -1);

      if (emptyIndices.length === 0) return prev;

      const randomCell = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      const rand = Math.random();

      // 70% Target, 15% Star, 15% Bomb
      let type = 'target';
      if (rand < 0.15) type = 'star';
      else if (rand < 0.30) type = 'bomb';

      itemCounterRef.current += 1;
      const itemId = itemCounterRef.current;

      const next = [...prev];
      next[randomCell] = { type, id: itemId };

      // Auto-clear item after lifespan if not clicked
      const currentStreak = streakRef.current;
      const lifespan = Math.max(700, 1400 - currentStreak * 40);

      setTimeout(() => {
        setGrid(curr => {
          if (curr[randomCell]?.id === itemId) {
            const copy = [...curr];
            copy[randomCell] = null;
            return copy;
          }
          return curr;
        });
      }, lifespan);

      return next;
    });
  }, []);

  const startGame = () => {
    scoreRef.current = 0;
    streakRef.current = 0;
    bestStreakRef.current = 0;
    itemCounterRef.current = 0;
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setHits(0);
    setMisses(0);
    setBombsHit(0);
    setTimeLeft(30);
    setGrid(Array(9).fill(null));
    setGameState('playing');
  };

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    clearInterval(spawnTimerRef.current);
    setGameState('gameover');
    sound.playTimeout();
    if (onSaveScore) onSaveScore('reflexStrike', scoreRef.current);
  }, [sound, onSaveScore]);

  // Main countdown timer
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

    // Dynamic spawn interval
    spawnTimerRef.current = setInterval(() => {
      spawnItem();
    }, 650);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(spawnTimerRef.current);
    };
  }, [gameState, endGame, sound, spawnItem]);

  // Handle cell click
  const handleCellClick = (index) => {
    if (gameState !== 'playing') return;

    const item = grid[index];

    // Empty cell clicked = misclick
    if (!item) {
      setMisses(m => m + 1);
      streakRef.current = 0;
      setStreak(0);
      return;
    }

    // Remove item immediately
    setGrid(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });

    if (item.type === 'target') {
      sound.playCorrect();
      setHits(h => h + 1);
      streakRef.current += 1;
      const newStreak = streakRef.current;
      bestStreakRef.current = Math.max(bestStreakRef.current, newStreak);

      const multiplier = newStreak >= 10 ? 3 : newStreak >= 5 ? 2 : 1;
      const pts = 100 * multiplier;
      scoreRef.current += pts;

      setScore(scoreRef.current);
      setStreak(newStreak);
      setBestStreak(bestStreakRef.current);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);

      if (newStreak % 5 === 0) sound.playStreak();
    } else if (item.type === 'star') {
      sound.playMatch();
      setHits(h => h + 1);
      streakRef.current += 2;
      const newStreak = streakRef.current;
      bestStreakRef.current = Math.max(bestStreakRef.current, newStreak);

      const pts = 250;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setStreak(newStreak);
      setBestStreak(bestStreakRef.current);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);

      // +2s bonus time!
      setTimeLeft(t => Math.min(t + 2, 45));
    } else if (item.type === 'bomb') {
      sound.playWrong();
      setBombsHit(b => b + 1);
      streakRef.current = 0;
      setStreak(0);

      const penalty = 150;
      scoreRef.current = Math.max(0, scoreRef.current - penalty);
      setScore(scoreRef.current);

      setShake(true);
      setTimeout(() => setShake(false), 400);

      // -3s time penalty
      setTimeLeft(t => Math.max(0, t - 3));
    }
  };

  const multiplierText = streak >= 10 ? '3× Multiplier' : streak >= 5 ? '2× Multiplier' : '1×';

  return (
    <div className="screen mini-game-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Top Navigation */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🎯 Reflex Strike</div>
        <div className={`timer-pill ${timeLeft <= 8 ? 'danger' : ''}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop">Speed &amp; Precision</div>
          <h2>Reflex Strike</h2>
          <p className="ready-desc">
            Test your lightning reaction! Tap targets and bonus stars as fast as possible, but <strong>avoid the hazard bombs</strong>!
          </p>
          <div className="rules-grid">
            <div className="rule-item">🎯 <strong>Target</strong> (+100 pts)</div>
            <div className="rule-item">⭐ <strong>Star</strong> (+250 pts &amp; +2s)</div>
            <div className="rule-item">💣 <strong>Bomb</strong> (-150 pts &amp; -3s penalty)</div>
            <div className="rule-item">🔥 <strong>Streak Combos</strong> up to 3×</div>
          </div>
          <button className="btn-start-mini" onClick={startGame}>
            <span>Start Game</span> →
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className={`mini-game-play-area ${shake ? 'shake-fx' : ''}`}>
          {/* HUD Strip */}
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
              <span className="lbl">Combo</span>
              <span className="val">{multiplierText}</span>
            </div>
          </div>

          {/* 3x3 Reflex Board */}
          <div className="reflex-board">
            {grid.map((cell, idx) => (
              <button
                key={idx}
                className={`reflex-cell ${cell ? `has-${cell.type}` : 'is-empty'}`}
                onClick={() => handleCellClick(idx)}
              >
                {cell?.type === 'target' && <span className="cell-symbol target-icon">🎯</span>}
                {cell?.type === 'star'   && <span className="cell-symbol star-icon-pop">⭐</span>}
                {cell?.type === 'bomb'   && <span className="cell-symbol bomb-icon">💣</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal">
          {score >= 1200 && <Confetti />}
          <div className="gameover-icon">🏆</div>
          <h2>Time's Up!</h2>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Final Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{hits}</span>
              <span className="m-lbl">Targets Hit</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{bestStreak}🔥</span>
              <span className="m-lbl">Best Streak</span>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-play-again" onClick={startGame}>
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
