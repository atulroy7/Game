import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

// Generate verified 3-digit logic lock puzzles
const PUZZLE_BANK = [
  {
    secret: [0, 4, 2],
    clues: [
      { digits: [6, 8, 2], hint: 'One number is correct and well placed' },
      { digits: [6, 1, 4], hint: 'One number is correct but wrongly placed' },
      { digits: [2, 0, 6], hint: 'Two numbers are correct but wrongly placed' },
      { digits: [7, 3, 8], hint: 'Nothing is correct' },
      { digits: [7, 8, 0], hint: 'One number is correct but wrongly placed' },
    ],
  },
  {
    secret: [3, 8, 4],
    clues: [
      { digits: [3, 1, 9], hint: 'One number is correct and well placed' },
      { digits: [8, 3, 7], hint: 'Two numbers are correct but wrongly placed' },
      { digits: [5, 2, 8], hint: 'One number is correct but wrongly placed' },
      { digits: [1, 5, 7], hint: 'Nothing is correct' },
      { digits: [9, 8, 4], hint: 'Two numbers are correct and well placed' },
    ],
  },
  {
    secret: [9, 2, 7],
    clues: [
      { digits: [9, 5, 1], hint: 'One number is correct and well placed' },
      { digits: [2, 9, 8], hint: 'Two numbers are correct but wrongly placed' },
      { digits: [6, 3, 4], hint: 'Nothing is correct' },
      { digits: [7, 2, 3], hint: 'Two numbers are correct, one well placed' },
      { digits: [8, 0, 7], hint: 'One number is correct and well placed' },
    ],
  },
  {
    secret: [1, 6, 5],
    clues: [
      { digits: [6, 8, 5], hint: 'Two numbers are correct, one well placed' },
      { digits: [1, 8, 9], hint: 'One number is correct and well placed' },
      { digits: [2, 0, 6], hint: 'One number is correct but wrongly placed' },
      { digits: [7, 3, 8], hint: 'Nothing is correct' },
      { digits: [5, 1, 4], hint: 'Two numbers are correct but wrongly placed' },
    ],
  },
  {
    secret: [4, 7, 1],
    clues: [
      { digits: [2, 7, 9], hint: 'One number is correct and well placed' },
      { digits: [4, 1, 8], hint: 'Two numbers are correct, one well placed' },
      { digits: [9, 8, 3], hint: 'Nothing is correct' },
      { digits: [1, 4, 6], hint: 'Two numbers are correct but wrongly placed' },
      { digits: [0, 7, 5], hint: 'One number is correct and well placed' },
    ],
  },
  {
    secret: [8, 5, 2],
    clues: [
      { digits: [8, 9, 3], hint: 'One number is correct and well placed' },
      { digits: [5, 8, 1], hint: 'Two numbers are correct but wrongly placed' },
      { digits: [7, 4, 6], hint: 'Nothing is correct' },
      { digits: [9, 5, 2], hint: 'Two numbers are correct and well placed' },
      { digits: [1, 2, 5], hint: 'Two numbers are correct but wrongly placed' },
    ],
  },
];

