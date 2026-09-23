import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const ROUND_TARGETS = [3.000, 5.000, 4.250];

function getAccuracyRank(deltaMs) {
  if (deltaMs <= 50)  return { label: '👑 Atomic Clock!', desc: 'Near-zero millisecond error!' };
  if (deltaMs <= 150) return { label: '🎯 Sharpshooter!', desc: 'Incredible internal tempo!' };
  if (deltaMs <= 350) return { label: '⚡ Rhythm Master!', desc: 'Great sense of time.' };
  if (deltaMs <= 700) return { label: '⏱️ Close Call!', desc: 'A bit early or late.' };
  return { label: '🌀 Time Dilated!', desc: 'Your mind wandered into another dimension.' };
}

export default function ChronoBeat({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'waiting' | 'running' | 'revealed' | 'gameover'
  const [round, setRound] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isBlinded, setIsBlinded] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [roundScores, setRoundScores] = useState([]);
  const [totalScore, setTotalScore] = useState(0);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const startTimestampRef = useRef(0);
  const animFrameRef = useRef(null);
  const scoreRef = useRef(0);

  const currentTarget = ROUND_TARGETS[round] || 5.000;

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const roundRef = useRef(round);
  roundRef.current = round;
  const currentTargetRef = useRef(currentTarget);
  currentTargetRef.current = currentTarget;

  // Immediate synchronous state synchronization
  const changeGameState = (nextState) => {
    gameStateRef.current = nextState;
    setGameState(nextState);
  };

  const startSession = useCallback(() => {
    scoreRef.current = 0;
    setTotalScore(0);
    setRoundScores([]);
    setRound(0);
    roundRef.current = 0;
    currentTargetRef.current = ROUND_TARGETS[0];
    changeGameState('waiting');
  }, []);

  // Start the timer for the current round
  const startTimer = useCallback(() => {
    if (gameStateRef.current !== 'waiting') return;
    changeGameState('running');
    sound.playTick();
    setIsBlinded(false);
    setElapsed(0);
    setRoundResult(null);

    const startTime = performance.now();
    startTimestampRef.current = startTime;

    const tick = () => {
      const now = performance.now();
      const currentSeconds = (now - startTime) / 1000;
      setElapsed(currentSeconds);

      // Blind the display after 1.2 seconds so player must rely on internal clock
      if (currentSeconds >= 1.2) {
        setIsBlinded(true);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [sound]);

  // Stop the timer and calculate accuracy
  const stopTimer = useCallback(() => {
    if (gameStateRef.current !== 'running') return;
    changeGameState('revealed');
    cancelAnimationFrame(animFrameRef.current);

    const finalTime = (performance.now() - startTimestampRef.current) / 1000;
    setElapsed(finalTime);
    setIsBlinded(false);

    const target = currentTargetRef.current;
    const delta = finalTime - target;
    const deltaMs = Math.round(Math.abs(delta) * 1000);

    // Accuracy formula: 100% at 0ms, drops linearly
    const accuracyPct = Math.max(0, Math.round((1 - Math.abs(delta) / target) * 1000) / 10);
    
    // Points: max 1000 pts
    const roundPts = Math.max(50, Math.round(1000 - deltaMs * 1.5));
    scoreRef.current += roundPts;
    setTotalScore(scoreRef.current);
    setLastPts(roundPts);
    setScoreTrigger(t => t + 1);

    const rank = getAccuracyRank(deltaMs);
    const resultObj = {
      target,
      stoppedAt: finalTime,
      delta,
      deltaMs,
      accuracyPct,
      pts: roundPts,
      rank,
    };

    setRoundResult(resultObj);
    setRoundScores(prev => [...prev, resultObj]);

    if (deltaMs <= 150) {
      sound.playChime();
    } else {
      sound.playMatch();
    }
  }, [sound]);

  // Proceed to next round or end game
  const handleNextRound = useCallback(() => {
    if (gameStateRef.current !== 'revealed') return;
    const nextRound = roundRef.current + 1;
    if (nextRound >= ROUND_TARGETS.length) {
      changeGameState('gameover');
      if (onSaveScore) onSaveScore('chronoBeat', scoreRef.current);
    } else {
      roundRef.current = nextRound;
      currentTargetRef.current = ROUND_TARGETS[nextRound];
      setRound(nextRound);
      changeGameState('waiting');
    }
  }, [onSaveScore]);

  // Global spacebar listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
        if (e.repeat) return; // Prevent key repeat when held down
        e.preventDefault();

        // Prevent space from re-activating any focused button
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }

        const currentSt = gameStateRef.current;
        if (currentSt === 'ready') {
          startSession();
        } else if (currentSt === 'waiting') {
          startTimer();
        } else if (currentSt === 'running') {
          // Require at least 80ms from start to avoid accidental micro-tap double fires
          if (performance.now() - startTimestampRef.current >= 80) {
            stopTimer();
          }
        } else if (currentSt === 'revealed') {
          handleNextRound();
        } else if (currentSt === 'gameover') {
          startSession();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startSession, startTimer, stopTimer, handleNextRound]);

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const averageAccuracy = roundScores.length > 0
    ? Math.round(roundScores.reduce((acc, r) => acc + r.accuracyPct, 0) / roundScores.length)
    : 0;

  return (
    <div className="screen mini-game-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Top Bar */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={() => {
          cancelAnimationFrame(animFrameRef.current);
          onBack();
        }}>← Hub</button>
        <div className="mini-game-title">⏱️ Chrono Beat</div>
        <div className="timer-pill">
          Round {Math.min(round + 1, 3)} / 3
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>
            Internal Clock Test
          </div>
          <h2>Chrono Beat</h2>
          <p className="ready-desc">
            Can your brain feel exact seconds? The timer will start ticking and then <strong>go blind</strong>! Use your internal tempo to tap STOP at the exact millisecond.
          </p>
          <div className="rules-grid">
            <div className="rule-item">⏱️ Target: e.g. 5.000 Seconds</div>
            <div className="rule-item">🙈 Counter blinds after 1.2s</div>
            <div className="rule-item">🎯 Millisecond Precision Scoring</div>
            <div className="rule-item">🏆 3 Progressive Challenge Rounds</div>
          </div>
          <button
            className="btn-start-mini"
            style={{ background: 'var(--amber)' }}
            onClick={(e) => { e.currentTarget.blur(); startSession(); }}
          >
            <span>Calibrate Internal Clock</span>
            <span className="chrono-hotkey-badge">SPACE</span>
          </button>
        </div>
      )}

      {(gameState === 'waiting' || gameState === 'running' || gameState === 'revealed') && (
        <div className="mini-game-play-area">
          {/* Target Card */}
          <div className="target-banner-card" style={{ borderColor: 'var(--amber)' }}>
            <span className="target-lbl" style={{ color: 'var(--amber)' }}>ROUND {round + 1} TARGET</span>
            <div className="target-number" style={{ color: 'var(--amber)' }}>
              {currentTarget.toFixed(3)}s
            </div>
            <p className="ready-desc" style={{ fontSize: '0.84rem', margin: 0 }}>
              {gameState === 'waiting'
                ? 'Press Space or Click Start to begin the clock!'
                : gameState === 'running' && isBlinded
                ? 'Counter is BLIND! Press Space or Click Stop!'
                : 'Counting up...'}
            </p>
          </div>

          {/* Big Time Display / Blind Orb */}
          <div className={`chrono-clock-circle ${isBlinded ? 'is-blinded' : ''}`}>
            {isBlinded ? (
              <div className="blind-tempo-pulse">
                <span className="blind-dots">?.???</span>
                <span className="blind-hint">Blind Beat • Rely on Instinct</span>
              </div>
            ) : (
              <div className="live-clock-digits">
                {elapsed.toFixed(3)}<span className="sec-unit">s</span>
              </div>
            )}
          </div>

          {/* Action Trigger Buttons */}
          <div className="chrono-actions-row">
            {gameState === 'waiting' && (
              <button
                className="btn-chrono-main btn-start-time"
                onClick={(e) => { e.currentTarget.blur(); startTimer(); }}
              >
                <span>▶ Start Timer</span>
                <span className="chrono-hotkey-badge">SPACE</span>
              </button>
            )}

            {gameState === 'running' && (
              <button
                className="btn-chrono-main btn-stop-time"
                onClick={(e) => { e.currentTarget.blur(); stopTimer(); }}
              >
                <span>⏹ STOP AT {currentTarget.toFixed(1)}s!</span>
                <span className="chrono-hotkey-badge">SPACE</span>
              </button>
            )}

            {gameState === 'revealed' && roundResult && (
              <div className="chrono-result-breakdown animate-pop">
                <div className="result-badge-pill" style={{ color: 'var(--amber)', background: 'var(--amber-soft)' }}>
                  {roundResult.rank.label}
                </div>
                <div className="result-diff-row">
                  <div className="diff-item">
                    <span className="d-lbl">You Stopped At</span>
                    <span className="d-val">{roundResult.stoppedAt.toFixed(3)}s</span>
                  </div>
                  <div className="diff-item">
                    <span className="d-lbl">Difference</span>
                    <span className={`d-val ${roundResult.deltaMs <= 150 ? 'good' : 'warn'}`}>
                      {roundResult.delta >= 0 ? `+${roundResult.deltaMs}ms` : `-${roundResult.deltaMs}ms`}
                    </span>
                  </div>
                  <div className="diff-item">
                    <span className="d-lbl">Accuracy</span>
                    <span className="d-val">{roundResult.accuracyPct}%</span>
                  </div>
                </div>
                <button
                  className="btn-chrono-main btn-next-time"
                  onClick={(e) => { e.currentTarget.blur(); handleNextRound(); }}
                >
                  <span>{round + 1 < ROUND_TARGETS.length ? 'Next Round →' : 'View Final Summary →'}</span>
                  <span className="chrono-hotkey-badge">SPACE</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal">
          {averageAccuracy >= 85 && <Confetti />}
          <div className="gameover-icon">⏱️</div>
          <h2>Clock Evaluation</h2>
          <p className="ready-desc">
            {averageAccuracy >= 95
              ? 'Astonishing! Your brain maintains atomic-clock internal precision.'
              : averageAccuracy >= 80
              ? 'Great rhythm! Your internal tempo is remarkably tuned.'
              : 'Fun attempt! Internal time perception is notoriously deceptive.'}
          </p>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{totalScore}</span>
              <span className="m-lbl">Total Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{averageAccuracy}%</span>
              <span className="m-lbl">Avg Accuracy</span>
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="btn-play-again"
              style={{ background: 'var(--amber)' }}
              onClick={(e) => { e.currentTarget.blur(); startSession(); }}
            >
              <span>Test Again ↺</span>
              <span className="chrono-hotkey-badge" style={{ marginLeft: 8 }}>SPACE</span>
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
