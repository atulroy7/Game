import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const DIRECTIONS = [
  { key: 'UP',    symbol: '⬆️', opposite: 'DOWN',  label: 'UP' },
  { key: 'DOWN',  symbol: '⬇️', opposite: 'UP',    label: 'DOWN' },
  { key: 'LEFT',  symbol: '⬅️', opposite: 'RIGHT', label: 'LEFT' },
  { key: 'RIGHT', symbol: '➡️', opposite: 'LEFT',  label: 'RIGHT' },
];

export default function ArrowClash({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctHits, setCorrectHits] = useState(0);

  const [currentDir, setCurrentDir] = useState(DIRECTIONS[0]);
  const [mode, setMode] = useState('DIRECT'); // 'DIRECT' (same) or 'INVERTED' (opposite)
  const [modeCount, setModeCount] = useState(0);
  const [modeSwitchAlert, setModeSwitchAlert] = useState('');
  const [shake, setShake] = useState(false);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const modeRef = useRef('DIRECT');
  const timeLeftRef = useRef(30);

  // Spawn next arrow
  const nextArrow = useCallback(() => {
    const randomDir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    setCurrentDir(randomDir);

    // Switch mode every 4-5 answers to keep player on their toes
    setModeCount(prev => {
      const nextCount = prev + 1;
      if (nextCount >= 5) {
        const nextMode = modeRef.current === 'DIRECT' ? 'INVERTED' : 'DIRECT';
        modeRef.current = nextMode;
        setMode(nextMode);
        setModeSwitchAlert(`SWITCH TO ${nextMode}!`);
        sound.playPowerup();
        setTimeout(() => setModeSwitchAlert(''), 1200);
        return 0;
      }
      return nextCount;
    });
  }, [sound]);

  const startGame = () => {
    scoreRef.current = 0;
    modeRef.current = 'DIRECT';
    timeLeftRef.current = 30;
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectHits(0);
    setTimeLeft(30);
    setMode('DIRECT');
    setModeCount(0);
    setModeSwitchAlert('');
    setGameState('playing');
    nextArrow();
  };

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState('gameover');
    sound.playTimeout();
    if (onSaveScore) onSaveScore('arrowClash', scoreRef.current);
  }, [sound, onSaveScore]);

  // Timer loop (pure, no setStates within updaters)
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

  // Handle direction tap
  const handleDirectionPress = (selectedKey) => {
    if (gameState !== 'playing') return;

    const targetKey = mode === 'DIRECT' ? currentDir.key : currentDir.opposite;
    const isCorrect = selectedKey === targetKey;

    if (isCorrect) {
      sound.playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(b => Math.max(b, newStreak));
      setCorrectHits(c => c + 1);

      const multiplier = newStreak >= 8 ? 3 : newStreak >= 4 ? 2 : 1;
      const pts = 60 * multiplier;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);

      // +1s bonus
      timeLeftRef.current = Math.min(timeLeftRef.current + 1, 40);
      setTimeLeft(timeLeftRef.current);

      if (newStreak % 5 === 0) sound.playStreak();
    } else {
      sound.playWrong();
      setStreak(0);
      setShake(true);
      setTimeout(() => setShake(false), 300);
      // -2s penalty
      setTimeLeft(t => Math.max(0, t - 2));
    }

    nextArrow();
  };

  // Keyboard arrow keys listener
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp')    { e.preventDefault(); handleDirectionPress('UP'); }
      if (e.key === 'ArrowDown')  { e.preventDefault(); handleDirectionPress('DOWN'); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); handleDirectionPress('LEFT'); }
      if (e.key === 'ArrowRight') { e.preventDefault(); handleDirectionPress('RIGHT'); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentDir, mode, handleDirectionPress]);

  return (
    <div className="screen mini-game-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Top Bar */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🧭 Arrow Clash</div>
        <div className={`timer-pill ${timeLeft <= 7 ? 'danger' : ''}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop" style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>
            Cognitive Switch Reflex
          </div>
          <h2>Arrow Clash</h2>
          <p className="ready-desc">
            Your spatial reflexes will be tested! Follow the rule banner at the top — it dynamically flips between <strong>DIRECT</strong> and <strong>INVERTED</strong>!
          </p>
          <div className="rules-grid">
            <div className="rule-item">🟢 <strong>DIRECT</strong>: Tap SAME direction</div>
            <div className="rule-item">🔴 <strong>INVERTED</strong>: Tap OPPOSITE direction</div>
            <div className="rule-item">⌨️ Supports keyboard arrow keys</div>
            <div className="rule-item">🔥 Streak multipliers up to 3×</div>
          </div>
          <button
            className="btn-start-mini"
            style={{ background: 'var(--coral)' }}
            onClick={startGame}
          >
            <span>Start Arrow Reflex</span> →
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
              <span className="lbl">Solved</span>
              <span className="val">{correctHits}</span>
            </div>
          </div>

          {/* Dynamic Rule Banner */}
          <div className={`arrow-rule-banner ${mode === 'DIRECT' ? 'rule-direct' : 'rule-inverted'}`}>
            <span className="rule-badge">CURRENT RULE</span>
            <div className="rule-main">
              {mode === 'DIRECT' ? '🟢 TAP SAME DIRECTION' : '🔴 TAP OPPOSITE DIRECTION'}
            </div>
          </div>

          {/* Mode Switch Alert Toast */}
          {modeSwitchAlert && (
            <div className="mode-switch-toast animate-pop">
              ⚡ {modeSwitchAlert}
            </div>
          )}

          {/* Main Arrow Display */}
          <div className="arrow-display-card">
            <span className="big-arrow-symbol">{currentDir.symbol}</span>
          </div>

          {/* 4-Way D-Pad Buttons */}
          <div className="dpad-container">
            <div className="dpad-row dpad-top">
              <button className="btn-dpad" onClick={() => handleDirectionPress('UP')}>
                ⬆️
              </button>
            </div>
            <div className="dpad-row dpad-middle">
              <button className="btn-dpad" onClick={() => handleDirectionPress('LEFT')}>
                ⬅️
              </button>
              <div className="dpad-center-hub">🎯</div>
              <button className="btn-dpad" onClick={() => handleDirectionPress('RIGHT')}>
                ➡️
              </button>
            </div>
            <div className="dpad-row dpad-bottom">
              <button className="btn-dpad" onClick={() => handleDirectionPress('DOWN')}>
                ⬇️
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal">
          {score >= 1000 && <Confetti />}
          <div className="gameover-icon">🧭</div>
          <h2>Speed Run Complete!</h2>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Final Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{correctHits}</span>
              <span className="m-lbl">Correct Hits</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{bestStreak}🔥</span>
              <span className="m-lbl">Best Streak</span>
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
