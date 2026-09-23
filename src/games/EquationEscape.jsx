import React, { useState, useEffect, useCallback } from "react";
import BgOrbs from "../components/BgOrbs";
import Confetti from "../components/Confetti";
import ScorePop from "../components/ScorePop";

const EQUATION_PUZZLES = [
  { target: 24, numbers: [3, 8, 4, 6], parHint: "3 × 8 = 24" },
  { target: 18, numbers: [5, 4, 2, 7], parHint: "(4 × 5) - 2 = 18" },
  { target: 36, numbers: [9, 3, 2, 4], parHint: "9 × 4 = 36" },
  { target: 25, numbers: [3, 5, 2, 10], parHint: "(10 ÷ 2) × 5 = 25" },
  { target: 42, numbers: [6, 7, 8, 2], parHint: "6 × 7 = 42" },
  { target: 30, numbers: [5, 6, 4, 10], parHint: "5 × 6 = 30" },
  { target: 16, numbers: [8, 4, 2, 3], parHint: "8 × 2 = 16" },
  { target: 50, numbers: [10, 5, 2, 25], parHint: "25 × 2 = 50" },
];

const TOTAL_PUZZLES = EQUATION_PUZZLES.length;
const OPERATORS = ["+", "-", "×", "÷", "(", ")"];