export default function LogicLock({ sound, onBack, onSaveScore }) {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [dials, setDials] = useState([0, 0, 0]);
  const [activeDial, setActiveDial] = useState(0);
  const [markedClues, setMarkedClues] = useState({});
  const [unlocked, setUnlocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [shake, setShake] = useState(false);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const input0Ref = useRef(null);
  const input1Ref = useRef(null);
  const input2Ref = useRef(null);
  const inputRefs = [input0Ref, input1Ref, input2Ref];

  const currentPuzzle = PUZZLE_BANK[puzzleIdx % PUZZLE_BANK.length];

  const handleDialChange = (index, delta) => {
    sound.playPop();
    setDials(prev => {
      const next = [...prev];
      next[index] = (Number(next[index]) + delta + 10) % 10;
      return next;
    });
  };

  const handleDigitInput = (index, rawValue) => {
    if (unlocked) return;
    const digitsOnly = rawValue.replace(/\D/g, '');
    if (digitsOnly.length === 0) return;
    const digit = Number(digitsOnly.slice(-1));
    sound.playPop();

    setDials(prev => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (index < 2) {
      setActiveDial(index + 1);
      setTimeout(() => {
        inputRefs[index + 1].current?.focus();
        inputRefs[index + 1].current?.select();
      }, 10);
    }
  };

  const handleKeyDown = (index, e) => {
    if (unlocked) return;
    if (e.key === 'Backspace') {
      e.preventDefault();
      sound.playPop();
      setDials(prev => {
        const next = [...prev];
        next[index] = 0;
        return next;
      });
      if (index > 0) {
        setActiveDial(index - 1);
        inputRefs[index - 1].current?.focus();
        inputRefs[index - 1].current?.select();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      setActiveDial(index - 1);
      inputRefs[index - 1].current?.focus();
      inputRefs[index - 1].current?.select();
    } else if (e.key === 'ArrowRight' && index < 2) {
      e.preventDefault();
      setActiveDial(index + 1);
      inputRefs[index + 1].current?.focus();
      inputRefs[index + 1].current?.select();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleDialChange(index, 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDialChange(index, -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleCrackVault();
    }
  };

  const handleKeypadPress = (num) => {
    if (unlocked) return;
    sound.playPop();
    setDials(prev => {
      const next = [...prev];
      next[activeDial] = num;
      return next;
    });
    if (activeDial < 2) {
      const nextIdx = activeDial + 1;
      setActiveDial(nextIdx);
      inputRefs[nextIdx].current?.focus();
      inputRefs[nextIdx].current?.select();
    }
  };

  const handleKeypadBackspace = () => {
    if (unlocked) return;
    sound.playPop();
    setDials(prev => {
      const next = [...prev];
      next[activeDial] = 0;
      return next;
    });
    if (activeDial > 0) {
      const prevIdx = activeDial - 1;
      setActiveDial(prevIdx);
      inputRefs[prevIdx].current?.focus();
      inputRefs[prevIdx].current?.select();
    }
  };

  const toggleClueMark = (idx) => {
    sound.playPop();
    setMarkedClues(prev => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCrackVault = () => {
    const isSuccess = dials.every((d, i) => Number(d) === currentPuzzle.secret[i]);

    if (isSuccess) {
      sound.playCorrect();
      setUnlocked(true);
      const penalty = attempts * 30;
      const pts = Math.max(150, 400 - penalty);
      const newScore = score + pts;
      setScore(newScore);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);
      setSolvedCount(c => c + 1);

      if (onSaveScore) onSaveScore('logicLock', newScore);
    } else {
      sound.playWrong();
      setAttempts(a => a + 1);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleNextLock = () => {
    setPuzzleIdx(i => i + 1);
    setDials([0, 0, 0]);
    setActiveDial(0);
    setMarkedClues({});
    setUnlocked(false);
    setAttempts(0);
  };

  return (
    <div className="screen mini-game-screen lock-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Navigation */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🔐 Logic Lock</div>
        <div className="hud-badge-compact">
          Solved: {solvedCount}
        </div>
      </div>

      <div className="lock-main-container">
        {/* Vault Header & Score */}
        <div className="lock-header-row">
          <div className="lock-stat-pill">
            <span className="lbl">Score</span>
            <span className="val">{score}</span>
          </div>
          <div className="lock-stat-pill">
            <span className="lbl">Attempts</span>
            <span className="val">{attempts}</span>
          </div>
        </div>

        {/* The Digital Tumbler Vault */}
        <div className={`lock-vault-chassis ${shake ? 'shake-fx' : ''} ${unlocked ? 'vault-unlocked' : ''}`}>
          <div className="vault-door-rim">
            <div className="vault-status-light">
              <span className={`status-dot ${unlocked ? 'dot-green' : 'dot-red'}`} />
              <span className="status-txt">{unlocked ? 'VAULT CRACKED' : 'LOCKED'}</span>
            </div>

            {/* 3 Tumbler Cylinders */}
            <div className="tumbler-row">
              {[0, 1, 2].map((dialIdx) => (
                <div key={dialIdx} className="tumbler-column">
                  <button
                    type="button"
                    className="btn-tumbler-arrow"
                    onClick={() => handleDialChange(dialIdx, 1)}
                    disabled={unlocked}
                    title="Increment"
                  >
                    ▲
                  </button>
                  <input
                    ref={inputRefs[dialIdx]}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    className={`tumbler-digit-input ${activeDial === dialIdx ? 'active-dial' : ''}`}
                    value={dials[dialIdx]}
                    onFocus={() => {
                      setActiveDial(dialIdx);
                      inputRefs[dialIdx].current?.select();
                    }}
                    onChange={(e) => handleDigitInput(dialIdx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(dialIdx, e)}
                    disabled={unlocked}
                    aria-label={`Digit ${dialIdx + 1}`}
                  />
                  <button
                    type="button"
                    className="btn-tumbler-arrow"
                    onClick={() => handleDialChange(dialIdx, -1)}
                    disabled={unlocked}
                    title="Decrement"
                  >
                    ▼
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Numeric Keypad */}
            {!unlocked && (
              <div className="lock-keypad" role="group" aria-label="Lock numeric keypad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className="btn-keypad-digit"
                    onClick={() => handleKeypadPress(num)}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  className="btn-keypad-digit keypad-backspace"
                  onClick={handleKeypadBackspace}
                  title="Backspace"
                >
                  ⌫
                </button>
                <button
                  type="button"
                  className="btn-keypad-digit"
                  style={{ fontSize: '0.75rem', color: 'var(--amber)' }}
                  onClick={() => {
                    sound.playPop();
                    setDials([0, 0, 0]);
                    setActiveDial(0);
                    inputRefs[0].current?.focus();
                  }}
                  title="Clear all dials"
                >
                  CLR
                </button>
              </div>
            )}

            {/* Crack Vault Trigger Button */}
            {!unlocked ? (
              <button className="btn-crack-vault" onClick={handleCrackVault}>
                <span>🔓 Crack Vault</span>
              </button>
            ) : (
              <button className="btn-next-vault" onClick={handleNextLock}>
                <span>Next Vault Code →</span>
              </button>
            )}
          </div>
        </div>

        {/* Logical Clues Panel */}
        <div className="lock-clues-panel">
          <div className="clues-panel-header">
            <h4>Deduction Clues</h4>
            <span className="clue-tip">Tap clue to strike through</span>
          </div>

          <div className="clues-list">
            {currentPuzzle.clues.map((clue, idx) => {
              const isMarked = markedClues[idx];
              return (
                <div
                  key={idx}
                  className={`clue-card ${isMarked ? 'clue-struck' : ''}`}
                  onClick={() => toggleClueMark(idx)}
                >
                  <div className="clue-digits-box">
                    {clue.digits.map((d, di) => (
                      <span key={di} className="clue-d">{d}</span>
                    ))}
                  </div>
                  <div className="clue-text">{clue.hint}</div>
                  <div className="clue-mark-checkbox">
                    {isMarked ? '✓' : '○'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {unlocked && <Confetti />}
    </div>
  );
}
