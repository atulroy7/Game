import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const PADS = [
  { id: 0, label: 'α', color: '#06b6d4', glow: 'rgba(6,182,212,0.6)' },
  { id: 1, label: 'β', color: '#a855f7', glow: 'rgba(168,85,247,0.6)' },
  { id: 2, label: 'γ', color: '#f59e0b', glow: 'rgba(245,158,11,0.6)' },
  { id: 3, label: 'δ', color: '#10b981', glow: 'rgba(16,185,129,0.6)' },
  { id: 4, label: 'Ω', color: '#ec4899', glow: 'rgba(236,72,153,0.6)' },
  { id: 5, label: 'λ', color: '#3b82f6', glow: 'rgba(59,130,246,0.6)' },
  { id: 6, label: 'ψ', color: '#f97316', glow: 'rgba(249,115,22,0.6)' },
  { id: 7, label: 'θ', color: '#84cc16', glow: 'rgba(132,204,22,0.6)' },
  { id: 8, label: 'ξ', color: '#ef4444', glow: 'rgba(239,68,68,0.6)' },
];

export default function QuantumMatrix({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playback' | 'player' | 'gameover'
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [activePad, setActivePad] = useState(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [confetti, setConfetti] = useState(false);

  const scoreRef = useRef(0);
  const playbackTimeoutRef = useRef(null);

  // Play a single pad tone and flash
  const triggerPad = useCallback((padId, duration = 320) => {
    setActivePad(padId);
    sound.playPadTone(padId);
    setTimeout(() => {
      setActivePad(prev => (prev === padId ? null : prev));
    }, duration);
  }, [sound]);

  // Playback the sequence to user
  const playSequence = useCallback((seq) => {
    setGameState('playback');
    setStatusMsg('Listen & Watch Sequence...');
    let i = 0;
    const interval = Math.max(380, 600 - seq.length * 20);

    const nextStep = () => {
      if (i < seq.length) {
        triggerPad(seq[i], interval * 0.7);
        i++;
        playbackTimeoutRef.current = setTimeout(nextStep, interval);
      } else {
        // Player turn
        playbackTimeoutRef.current = setTimeout(() => {
          setGameState('player');
          setPlayerStep(0);
          setStatusMsg('Your Turn! Repeat the pattern');
        }, 300);
      }
    };

    playbackTimeoutRef.current = setTimeout(nextStep, 600);
  }, [triggerPad]);

  // Start new game
  const startGame = () => {
    clearTimeout(playbackTimeoutRef.current);
    scoreRef.current = 0;
    setScore(0);
    setLevel(1);
    setLives(3);
    setConfetti(false);

    // Initial sequence of length 2
    const initialSeq = [
      Math.floor(Math.random() * 9),
      Math.floor(Math.random() * 9),
    ];
    setSequence(initialSeq);
    playSequence(initialSeq);
  };

  // Clean up timers
  useEffect(() => {
    return () => clearTimeout(playbackTimeoutRef.current);
  }, []);

  // Handle pad clicks by player
  const handlePadClick = (padId) => {
    if (gameState !== 'player') return;

    triggerPad(padId, 220);

    if (padId === sequence[playerStep]) {
      // Correct note
      const nextStep = playerStep + 1;
      setPlayerStep(nextStep);

      // Cleared entire sequence!
      if (nextStep === sequence.length) {
        const pts = level * 120 + 50;
        scoreRef.current += pts;
        setScore(scoreRef.current);
        setLastPts(pts);
        setScoreTrigger(t => t + 1);
        setStatusMsg(`Round ${level} Cleared! 🔥`);
        sound.playLevelUp();

        if (level % 5 === 0) {
          setConfetti(true);
          setTimeout(() => setConfetti(false), 2500);
        }

        const nextLevel = level + 1;
        setLevel(nextLevel);

        // Append next random pad
        const nextSeq = [...sequence, Math.floor(Math.random() * 9)];
        setSequence(nextSeq);

        // Pause before CPU replay
        setTimeout(() => {
          playSequence(nextSeq);
        }, 1000);
      }
    } else {
      // Mistake!
      sound.playWrong();
      const nextLives = lives - 1;
      setLives(nextLives);

      if (nextLives <= 0) {
        sound.playLifeLost();
        setGameState('gameover');
        if (onSaveScore) onSaveScore('quantumMatrix', scoreRef.current);
      } else {
        setStatusMsg(`Wrong pad! ❤️ Remaining: ${nextLives}`);
        // Replay current sequence
        setTimeout(() => {
          playSequence(sequence);
        }, 900);
      }
    }
  };

  return (
    <div className="screen mini-game-screen matrix-screen">
      <BgOrbs />
      {confetti && <Confetti />}
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Top Bar */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={() => {
          clearTimeout(playbackTimeoutRef.current);
          onBack();
        }}>← Hub</button>
        <div className="mini-game-title">🔮 Quantum Matrix</div>
        <div className="matrix-lives">
          {[...Array(3)].map((_, i) => (
            <span key={i} className={`heart ${i < lives ? 'filled' : 'empty'}`}>❤️</span>
          ))}
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop">🔮 Audio-Visual Memory</div>
          <h2>Quantum Matrix Recall</h2>
          <p className="ready-desc">
            Cybernetic sensory pattern game. The Matrix synthesizes expanding harmonic sequences across 9 glowing sensory nodes. Listen to the tones, remember the path, and replicate it!
          </p>
          <div className="rules-grid">
            <div className="rule-item">🎵 9 Harmonic Synths</div>
            <div className="rule-item">📈 Sequence length grows each round</div>
            <div className="rule-item">❤️ 3 Retries before Game Over</div>
            <div className="rule-item">💎 Massive score scaling per level</div>
          </div>
          <button className="btn-start-mini" onClick={startGame}>
            <span>Initialize Neural Link</span> →
          </button>
        </div>
      )}

      {(gameState === 'playback' || gameState === 'player') && (
        <div className="matrix-play-area">
          {/* HUD Bar */}
          <div className="hud-strip">
            <div className="hud-badge">
              <span className="lbl">Round</span>
              <span className="val">Lvl {level}</span>
            </div>
            <div className="hud-badge">
              <span className="lbl">Score</span>
              <span className="val">{score}</span>
            </div>
            <div className="hud-badge">
              <span className="lbl">Pattern</span>
              <span className="val">{playerStep} / {sequence.length}</span>
            </div>
          </div>

          <div className={`status-indicator ${gameState}`}>
            {statusMsg}
          </div>

          {/* 3x3 Glowing Sensory Grid */}
          <div className="pads-grid">
            {PADS.map((pad) => {
              const isLit = activePad === pad.id;
              return (
                <button
                  key={pad.id}
                  className={`matrix-pad ${isLit ? 'lit' : ''} ${gameState === 'player' ? 'clickable' : 'locked'}`}
                  style={{
                    '--pad-color': pad.color,
                    '--pad-glow': pad.glow,
                  }}
                  onClick={() => handlePadClick(pad.id)}
                  disabled={gameState !== 'player'}
                >
                  <span className="pad-glyph">{pad.label}</span>
                  <div className="pad-ripple" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal">
          {level >= 6 && <Confetti />}
          <div className="gameover-icon">🔮</div>
          <h2>Matrix Desync!</h2>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Total Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">Level {level}</span>
              <span className="m-lbl">Rounds Survived</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{sequence.length}</span>
              <span className="m-lbl">Max Sequence</span>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-play-again" onClick={startGame}>
              Re-Sync Matrix ↺
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