export default function EquationEscape({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState("playing"); // 'playing' | 'gameover'
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [equationTokens, setEquationTokens] = useState([]);
  const [usedNumberIndices, setUsedNumberIndices] = useState([]);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [currentVal, setCurrentVal] = useState(null);
  const [evalError, setEvalError] = useState("");
  const [shake, setShake] = useState(false);
  const [isEscaped, setIsEscaped] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const current = EQUATION_PUZZLES[puzzleIdx];

  const evaluateExpression = useCallback((tokens) => {
    if (tokens.length === 0) return null;
    const str = tokens.map(t => (t === "×" ? "*" : t === "÷" ? "/" : t)).join(" ");
    try {
      const last = tokens[tokens.length - 1];
      if (["+", "-", "×", "÷"].includes(last)) return null;
      // eslint-disable-next-line no-new-func
      const result = Function("\"use strict\"; return (" + str + ")")();
      if (typeof result !== "number" || !isFinite(result)) return null;
      return Math.round(result * 100) / 100;
    } catch { return null; }
  }, []);

  // Paren balance check
  const getParenBalance = (tokens) => {
    let balance = 0;
    for (const t of tokens) {
      if (t === "(") balance++;
      else if (t === ")") balance--;
    }
    return balance;
  };

  useEffect(() => {
    const val = evaluateExpression(equationTokens);
    setCurrentVal(val);
  }, [equationTokens, evaluateExpression]);

  const handleAddNumber = (num, idx) => {
    if (usedNumberIndices.includes(idx) || isEscaped) return;
    sound.playPop();
    setEquationTokens(prev => [...prev, num]);
    setUsedNumberIndices(prev => [...prev, idx]);
    setEvalError("");
  };

  const handleAddOperator = (op) => {
    if (isEscaped) return;
    const last = equationTokens[equationTokens.length - 1];

    // Prevent double operators
    if (["+", "-", "×", "÷"].includes(op) && ["+", "-", "×", "÷"].includes(last)) {
      setEvalError("Cannot place two operators in a row!");
      return;
    }
    // Prevent opening paren right after a number
    if (op === "(" && typeof last === "number") {
      setEvalError("Place an operator before opening a parenthesis.");
      return;
    }
    // Prevent closing paren if balance would go negative
    if (op === ")" && getParenBalance(equationTokens) <= 0) {
      setEvalError("No matching open parenthesis!");
      return;
    }
    sound.playPop();
    setEquationTokens(prev => [...prev, op]);
    setEvalError("");
  };

  const handleBackspace = () => {
    if (equationTokens.length === 0 || isEscaped) return;
    sound.playPop();
    const lastToken = equationTokens[equationTokens.length - 1];
    setEquationTokens(prev => prev.slice(0, -1));
    if (typeof lastToken === "number") {
      setUsedNumberIndices(prev => prev.slice(0, -1));
    }
    setEvalError("");
  };

  const handleClear = () => {
    if (isEscaped) return;
    sound.playPop();
    setEquationTokens([]); setUsedNumberIndices([]);
    setCurrentVal(null); setEvalError(""); setShowHint(false);
  };

  const handleUseHint = () => {
    if (hintUsed || isEscaped) return;
    setHintUsed(true);
    setShowHint(true);
    // Deduct 50 pts (can go negative for the round, floor at 0 for display)
    setScore(s => Math.max(0, s - 50));
    sound.playWrong();
  };

  const handleTestEscape = () => {
    // Validate: no unclosed parens
    const balance = getParenBalance(equationTokens);
    if (balance !== 0) {
      sound.playWrong(); setShake(true); setTimeout(() => setShake(false), 400);
      setEvalError("Unmatched parentheses! Open: " + balance);
      return;
    }
    // Validate: must not end on operator
    const last = equationTokens[equationTokens.length - 1];
    if (["+", "-", "×", "÷"].includes(last)) {
      sound.playWrong(); setShake(true); setTimeout(() => setShake(false), 400);
      setEvalError("Expression ends on an operator!");
      return;
    }
    if (currentVal === null) {
      sound.playWrong(); setShake(true); setTimeout(() => setShake(false), 400);
      setEvalError("Invalid or incomplete expression!");
      return;
    }
    if (currentVal === current.target) {
      sound.playCorrect();
      setIsEscaped(true);
      const basePts = 250;
      const hintDeduction = hintUsed ? 50 : 0;
      const pts = Math.max(50, basePts - hintDeduction);
      const ns = score + pts;
      setScore(ns); setLastPts(pts); setScoreTrigger(t => t + 1); setSolved(s => s + 1);
      if (onSaveScore) onSaveScore("equationEscape", ns);
    } else {
      sound.playWrong(); setShake(true); setTimeout(() => setShake(false), 400);
      const isDiv0 = equationTokens.some((t, i) => t === "÷" && equationTokens[i+1] === 0);
      if (isDiv0) {
        setEvalError("Division by zero is undefined! Try a different approach.");
      } else {
        setEvalError(`Your answer = ${currentVal}, but target = ${current.target}. Keep trying!`);
      }
    }
  };

  const handleNextPuzzle = () => {
    const next = puzzleIdx + 1;
    if (next >= TOTAL_PUZZLES) {
      setGameState("gameover");
      if (solved + 1 >= 6) sound.playStreak(); else sound.playCorrect();
    } else {
      setPuzzleIdx(next);
      setEquationTokens([]); setUsedNumberIndices([]);
      setCurrentVal(null); setEvalError("");
      setIsEscaped(false); setHintUsed(false); setShowHint(false);
    }
  };

  const handleRestart = () => {
    setPuzzleIdx(0); setScore(0); setSolved(0);
    setEquationTokens([]); setUsedNumberIndices([]);
    setCurrentVal(null); setEvalError("");
    setIsEscaped(false); setHintUsed(false); setShowHint(false);
    setShake(false); setGameState("playing");
  };

  const parenBalance = getParenBalance(equationTokens);

  return (
    <div className="screen mini-game-screen eq-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🔢 Equation Escape</div>
        <div className="hud-badge-compact">Escaped: {solved}/{TOTAL_PUZZLES}</div>
      </div>

      {gameState === "playing" && current && (
        <div className="eq-main-container">
          <div className="hud-strip">
            <div className="hud-badge"><span className="lbl">Score</span><span className="val">{score}</span></div>
            <div className="hud-badge"><span className="lbl">Puzzle</span><span className="val">{puzzleIdx + 1} / {TOTAL_PUZZLES}</span></div>
            <div className="hud-badge"><span className="lbl">Target</span><span className="val highlight">{current.target}</span></div>
          </div>

          <div className="eq-target-banner">
            <span className="target-sub">TARGET COMBINATION</span>
            <div className="target-big-number">{current.target}</div>
            <p className="target-instr">Assemble an arithmetic expression using the numbers below!</p>
          </div>

          {showHint && (
            <div className="eq-hint-box animate-pop">
              💡 Hint: <strong>{current.parHint}</strong>
            </div>
          )}

          <div className={`eq-display-chassis ${shake ? "shake-fx" : ""} ${isEscaped ? "eq-escaped" : ""}`}>
            <div className="eq-tokens-row">
              {equationTokens.length === 0 ? (
                <span className="eq-placeholder">Tap numbers &amp; operators...</span>
              ) : (
                equationTokens.map((tok, i) => (
                  <span key={i} className={`eq-token ${typeof tok === "number" ? "token-num" : "token-op"}`}>{tok}</span>
                ))
              )}
            </div>
            <div className="eq-eval-row">
              <div className="eq-eval-result">
                = {currentVal !== null ? <strong>{currentVal}</strong> : <span className="dim-dash">—</span>}
              </div>
              {parenBalance !== 0 && (
                <div className="eq-paren-indicator">
                  ( unclosed: {parenBalance}
                </div>
              )}
            </div>
          </div>

          {evalError && <div className="eq-error-toast animate-pop">{evalError}</div>}

          <div className="eq-tiles-section">
            <span className="palette-label">AVAILABLE NUMBER TILES:</span>
            <div className="eq-numbers-grid">
              {current.numbers.map((num, i) => {
                const isUsed = usedNumberIndices.includes(i);
                return (
                  <button key={i} className={`btn-eq-num ${isUsed ? "num-used" : ""}`}
                    onClick={() => handleAddNumber(num, i)} disabled={isUsed || isEscaped}>
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="eq-tiles-section">
            <span className="palette-label">OPERATORS:</span>
            <div className="eq-ops-grid">
              {OPERATORS.map((op) => (
                <button key={op} className="btn-eq-op" onClick={() => handleAddOperator(op)} disabled={isEscaped}>{op}</button>
              ))}
            </div>
          </div>

          <div className="eq-actions-row">
            <button className="btn-eq-tool" onClick={handleBackspace} disabled={equationTokens.length === 0 || isEscaped}>⌫ Delete</button>
            <button className="btn-eq-tool" onClick={handleClear} disabled={equationTokens.length === 0 || isEscaped}>✕ Clear</button>
            {!hintUsed && !isEscaped && (
              <button className="btn-eq-tool btn-eq-hint" onClick={handleUseHint}>💡 Hint (−50 pts)</button>
            )}
            {!isEscaped ? (
              <button className="btn-eq-verify" onClick={handleTestEscape}>Unlock Lock 🔓</button>
            ) : (
              <button className="btn-eq-next animate-pop" onClick={handleNextPuzzle}>
                {puzzleIdx + 1 < TOTAL_PUZZLES ? "Next Equation →" : "See Final Score →"}
              </button>
            )}
          </div>
        </div>
      )}

      {gameState === "gameover" && (
        <div className="mini-card gameover-modal">
          {solved >= 6 && <Confetti />}
          <div className="gameover-icon">🔢</div>
          <h2>{solved >= 6 ? "Equation Mastermind!" : solved >= 4 ? "Logic Architect!" : "Keep Solving!"}</h2>
          <p className="ready-desc">
            {solved >= 6 ? "Flawless! You cracked every numeric lock." : solved >= 4 ? "Strong mathematical reasoning!" : "Equations need practice — try a different approach!"}
          </p>
          <div className="results-metrics">
            <div className="metric-box"><span className="m-val">{score}</span><span className="m-lbl">Score</span></div>
            <div className="metric-box"><span className="m-val">{solved} / {TOTAL_PUZZLES}</span><span className="m-lbl">Escaped</span></div>
          </div>
          <div className="modal-actions">
            <button className="btn-play-again" style={{ background:"var(--mint)" }} onClick={handleRestart}>Play Again ↺</button>
            <button className="btn-hub" onClick={onBack}>Arcade Hub</button>
          </div>
        </div>
      )}

      {isEscaped && gameState === "playing" && <Confetti />}
    </div>
  );
}
