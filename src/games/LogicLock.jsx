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
      { digits: [1, 4, 7], hint: 'One number is correct and well placed' },
      { digits: [6, 1, 8], hint: 'Two numbers are correct but wrongly placed' },
      { digits: [4, 8, 9], hint: 'Nothing is correct' },
      { digits: [7, 6, 2], hint: 'One number is correct and well placed' },
      { digits: [5, 0, 1], hint: 'Two numbers are correct but wrongly placed' },
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
  const [markedClues, setMarkedClues] = useState({});
  const [unlocked, setUnlocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [shake, setShake] = useState(false);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const currentPuzzle = PUZZLE_BANK[puzzleIdx % PUZZLE_BANK.length];

  const handleDialChange = (index, delta) => {
    sound.playPop();
    setDials(prev => {
      const next = [...prev];
      next[index] = (next[index] + delta + 10) % 10;
      return next;
    });
  };

  const toggleClueMark = (idx) => {
    sound.playPop();
    setMarkedClues(prev => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCrackVault = () => {
    const isSuccess = dials.every((d, i) => d === currentPuzzle.secret[i]);

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
                    className="btn-tumbler-arrow"
                    onClick={() => handleDialChange(dialIdx, 1)}
                    disabled={unlocked}
                  >
                    ▲
                  </button>
                  <div className="tumbler-digit-window">
                    <span className="tumbler-digit">{dials[dialIdx]}</span>
                  </div>
                  <button
                    className="btn-tumbler-arrow"
                    onClick={() => handleDialChange(dialIdx, -1)}
                    disabled={unlocked}
                  >
                    ▼
                  </button>
                </div>
              ))}
            </div>

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
