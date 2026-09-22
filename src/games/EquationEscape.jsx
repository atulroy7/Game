import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const EQUATION_PUZZLES = [
  { target: 24, numbers: [3, 8, 4, 6], parHint: '3 × 8 = 24' },
  { target: 18, numbers: [5, 4, 2, 7], parHint: '(5 - 2) × 6 or (4 × 5) - 2' },
  { target: 36, numbers: [9, 3, 2, 4], parHint: '9 × 4 = 36' },
  { target: 25, numbers: [3, 5, 2, 10], parHint: '(10 ÷ 2) × 5 = 25' },
  { target: 42, numbers: [6, 7, 8, 2], parHint: '6 × 7 = 42' },
  { target: 30, numbers: [5, 6, 4, 10], parHint: '5 × 6 = 30' },
  { target: 16, numbers: [8, 4, 2, 3], parHint: '8 × 2 = 16' },
  { target: 50, numbers: [10, 5, 2, 25], parHint: '25 × 2 = 50' },
];

const OPERATORS = ['+', '-', '×', '÷', '(', ')'];

export default function EquationEscape({ sound, onBack, onSaveScore }) {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [equationTokens, setEquationTokens] = useState([]);
  const [usedNumberIndices, setUsedNumberIndices] = useState([]);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [currentVal, setCurrentVal] = useState(null);
  const [evalError, setEvalError] = useState('');
  const [shake, setShake] = useState(false);
  const [isEscaped, setIsEscaped] = useState(false);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const current = EQUATION_PUZZLES[puzzleIdx % EQUATION_PUZZLES.length];

  // Evaluate arithmetic expression safely
  const evaluateExpression = useCallback((tokens) => {
    if (tokens.length === 0) return null;
    const str = tokens
      .map(t => (t === '×' ? '*' : t === '÷' ? '/' : t))
      .join(' ');

    try {
      // Basic syntax check: don't end on operator
      const last = tokens[tokens.length - 1];
      if (['+', '-', '×', '÷'].includes(last)) return null;

      // Safe arithmetic evaluator
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${str})`)();
      if (typeof result === 'number' && isFinite(result)) {
        return Math.round(result * 100) / 100;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const val = evaluateExpression(equationTokens);
    setCurrentVal(val);
  }, [equationTokens, evaluateExpression]);

  const handleAddNumber = (num, idx) => {
    if (usedNumberIndices.includes(idx)) return;
    sound.playPop();
    setEquationTokens(prev => [...prev, num]);
    setUsedNumberIndices(prev => [...prev, idx]);
  };

  const handleAddOperator = (op) => {
    sound.playPop();
    setEquationTokens(prev => [...prev, op]);
  };

  const handleBackspace = () => {
    if (equationTokens.length === 0) return;
    sound.playPop();
    const lastToken = equationTokens[equationTokens.length - 1];
    setEquationTokens(prev => prev.slice(0, -1));

    // If it was a number, free up its used index
    if (typeof lastToken === 'number') {
      const lastUsedIdx = usedNumberIndices[usedNumberIndices.length - 1];
      setUsedNumberIndices(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    sound.playPop();
    setEquationTokens([]);
    setUsedNumberIndices([]);
    setEvalError('');
  };

  const handleTestEscape = () => {
    if (currentVal === current.target) {
      sound.playCorrect();
      setIsEscaped(true);
      const pts = 250;
      const newScore = score + pts;
      setScore(newScore);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);
      setSolved(s => s + 1);
      if (onSaveScore) onSaveScore('equationEscape', newScore);
    } else {
      sound.playWrong();
      setShake(true);
      setEvalError(`Current equals ${currentVal ?? 'invalid'}, need ${current.target}!`);
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleNextPuzzle = () => {
    setPuzzleIdx(i => i + 1);
    setEquationTokens([]);
    setUsedNumberIndices([]);
    setCurrentVal(null);
    setEvalError('');
    setIsEscaped(false);
  };

  return (
    <div className="screen mini-game-screen eq-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🔢 Equation Escape</div>
        <div className="hud-badge-compact">Escaped: {solved}</div>
      </div>

      <div className="eq-main-container">
        <div className="hud-strip">
          <div className="hud-badge">
            <span className="lbl">Score</span>
            <span className="val">{score}</span>
          </div>
          <div className="hud-badge">
            <span className="lbl">Target Lock</span>
            <span className="val highlight">{current.target}</span>
          </div>
        </div>

        {/* Target Lock Goal Banner */}
        <div className="eq-target-banner">
          <span className="target-sub">TARGET COMBINATION</span>
          <div className="target-big-number">{current.target}</div>
          <p className="target-instr">Assemble an arithmetic expression using the numbers below!</p>
        </div>

        {/* Live Equation Display Area */}
        <div className={`eq-display-chassis ${shake ? 'shake-fx' : ''} ${isEscaped ? 'eq-escaped' : ''}`}>
          <div className="eq-tokens-row">
            {equationTokens.length === 0 ? (
              <span className="eq-placeholder">Tap numbers &amp; operators...</span>
            ) : (
              equationTokens.map((tok, i) => (
                <span
                  key={i}
                  className={`eq-token ${typeof tok === 'number' ? 'token-num' : 'token-op'}`}
                >
                  {tok}
                </span>
              ))
            )}
          </div>

          <div className="eq-eval-result">
            = {currentVal !== null ? <strong>{currentVal}</strong> : <span className="dim-dash">—</span>}
          </div>
        </div>

        {evalError && <div className="eq-error-toast animate-pop">{evalError}</div>}

        {/* Numbers Palette */}
        <div className="eq-tiles-section">
          <span className="palette-label">AVAILABLE NUMBER TILES:</span>
          <div className="eq-numbers-grid">
            {current.numbers.map((num, i) => {
              const isUsed = usedNumberIndices.includes(i);
              return (
                <button
                  key={i}
                  className={`btn-eq-num ${isUsed ? 'num-used' : ''}`}
                  onClick={() => handleAddNumber(num, i)}
                  disabled={isUsed || isEscaped}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Operator Palette */}
        <div className="eq-tiles-section">
          <span className="palette-label">OPERATORS:</span>
          <div className="eq-ops-grid">
            {OPERATORS.map((op) => (
              <button
                key={op}
                className="btn-eq-op"
                onClick={() => handleAddOperator(op)}
                disabled={isEscaped}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="eq-actions-row">
          <button className="btn-eq-tool" onClick={handleBackspace} disabled={equationTokens.length === 0 || isEscaped}>
            ⌫ Delete
          </button>
          <button className="btn-eq-tool" onClick={handleClear} disabled={equationTokens.length === 0 || isEscaped}>
            ✕ Clear
          </button>
          {!isEscaped ? (
            <button className="btn-eq-verify" onClick={handleTestEscape}>
              Unlock Lock 🔓
            </button>
          ) : (
            <button className="btn-eq-next animate-pop" onClick={handleNextPuzzle}>
              Next Equation →
            </button>
          )}
        </div>
      </div>

      {isEscaped && <Confetti />}
    </div>
  );
}
