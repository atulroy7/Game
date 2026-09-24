import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const ROUND_TARGETS = [3.000, 5.000, 4.250];
const PVP_TARGETS = [3.000, 5.000, 4.250, 3.500, 6.000];
const PVP_TARGET_WINS = 2; // Best of 3 (first to 2 wins)

function getAccuracyRank(deltaMs) {
  if (deltaMs <= 50)  return { label: '👑 Atomic Clock!', desc: 'Near-zero millisecond error!' };
  if (deltaMs <= 150) return { label: '🎯 Sharpshooter!', desc: 'Incredible internal tempo!' };
  if (deltaMs <= 350) return { label: '⚡ Rhythm Master!', desc: 'Great sense of time.' };
  if (deltaMs <= 700) return { label: '⏱️ Close Call!', desc: 'A bit early or late.' };
  return { label: '🌀 Time Dilated!', desc: 'Your mind wandered into another dimension.' };
}

export default function ChronoBeat({ sound, onBack, onSaveScore }) {
  // Mode: 'solo' | 'pvp'
  const [mode, setMode] = useState('solo');

  // ── Solo Mode State ──
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'waiting' | 'running' | 'revealed' | 'gameover'
  const [round, setRound] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isBlinded, setIsBlinded] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [roundScores, setRoundScores] = useState([]);
  const [totalScore, setTotalScore] = useState(0);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  // ── 1v1 PvP Mode State ──
  const [p1Name, setP1Name] = useState('Player 1');
  const [p2Name, setP2Name] = useState('Player 2');
  const [pvpState, setPvpState] = useState('ready'); // 'ready' | 'waiting' | 'running' | 'revealed' | 'gameover'
  const [pvpRound, setPvpRound] = useState(0);
  const [pvpWins, setPvpWins] = useState({ p1: 0, p2: 0 });
  const [p1Result, setP1Result] = useState(null);
  const [p2Result, setP2Result] = useState(null);
  const [pvpRoundWinner, setPvpRoundWinner] = useState(null); // 'p1' | 'p2' | 'tie'
  const [pvpHistory, setPvpHistory] = useState([]);

  // Shared refs
  const startTimestampRef = useRef(0);
  const animFrameRef = useRef(null);
  const scoreRef = useRef(0);

  const currentTarget = mode === 'pvp' 
    ? (PVP_TARGETS[pvpRound] || 5.000)
    : (ROUND_TARGETS[round] || 5.000);

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const roundRef = useRef(round);
  roundRef.current = round;

  const pvpStateRef = useRef(pvpState);
  pvpStateRef.current = pvpState;
  const pvpRoundRef = useRef(pvpRound);
  pvpRoundRef.current = pvpRound;
  const pvpWinsRef = useRef(pvpWins);
  pvpWinsRef.current = pvpWins;

  const currentTargetRef = useRef(currentTarget);
  currentTargetRef.current = currentTarget;

  const p1ResultRef = useRef(null);
  const p2ResultRef = useRef(null);

  // ─────────────────────────────────────────────────────────────
  // SOLO MODE LOGIC
  // ─────────────────────────────────────────────────────────────
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

      if (currentSeconds >= 1.2) {
        setIsBlinded(true);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [sound]);

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

    const accuracyPct = Math.max(0, Math.round((1 - Math.abs(delta) / target) * 1000) / 10);
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

  // ─────────────────────────────────────────────────────────────
  // 1v1 PVP MODE LOGIC
  // ─────────────────────────────────────────────────────────────
  const changePvpState = (nextState) => {
    pvpStateRef.current = nextState;
    setPvpState(nextState);
  };

  const startPvpSession = useCallback(() => {
    setPvpWins({ p1: 0, p2: 0 });
    pvpWinsRef.current = { p1: 0, p2: 0 };
    setPvpRound(0);
    pvpRoundRef.current = 0;
    setPvpHistory([]);
    setP1Result(null);
    setP2Result(null);
    p1ResultRef.current = null;
    p2ResultRef.current = null;
    setPvpRoundWinner(null);
    currentTargetRef.current = PVP_TARGETS[0];
    changePvpState('waiting');
  }, []);

  const evaluatePvpRound = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    setIsBlinded(false);

    const r1 = p1ResultRef.current;
    const r2 = p2ResultRef.current;

    let winner = 'tie';
    if (r1.deltaMs < r2.deltaMs) {
      winner = 'p1';
    } else if (r2.deltaMs < r1.deltaMs) {
      winner = 'p2';
    }

    setPvpRoundWinner(winner);

    const updatedWins = {
      p1: pvpWinsRef.current.p1 + (winner === 'p1' ? 1 : 0),
      p2: pvpWinsRef.current.p2 + (winner === 'p2' ? 1 : 0),
    };
    setPvpWins(updatedWins);
    pvpWinsRef.current = updatedWins;

    const roundSummary = {
      round: pvpRoundRef.current + 1,
      target: currentTargetRef.current,
      p1: r1,
      p2: r2,
      winner,
    };
    setPvpHistory(prev => [...prev, roundSummary]);

    if (winner !== 'tie') {
      sound.playLevelUp();
    } else {
      sound.playMatch();
    }

    changePvpState('revealed');
  }, [sound]);

  const startPvpTimer = useCallback(() => {
    if (pvpStateRef.current !== 'waiting') return;
    changePvpState('running');
    sound.playTick();
    setIsBlinded(false);
    setElapsed(0);
    setP1Result(null);
    setP2Result(null);
    p1ResultRef.current = null;
    p2ResultRef.current = null;
    setPvpRoundWinner(null);

    const startTime = performance.now();
    startTimestampRef.current = startTime;
    const target = currentTargetRef.current;

    const tick = () => {
      const now = performance.now();
      const currentSeconds = (now - startTime) / 1000;
      setElapsed(currentSeconds);

      if (currentSeconds >= 1.2) {
        setIsBlinded(true);
      }

      // Safeguard: auto-stop any unstopped player if past target + 2.5s
      if (currentSeconds >= target + 2.5) {
        if (!p1ResultRef.current) {
          const delta = currentSeconds - target;
          const deltaMs = Math.round(Math.abs(delta) * 1000);
          p1ResultRef.current = {
            stoppedAt: currentSeconds,
            delta,
            deltaMs,
            accuracyPct: 0,
            rank: getAccuracyRank(deltaMs),
          };
          setP1Result(p1ResultRef.current);
        }
        if (!p2ResultRef.current) {
          const delta = currentSeconds - target;
          const deltaMs = Math.round(Math.abs(delta) * 1000);
          p2ResultRef.current = {
            stoppedAt: currentSeconds,
            delta,
            deltaMs,
            accuracyPct: 0,
            rank: getAccuracyRank(deltaMs),
          };
          setP2Result(p2ResultRef.current);
        }
        evaluatePvpRound();
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [sound, evaluatePvpRound]);

  const stopP1 = useCallback(() => {
    if (pvpStateRef.current !== 'running' || p1ResultRef.current) return;
    const now = performance.now();
    if (now - startTimestampRef.current < 80) return; // debounce micro taps

    const stoppedAt = (now - startTimestampRef.current) / 1000;
    const target = currentTargetRef.current;
    const delta = stoppedAt - target;
    const deltaMs = Math.round(Math.abs(delta) * 1000);
    const accuracyPct = Math.max(0, Math.round((1 - Math.abs(delta) / target) * 1000) / 10);
    const rank = getAccuracyRank(deltaMs);

    const res = { stoppedAt, delta, deltaMs, accuracyPct, rank };
    p1ResultRef.current = res;
    setP1Result(res);
    sound.playTick();

    if (p2ResultRef.current) {
      evaluatePvpRound();
    }
  }, [sound, evaluatePvpRound]);

  const stopP2 = useCallback(() => {
    if (pvpStateRef.current !== 'running' || p2ResultRef.current) return;
    const now = performance.now();
    if (now - startTimestampRef.current < 80) return; // debounce micro taps

    const stoppedAt = (now - startTimestampRef.current) / 1000;
    const target = currentTargetRef.current;
    const delta = stoppedAt - target;
    const deltaMs = Math.round(Math.abs(delta) * 1000);
    const accuracyPct = Math.max(0, Math.round((1 - Math.abs(delta) / target) * 1000) / 10);
    const rank = getAccuracyRank(deltaMs);

    const res = { stoppedAt, delta, deltaMs, accuracyPct, rank };
    p2ResultRef.current = res;
    setP2Result(res);
    sound.playTick();

    if (p1ResultRef.current) {
      evaluatePvpRound();
    }
  }, [sound, evaluatePvpRound]);

  const nextPvpRound = useCallback(() => {
    if (pvpStateRef.current !== 'revealed') return;

    // Check if match won
    if (pvpWinsRef.current.p1 >= PVP_TARGET_WINS || pvpWinsRef.current.p2 >= PVP_TARGET_WINS) {
      changePvpState('gameover');
      return;
    }

    const nextRound = pvpRoundRef.current + 1;
    if (nextRound >= PVP_TARGETS.length) {
      changePvpState('gameover');
    } else {
      pvpRoundRef.current = nextRound;
      currentTargetRef.current = PVP_TARGETS[nextRound];
      setPvpRound(nextRound);
      setP1Result(null);
      setP2Result(null);
      p1ResultRef.current = null;
      p2ResultRef.current = null;
      changePvpState('waiting');
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // UNIFIED KEYBOARD LISTENER
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      const code = e.code;

      if (modeRef.current === 'solo') {
        if (code === 'Space' || key === ' ') {
          e.preventDefault();
          if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
          }

          const currentSt = gameStateRef.current;
          if (currentSt === 'ready') {
            startSession();
          } else if (currentSt === 'waiting') {
            startTimer();
          } else if (currentSt === 'running') {
            if (performance.now() - startTimestampRef.current >= 80) {
              stopTimer();
            }
          } else if (currentSt === 'revealed') {
            handleNextRound();
          } else if (currentSt === 'gameover') {
            startSession();
          }
        }
      } else {
        // PvP Mode Hotkeys
        if (code === 'Space' || key === ' ') {
          if (pvpStateRef.current === 'ready') {
            e.preventDefault();
            startPvpSession();
          } else if (pvpStateRef.current === 'waiting') {
            e.preventDefault();
            startPvpTimer();
          } else if (pvpStateRef.current === 'revealed') {
            e.preventDefault();
            nextPvpRound();
          } else if (pvpStateRef.current === 'gameover') {
            e.preventDefault();
            startPvpSession();
          }
        } else if (code === 'KeyA' || key === 'a' || code === 'KeyQ' || key === 'q') {
          if (pvpStateRef.current === 'running') {
            e.preventDefault();
            stopP1();
          }
        } else if (code === 'KeyL' || key === 'l' || code === 'KeyP' || key === 'p') {
          if (pvpStateRef.current === 'running') {
            e.preventDefault();
            stopP2();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    startSession, startTimer, stopTimer, handleNextRound,
    startPvpSession, startPvpTimer, stopP1, stopP2, nextPvpRound
  ]);

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const averageAccuracy = roundScores.length > 0
    ? Math.round(roundScores.reduce((acc, r) => acc + r.accuracyPct, 0) / roundScores.length)
    : 0;

  const isMatchFinished = pvpWins.p1 >= PVP_TARGET_WINS || pvpWins.p2 >= PVP_TARGET_WINS || pvpRound >= PVP_TARGETS.length - 1;

  return (
    <div className="screen mini-game-screen">
      <BgOrbs />
      {mode === 'solo' && <ScorePop points={lastPts} trigger={scoreTrigger} />}

      {/* Top Bar */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={() => {
          cancelAnimationFrame(animFrameRef.current);
          onBack();
        }}>← Hub</button>
        <div className="mini-game-title">⏱️ Chrono Beat</div>
        <div className="timer-pill">
          {mode === 'solo' 
            ? `Round ${Math.min(round + 1, 3)} / 3`
            : `1v1 Duel • Best of 3`}
        </div>
      </div>

      {/* Mode Switcher Tabs (Solo vs 1v1 Duel) */}
      <div className="game-mode-switch-wrapper">
        <div className="mode-switch-pills" role="tablist">
          <button
            className={`btn-mode-pill ${mode === 'solo' ? 'active' : ''}`}
            onClick={() => {
              cancelAnimationFrame(animFrameRef.current);
              setMode('solo');
              changeGameState('ready');
            }}
          >
            <span>👤 Solo Mode</span>
          </button>
          <button
            className={`btn-mode-pill ${mode === 'pvp' ? 'pvp-active' : ''}`}
            onClick={() => {
              cancelAnimationFrame(animFrameRef.current);
              setMode('pvp');
              changePvpState('ready');
            }}
          >
            <span>⚔️ 1v1 Clock Duel</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MODE 1: SOLO CALIBRATION
          ══════════════════════════════════════════════════════════ */}
      {mode === 'solo' && (
        <>
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
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODE 2: 1v1 CLOCK DUEL
          ══════════════════════════════════════════════════════════ */}
      {mode === 'pvp' && (
        <>
          {pvpState === 'ready' && (
            <div className="pvp-config-card">
              <div className="pvp-badge-header">
                <span>⚔️ Head-to-Head Duel</span>
              </div>
              <h2 style={{ margin: '4px 0 0', fontSize: '1.45rem' }}>Chrono Beat: 1v1 Battle</h2>
              <p className="ready-desc" style={{ margin: 0, textAlign: 'center' }}>
                Two players, one blind clock! Both stop the timer as close as possible to the target. Whoever has fewer millisecond errors wins the round!
              </p>

              {/* Player Name Inputs */}
              <div className="pvp-players-setup-grid">
                <div className="pvp-player-input-box p1-box">
                  <span className="pvp-player-label">🔴 Player 1</span>
                  <input
                    type="text"
                    className="pvp-name-field"
                    value={p1Name}
                    maxLength={14}
                    onChange={(e) => setP1Name(e.target.value)}
                    placeholder="Player 1"
                  />
                  <span className="pvp-key-hint">Hotkey: <strong>[A]</strong></span>
                </div>

                <div className="pvp-vs-divider">VS</div>

                <div className="pvp-player-input-box p2-box">
                  <span className="pvp-player-label">🔵 Player 2</span>
                  <input
                    type="text"
                    className="pvp-name-field"
                    value={p2Name}
                    maxLength={14}
                    onChange={(e) => setP2Name(e.target.value)}
                    placeholder="Player 2"
                  />
                  <span className="pvp-key-hint">Hotkey: <strong>[L]</strong></span>
                </div>
              </div>

              {/* Rules strip */}
              <div className="pvp-rules-strip">
                <div className="pvp-rule-item">
                  <span>🏆</span>
                  <span><strong>Best of 3 Format:</strong> First player to win 2 rounds wins the duel!</span>
                </div>
                <div className="pvp-rule-item">
                  <span>🙈</span>
                  <span><strong>Blind Clock:</strong> Timer blinds after 1.2s — trust your internal rhythm.</span>
                </div>
                <div className="pvp-rule-item">
                  <span>⚡</span>
                  <span><strong>Side-by-Side:</strong> Use [A] and [L] keys or on-screen trigger buttons.</span>
                </div>
              </div>

              <button
                className="btn-start-pvp"
                onClick={(e) => { e.currentTarget.blur(); startPvpSession(); }}
              >
                <span>Start 1v1 Clock Duel</span>
                <span className="chrono-hotkey-badge" style={{ background: 'rgba(0,0,0,0.3)' }}>SPACE</span>
              </button>
            </div>
          )}

          {(pvpState === 'waiting' || pvpState === 'running' || pvpState === 'revealed') && (
            <div className="mini-game-play-area">
              {/* Top 1v1 Scoreboard HUD */}
              <div className="chrono-pvp-header-hud">
                <div className={`chrono-p-hud-card p1 ${pvpRoundWinner === 'p1' ? 'winner' : ''}`}>
                  <div className="chrono-p-meta">
                    <span className="chrono-p-name">{p1Name || 'Player 1'}</span>
                    <span className="chrono-p-keytag">KEY [A]</span>
                  </div>
                  <div className="chrono-p-score-stars">
                    {[...Array(PVP_TARGET_WINS)].map((_, i) => (
                      <div
                        key={i}
                        className={`chrono-round-dot ${i < pvpWins.p1 ? 'won-p1' : ''}`}
                        title={`P1 Win ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="chrono-vs-center-pill">
                  <span className="chrono-vs-text">VS</span>
                  <span className="chrono-round-indicator">R{pvpRound + 1} / 5</span>
                </div>

                <div className={`chrono-p-hud-card p2 ${pvpRoundWinner === 'p2' ? 'winner' : ''}`}>
                  <div className="chrono-p-score-stars">
                    {[...Array(PVP_TARGET_WINS)].map((_, i) => (
                      <div
                        key={i}
                        className={`chrono-round-dot ${i < pvpWins.p2 ? 'won-p2' : ''}`}
                        title={`P2 Win ${i + 1}`}
                      />
                    ))}
                  </div>
                  <div className="chrono-p-meta" style={{ textAlign: 'right', alignItems: 'flex-end' }}>
                    <span className="chrono-p-name">{p2Name || 'Player 2'}</span>
                    <span className="chrono-p-keytag">KEY [L]</span>
                  </div>
                </div>
              </div>

              {/* Target Banner */}
              <div className="target-banner-card" style={{ borderColor: 'var(--amber)' }}>
                <span className="target-lbl" style={{ color: 'var(--amber)' }}>
                  ROUND {pvpRound + 1} TARGET
                </span>
                <div className="target-number" style={{ color: 'var(--amber)' }}>
                  {currentTarget.toFixed(3)}s
                </div>
                <p className="ready-desc" style={{ fontSize: '0.84rem', margin: 0 }}>
                  {pvpState === 'waiting'
                    ? 'Press Space or Click Start to unleash the clock!'
                    : pvpState === 'running'
                    ? (isBlinded ? 'BLIND TEMPO! P1 tap [A] • P2 tap [L]' : 'Watching the seconds count...')
                    : 'Round Concluded!'}
                </p>
              </div>

              {/* Central Clock Orb */}
              <div className={`chrono-clock-circle ${isBlinded ? 'is-blinded' : ''}`}>
                {isBlinded ? (
                  <div className="blind-tempo-pulse">
                    <span className="blind-dots">?.???</span>
                    <span className="blind-hint">Blind Beat • Feel the Seconds</span>
                  </div>
                ) : (
                  <div className="live-clock-digits">
                    {elapsed.toFixed(3)}<span className="sec-unit">s</span>
                  </div>
                )}
              </div>

              {/* Waiting: Single Start Round Button */}
              {pvpState === 'waiting' && (
                <div className="chrono-actions-row">
                  <button
                    className="btn-chrono-main btn-start-time"
                    onClick={(e) => { e.currentTarget.blur(); startPvpTimer(); }}
                  >
                    <span>▶ Start Round {pvpRound + 1}</span>
                    <span className="chrono-hotkey-badge">SPACE</span>
                  </button>
                </div>
              )}

              {/* Running: Dual Split Action Triggers */}
              {pvpState === 'running' && (
                <div className="chrono-pvp-triggers-grid">
                  <button
                    className={`btn-chrono-p-trigger p1 ${p1Result ? 'is-stopped' : ''}`}
                    onClick={(e) => { e.currentTarget.blur(); stopP1(); }}
                    disabled={!!p1Result}
                  >
                    {p1Result ? (
                      <>
                        <span className="trigger-locked-time">{p1Result.stoppedAt.toFixed(3)}s</span>
                        <span className={`trigger-locked-delta ${p1Result.deltaMs <= 150 ? 'good' : 'warn'}`}>
                          {p1Result.delta >= 0 ? `+${p1Result.deltaMs}ms` : `-${p1Result.deltaMs}ms`}
                        </span>
                        <span className="trigger-key-badge">LOCKED</span>
                      </>
                    ) : (
                      <>
                        <span className="trigger-main-lbl">STOP {p1Name || 'P1'}</span>
                        <span className="trigger-key-badge">[A] or TAP</span>
                      </>
                    )}
                  </button>

                  <button
                    className={`btn-chrono-p-trigger p2 ${p2Result ? 'is-stopped' : ''}`}
                    onClick={(e) => { e.currentTarget.blur(); stopP2(); }}
                    disabled={!!p2Result}
                  >
                    {p2Result ? (
                      <>
                        <span className="trigger-locked-time">{p2Result.stoppedAt.toFixed(3)}s</span>
                        <span className={`trigger-locked-delta ${p2Result.deltaMs <= 150 ? 'good' : 'warn'}`}>
                          {p2Result.delta >= 0 ? `+${p2Result.deltaMs}ms` : `-${p2Result.deltaMs}ms`}
                        </span>
                        <span className="trigger-key-badge">LOCKED</span>
                      </>
                    ) : (
                      <>
                        <span className="trigger-main-lbl">STOP {p2Name || 'P2'}</span>
                        <span className="trigger-key-badge">[L] or TAP</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Revealed: Round Breakdown Card */}
              {pvpState === 'revealed' && p1Result && p2Result && (
                <div className="chrono-pvp-reveal-card animate-pop">
                  <div className={`pvp-winner-banner ${pvpRoundWinner === 'p1' ? 'p1-won' : pvpRoundWinner === 'p2' ? 'p2-won' : 'tie'}`}>
                    {pvpRoundWinner === 'p1' && `👑 ${p1Name || 'Player 1'} Wins Round ${pvpRound + 1}!`}
                    {pvpRoundWinner === 'p2' && `👑 ${p2Name || 'Player 2'} Wins Round ${pvpRound + 1}!`}
                    {pvpRoundWinner === 'tie' && `🤝 Dead Heat! Perfect Tie!`}
                  </div>

                  <div className="pvp-round-compare-row">
                    {/* Player 1 Column */}
                    <div className={`pvp-compare-col ${pvpRoundWinner === 'p1' ? 'is-round-winner' : ''}`}>
                      <span className="pvp-col-name" style={{ color: '#EF4444' }}>{p1Name || 'Player 1'}</span>
                      <span className="pvp-col-time">{p1Result.stoppedAt.toFixed(3)}s</span>
                      <span className={`pvp-col-delta ${p1Result.deltaMs <= 150 ? 'good' : 'warn'}`}>
                        {p1Result.delta >= 0 ? `+${p1Result.deltaMs}ms` : `-${p1Result.deltaMs}ms`}
                      </span>
                      <span className="pvp-col-acc">{p1Result.accuracyPct}% Precision</span>
                    </div>

                    <div className="pvp-vs-divider">VS</div>

                    {/* Player 2 Column */}
                    <div className={`pvp-compare-col ${pvpRoundWinner === 'p2' ? 'is-round-winner' : ''}`}>
                      <span className="pvp-col-name" style={{ color: '#6366F1' }}>{p2Name || 'Player 2'}</span>
                      <span className="pvp-col-time">{p2Result.stoppedAt.toFixed(3)}s</span>
                      <span className={`pvp-col-delta ${p2Result.deltaMs <= 150 ? 'good' : 'warn'}`}>
                        {p2Result.delta >= 0 ? `+${p2Result.deltaMs}ms` : `-${p2Result.deltaMs}ms`}
                      </span>
                      <span className="pvp-col-acc">{p2Result.accuracyPct}% Precision</span>
                    </div>
                  </div>

                  <button
                    className="btn-start-pvp"
                    style={{ marginTop: 6 }}
                    onClick={(e) => { e.currentTarget.blur(); nextPvpRound(); }}
                  >
                    <span>{isMatchFinished ? 'View Final Results 🏆' : `Next Round → (R${pvpRound + 2})`}</span>
                    <span className="chrono-hotkey-badge" style={{ background: 'rgba(0,0,0,0.3)' }}>SPACE</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 1v1 Victory Screen */}
          {pvpState === 'gameover' && (
            <div className="pvp-victory-modal">
              <Confetti />
              <div className="pvp-crown-icon">👑</div>
              <h2 className="pvp-champion-title">
                {pvpWins.p1 > pvpWins.p2
                  ? `${p1Name || 'Player 1'} Wins the Duel!`
                  : pvpWins.p2 > pvpWins.p1
                  ? `${p2Name || 'Player 2'} Wins the Duel!`
                  : `Honorable Tie!`}
              </h2>

              <div className="pvp-final-score-strip">
                <span className="score-p1">{p1Name || 'P1'}: {pvpWins.p1}</span>
                <span className="score-div">—</span>
                <span className="score-p2">{pvpWins.p2} :{p2Name || 'P2'}</span>
              </div>

              {/* Round History Table */}
              <table className="pvp-rounds-history-table">
                <thead>
                  <tr>
                    <th>Round</th>
                    <th>Target</th>
                    <th>{p1Name || 'P1'} Error</th>
                    <th>{p2Name || 'P2'} Error</th>
                    <th>Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {pvpHistory.map((h, i) => (
                    <tr key={i}>
                      <td>R{h.round}</td>
                      <td>{h.target.toFixed(1)}s</td>
                      <td style={{ color: h.p1.deltaMs <= 150 ? '#10B981' : 'inherit' }}>
                        {h.p1.deltaMs}ms
                      </td>
                      <td style={{ color: h.p2.deltaMs <= 150 ? '#10B981' : 'inherit' }}>
                        {h.p2.deltaMs}ms
                      </td>
                      <td style={{ fontWeight: 900, color: h.winner === 'p1' ? '#EF4444' : h.winner === 'p2' ? '#6366F1' : 'var(--amber)' }}>
                        {h.winner === 'p1' ? (p1Name || 'P1') : h.winner === 'p2' ? (p2Name || 'P2') : 'Tie'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="modal-actions" style={{ marginTop: 8 }}>
                <button
                  className="btn-play-again"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #6366F1)', color: '#fff' }}
                  onClick={(e) => { e.currentTarget.blur(); startPvpSession(); }}
                >
                  <span>Rematch ↺</span>
                  <span className="chrono-hotkey-badge" style={{ marginLeft: 8 }}>SPACE</span>
                </button>
                <button
                  className="btn-hub"
                  onClick={() => {
                    setMode('solo');
                    changeGameState('ready');
                  }}
                >
                  Solo Mode
                </button>
                <button className="btn-hub" onClick={onBack}>
                  Hub
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
