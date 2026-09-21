import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const TARGET_GOALS = [8, 9, 10, 11, 12, 14, 15];

function randomNum() {
  return Math.floor(Math.random() * 8) + 1; // 1 to 8
}

function createBoard() {
  return Array.from({ length: 16 }, (_, i) => ({
    id: `tile-${i}-${Date.now()}-${Math.random()}`,
    val: randomNum(),
  }));
}

export default function SumDrop({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [matchesMade, setMatchesMade] = useState(0);

  const [target, setTarget] = useState(10);
  const [board, setBoard] = useState(createBoard);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);

  const pickNewTarget = () => {
    const next = TARGET_GOALS[Math.floor(Math.random() * TARGET_GOALS.length)];
    setTarget(next);
  };

  const startGame = () => {
    scoreRef.current = 0;
    streakRef.current = 0;
    bestStreakRef.current = 0;
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setMatchesMade(0);
    setTimeLeft(45);
    setSelectedIndices([]);
    setFeedback(null);
    setBoard(createBoard());
    pickNewTarget();
    setGameState('playing');
  };

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState('gameover');
    sound.playTimeout();
    if (onSaveScore) onSaveScore('sumDrop', scoreRef.current);
  }, [sound, onSaveScore]);

  // Timer loop
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

  // Handle tile tap
  const handleTileClick = (index) => {
    if (gameState !== 'playing' || feedback) return;

    sound.playFlip();

    // Toggle tile selection
    let nextSelected;
    if (selectedIndices.includes(index)) {
      nextSelected = selectedIndices.filter(i => i !== index);
    } else {
      nextSelected = [...selectedIndices, index];
    }
    setSelectedIndices(nextSelected);

    // Calculate current sum
    const currentSum = nextSelected.reduce((sum, idx) => sum + board[idx].val, 0);

    if (currentSum === target) {
      // MATCH!
      sound.playMatch();
      setFeedback('correct');

      streakRef.current += 1;
      const newStreak = streakRef.current;
      bestStreakRef.current = Math.max(bestStreakRef.current, newStreak);

      const multiplier = newStreak >= 5 ? 2 : 1;
      const pts = nextSelected.length * 50 * multiplier;
      scoreRef.current += pts;

      setScore(scoreRef.current);
      setStreak(newStreak);
      setBestStreak(bestStreakRef.current);
      setMatchesMade(m => m + 1);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);

      // +2s bonus time
      setTimeLeft(t => Math.min(t + 2, 50));

      setTimeout(() => {
        // Replace matched tiles with fresh numbers
        setBoard(prev => {
          const nextBoard = [...prev];
          nextSelected.forEach(idx => {
            nextBoard[idx] = {
              id: `tile-${idx}-${Date.now()}-${Math.random()}`,
              val: randomNum(),
            };
          });
          return nextBoard;
        });
        setSelectedIndices([]);
        setFeedback(null);
        pickNewTarget();
      }, 350);
    } else if (currentSum > target) {
      // OVER TARGET
      sound.playWrong();
      setFeedback('wrong');
      streakRef.current = 0;
      setStreak(0);

      setTimeout(() => {
        setSelectedIndices([]);
        setFeedback(null);
      }, 400);
    }
  };

  const currentSum = selectedIndices.reduce((sum, idx) => sum + board[idx].val, 0);

  return (
    <div className="screen mini-game-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Top Bar */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🔢 Sum Drop</div>
        <div className={`timer-pill ${timeLeft <= 8 ? 'danger' : ''}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop">Mental Math &amp; Puzzle</div>
          <h2>Sum Drop Puzzle</h2>
          <p className="ready-desc">
            Pick tiles from the 4×4 grid that add up to the <strong>Target Number</strong>! Matched tiles pop with score and reload new numbers.
          </p>
          <div className="rules-grid">
            <div className="rule-item">🎯 Match target sum (e.g. 10)</div>
            <div className="rule-item">⏱️ +2s time bonus per match</div>
            <div className="rule-item">🔥 2× score multiplier on 5+ streak</div>
            <div className="rule-item">🔄 New target on every match</div>
          </div>
          <button className="btn-start-mini" onClick={startGame}>
            <span>Start Sum Drop</span> →
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="mini-game-play-area">
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
              <span className="lbl">Cleared</span>
              <span className="val">{matchesMade}</span>
            </div>
          </div>

          {/* Target Banner */}
          <div className={`target-banner-card ${feedback ? `feedback-${feedback}` : ''}`}>
            <span className="target-lbl">TARGET SUM</span>
            <div className="target-number">{target}</div>
            <div className="current-sum-display">
              Selected Sum: <strong>{currentSum}</strong> / {target}
            </div>
          </div>

          {/* 4x4 Grid of Number Tiles */}
          <div className="sum-grid-4x4">
            {board.map((tile, idx) => {
              const isSelected = selectedIndices.includes(idx);
              return (
                <button
                  key={tile.id}
                  className={`sum-tile ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleTileClick(idx)}
                >
                  <span className="sum-val">{tile.val}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal">
          {score >= 1000 && <Confetti />}
          <div className="gameover-icon">🔢</div>
          <h2>Puzzle Complete!</h2>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{matchesMade}</span>
              <span className="m-lbl">Matches</span>
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
