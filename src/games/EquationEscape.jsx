import React, { useState, useEffect, useCallback, useMemo } from "react";
import BgOrbs from "../components/BgOrbs";
import Confetti from "../components/Confetti";
import ScorePop from "../components/ScorePop";

const EQUATION_PUZZLES = [
  { id: 'eq-1', target: 24, numbers: [3, 8, 4, 6], parHint: "3 × 8 = 24" },
  { id: 'eq-2', target: 18, numbers: [5, 4, 2, 7], parHint: "(4 × 5) - 2 = 18" },
  { id: 'eq-3', target: 36, numbers: [9, 3, 2, 4], parHint: "9 × 4 = 36" },
  { id: 'eq-4', target: 25, numbers: [3, 5, 2, 10], parHint: "(10 ÷ 2) × 5 = 25" },
  { id: 'eq-5', target: 42, numbers: [6, 7, 8, 2], parHint: "6 × 7 = 42" },
  { id: 'eq-6', target: 30, numbers: [5, 6, 4, 10], parHint: "5 × 6 = 30" },
  { id: 'eq-7', target: 16, numbers: [8, 4, 2, 3], parHint: "8 × 2 = 16" },
  { id: 'eq-8', target: 50, numbers: [10, 5, 2, 25], parHint: "25 × 2 = 50" },
  { id: 'eq-9', target: 64, numbers: [8, 2, 4, 16], parHint: "16 × 4 = 64" },
  { id: 'eq-10', target: 100, numbers: [25, 4, 10, 50], parHint: "25 × 4 = 100" },
];

const TOTAL_PUZZLES = EQUATION_PUZZLES.length;
const OPERATORS = ["+", "-", "×", "÷", "(", ")"];

function getRank(solved, total) {
  const r = solved / total;
  if (r === 1) return { icon: "🏆", label: "Grand Math Alchemist", desc: "Every single arithmetic lock yielded to your genius!" };
  if (r >= 0.8) return { icon: "⚡", label: "Master Cryptologist", desc: "Brilliant arithmetic instincts and parenthesis maneuvering!" };
  if (r >= 0.5) return { icon: "🔓", label: "Lock Breaker", desc: "Good performance! Cracked multiple locks under pressure." };
  return { icon: "🔐", label: "Novice Solver", desc: "Keep practicing operator precedence and order of operations!" };
}

export default function EquationEscape({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState("ready"); // 'ready' | 'playing' | 'gameover'
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [equationTokens, setEquationTokens] = useState([]); // [{ id, type: 'number'|'operator', val, sourceIndex? }]
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

  const current = EQUATION_PUZZLES[puzzleIdx] || EQUATION_PUZZLES[0];

  const playSoundSafe = useCallback((type) => {
    try {
      if (type === 'pop') {
        if (sound?.playPop) sound.playPop();
        else if (sound?.playFlip) sound.playFlip();
      } else if (type === 'correct') {
        if (sound?.playCorrect) sound.playCorrect();
      } else if (type === 'wrong') {
        if (sound?.playWrong) sound.playWrong();
      } else if (type === 'streak') {
        if (sound?.playStreak) sound.playStreak();
      }
    } catch (e) {}
  }, [sound]);

  // Which number indices are currently active in the equation
  const usedNumberIndices = useMemo(() => {
    return equationTokens
      .filter(t => t.type === 'number' && t.sourceIndex !== undefined)
      .map(t => t.sourceIndex);
  }, [equationTokens]);

  // Count unclosed parentheses
  const parenBalance = useMemo(() => {
    let balance = 0;
    for (const t of equationTokens) {
      if (t.val === "(") balance++;
      else if (t.val === ")") balance--;
    }
    return balance;
  }, [equationTokens]);

  // Evaluate arithmetic expression safely
  const evaluateExpression = useCallback((tokens) => {
    if (tokens.length === 0) return null;
    const last = tokens[tokens.length - 1];
    if (["+", "-", "×", "÷"].includes(last.val)) return null;

    // Check paren balance
    let bal = 0;
    for (const t of tokens) {
      if (t.val === "(") bal++;
      else if (t.val === ")") bal--;
    }
    if (bal !== 0) return null;

    // Check for division by zero
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i].val === "÷" && tokens[i + 1].val === 0) {
        return "DIV_ZERO";
      }
    }

    const str = tokens.map(t => (t.val === "×" ? "*" : t.val === "÷" ? "/" : t.val)).join(" ");
    try {
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict"; return (' + str + ')')();
      if (typeof result !== "number" || !isFinite(result)) return null;
      return Math.round(result * 100) / 100;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const val = evaluateExpression(equationTokens);
    setCurrentVal(val);
  }, [equationTokens, evaluateExpression]);

  const startGame = () => {
    setPuzzleIdx(0);
    setScore(0);
    setSolved(0);
    setEquationTokens([]);
    setCurrentVal(null);
    setEvalError("");
    setIsEscaped(false);
    setHintUsed(false);
    setShowHint(false);
    setShake(false);
    setGameState("playing");
  };

  const handleAddNumber = (num, sourceIndex) => {
    if (isEscaped) return;
    if (usedNumberIndices.includes(sourceIndex)) {
      // Clicking a used number removes it from equation
      handleRemoveNumberBySource(sourceIndex);
      return;
    }
    const last = equationTokens[equationTokens.length - 1];
    if (last && last.val === ")") {
      setEvalError("Place an operator (+, -, ×, ÷) after ')' before adding a number!");
      playSoundSafe('wrong');
      return;
    }
    if (last && last.type === "number") {
      setEvalError("Place an operator between consecutive numbers!");
      playSoundSafe('wrong');
      return;
    }

    playSoundSafe('pop');
    setEquationTokens(prev => [
      ...prev,
      {
        id: 'tok-' + Date.now() + '-' + Math.random(),
        type: 'number',
        val: num,
        sourceIndex
      }
    ]);
    setEvalError("");
  };

  const handleRemoveNumberBySource = (sourceIndex) => {
    playSoundSafe('pop');
    setEquationTokens(prev => prev.filter(t => t.sourceIndex !== sourceIndex));
    setEvalError("");
  };

  const handleRemoveToken = (idx) => {
    if (isEscaped) return;
    playSoundSafe('pop');
    setEquationTokens(prev => prev.filter((_, i) => i !== idx));
    setEvalError("");
  };

  const handleAddOperator = (op) => {
    if (isEscaped) return;
    const last = equationTokens[equationTokens.length - 1];

    if (op === "(") {
      if (last && (last.type === "number" || last.val === ")")) {
        setEvalError("Place an operator before opening a parenthesis '('!");
        playSoundSafe('wrong');
        return;
      }
      playSoundSafe('pop');
      setEquationTokens(prev => [
        ...prev,
        { id: 'tok-' + Date.now() + '-' + Math.random(), type: 'operator', val: '(' }
      ]);
      setEvalError("");
      return;
    }

    if (op === ")") {
      if (parenBalance <= 0) {
        setEvalError("No matching open parenthesis to close!");
        playSoundSafe('wrong');
        return;
      }
      if (last && (["+", "-", "×", "÷"].includes(last.val) || last.val === "(")) {
        setEvalError("Cannot close parenthesis right after an operator or '('!");
        playSoundSafe('wrong');
        return;
      }
      playSoundSafe('pop');
      setEquationTokens(prev => [
        ...prev,
        { id: 'tok-' + Date.now() + '-' + Math.random(), type: 'operator', val: ')' }
      ]);
      setEvalError("");
      return;
    }

    // Standard operator (+, -, ×, ÷)
    if (equationTokens.length === 0) {
      if (op === "-") {
        // Allow negative prefix
        playSoundSafe('pop');
        setEquationTokens([{ id: 'tok-' + Date.now(), type: 'operator', val: '-' }]);
        setEvalError("");
        return;
      }
      setEvalError("An expression cannot start with " + op);
      playSoundSafe('wrong');
      return;
    }

    if (last && last.val === "(") {
      if (op === "-") {
        // Negative sign inside paren
        playSoundSafe('pop');
        setEquationTokens(prev => [...prev, { id: 'tok-' + Date.now(), type: 'operator', val: '-' }]);
        setEvalError("");
        return;
      }
      setEvalError("Cannot place '" + op + "' directly after '('!");
      playSoundSafe('wrong');
      return;
    }

    if (last && ["+", "-", "×", "÷"].includes(last.val)) {
      // User tapped another operator: swap it seamlessly!
      playSoundSafe('pop');
      setEquationTokens(prev => {
        const next = [...prev];
        next[next.length - 1] = { ...last, val: op };
        return next;
      });
      setEvalError("");
      return;
    }

    playSoundSafe('pop');
    setEquationTokens(prev => [
      ...prev,
      { id: 'tok-' + Date.now() + '-' + Math.random(), type: 'operator', val: op }
    ]);
    setEvalError("");
  };

  const handleBackspace = () => {
    if (equationTokens.length === 0 || isEscaped) return;
    playSoundSafe('pop');
    setEquationTokens(prev => prev.slice(0, -1));
    setEvalError("");
  };

  const handleClear = () => {
    if (isEscaped) return;
    playSoundSafe('pop');
    setEquationTokens([]);
    setCurrentVal(null);
    setEvalError("");
  };

  const handleUseHint = () => {
    if (hintUsed || isEscaped) return;
    setHintUsed(true);
    setShowHint(true);
    setScore(s => Math.max(0, s - 50));
    playSoundSafe('wrong');
  };

  const handleTestEscape = () => {
    if (equationTokens.length === 0) {
      playSoundSafe('wrong');
      setShake(true);
      setTimeout(() => setShake(false), 350);
      setEvalError("Tap number tiles and operators to build your equation!");
      return;
    }
    if (parenBalance !== 0) {
      playSoundSafe('wrong');
      setShake(true);
      setTimeout(() => setShake(false), 350);
      setEvalError("Unmatched parentheses! You have " + Math.abs(parenBalance) + " unclosed '('");
      return;
    }
    const last = equationTokens[equationTokens.length - 1];
    if (["+", "-", "×", "÷"].includes(last.val)) {
      playSoundSafe('wrong');
      setShake(true);
      setTimeout(() => setShake(false), 350);
      setEvalError("Expression cannot end on operator '" + last.val + "'!");
      return;
    }
    if (currentVal === "DIV_ZERO") {
      playSoundSafe('wrong');
      setShake(true);
      setTimeout(() => setShake(false), 350);
      setEvalError("Division by zero is undefined! Avoid dividing by 0.");
      return;
    }
    if (currentVal === null) {
      playSoundSafe('wrong');
      setShake(true);
      setTimeout(() => setShake(false), 350);
      setEvalError("Incomplete expression! Complete the calculation.");
      return;
    }

    if (currentVal === current.target) {
      playSoundSafe('correct');
      setIsEscaped(true);
      const basePts = 250;
      const hintDeduction = hintUsed ? 50 : 0;
      const pts = Math.max(50, basePts - hintDeduction);
      const ns = score + pts;
      setScore(ns);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);
      setSolved(s => s + 1);
      if (onSaveScore) onSaveScore("equationEscape", ns);
    } else {
      playSoundSafe('wrong');
      setShake(true);
      setTimeout(() => setShake(false), 350);
      setEvalError(`Your expression = ${currentVal}, but target lock is ${current.target}. Try again!`);
    }
  };

  const handleNextPuzzle = () => {
    const next = puzzleIdx + 1;
    if (next >= TOTAL_PUZZLES) {
      setGameState("gameover");
      if (solved + 1 >= 8) playSoundSafe('streak');
      else playSoundSafe('correct');
    } else {
      setPuzzleIdx(next);
      setEquationTokens([]);
      setCurrentVal(null);
      setEvalError("");
      setIsEscaped(false);
      setHintUsed(false);
      setShowHint(false);
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    if (gameState !== "playing") return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key >= '0' && e.key <= '9') {
        const num = parseInt(e.key, 10);
        // Find if this number exists in available number tiles
        const availableIdx = current.numbers.findIndex((n, idx) => n === num && !usedNumberIndices.includes(idx));
        if (availableIdx !== -1) {
          handleAddNumber(num, availableIdx);
        }
      } else if (e.key === '+') {
        handleAddOperator('+');
      } else if (e.key === '-') {
        handleAddOperator('-');
      } else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
        handleAddOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleAddOperator('÷');
      } else if (e.key === '(' || e.key === ')') {
        handleAddOperator(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (isEscaped) handleNextPuzzle();
        else handleTestEscape();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, current, usedNumberIndices, isEscaped, currentVal, parenBalance, equationTokens]);

  const isTargetMatched = currentVal === current.target && parenBalance === 0;
  const rank = getRank(solved, TOTAL_PUZZLES);

  return (
    <div className="screen mini-game-screen eq-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🔢 Equation Escape</div>
        <div className="hud-badge-compact">Lock {Math.min(puzzleIdx + 1, TOTAL_PUZZLES)} / {TOTAL_PUZZLES}</div>
      </div>

      {/* Ready Screen */}
      {gameState === "ready" && (
        <div className="mini-card ready-modal" style={{ maxWidth: '620px' }}>
          <div className="mode-badge-pop" style={{ background: "var(--mint-soft)", color: "var(--mint)" }}>
            Numeric Cipher · 10 Locks
          </div>
          <h2>Equation Escape 🔢</h2>
          <p className="ready-desc">
            Assemble an arithmetic equation using the available number tiles and operators (+, −, ×, ÷, parentheses)
            to hit the <strong>exact target lock value</strong>.
          </p>

          <div className="rules-grid">
            <div className="rule-item">🎯 Match the Target Lock number</div>
            <div className="rule-item">➕ Use +, −, ×, ÷, and ( ) brackets</div>
            <div className="rule-item">💡 You don't need to use all numbers</div>
            <div className="rule-item">⌨️ Full keyboard support (+ - * / Enter)</div>
          </div>

          <button className="btn-start-mini" style={{ background: "var(--mint)", marginTop: "16px" }} onClick={startGame}>
            <span>Start Escaping</span> →
          </button>
        </div>
      )}

      {/* Playing Screen */}
      {gameState === "playing" && current && (
        <div className="eq-main-container">
          <div className="hud-strip">
            <div className="hud-badge"><span className="lbl">Score</span><span className="val">{score}</span></div>
            <div className="hud-badge"><span className="lbl">Lock</span><span className="val">{puzzleIdx + 1} / {TOTAL_PUZZLES}</span></div>
            <div className="hud-badge"><span className="lbl">Target</span><span className="val highlight">{current.target}</span></div>
          </div>

          <div className="eq-target-banner">
            <span className="target-sub">TARGET LOCK CODE</span>
            <div className="target-big-number">{current.target}</div>
            <p className="target-instr">Combine numbers &amp; operators to equal {current.target}!</p>
          </div>

          {showHint && (
            <div className="eq-hint-box animate-pop">
              💡 Cipher Hint: <strong>{current.parHint}</strong>
            </div>
          )}

          {/* Equation Display Chassis */}
          <div className={`eq-display-chassis ${shake ? "shake-fx" : ""} ${isEscaped ? "eq-escaped" : ""} ${isTargetMatched ? "target-reached" : ""}`}>
            <div className="eq-tokens-row">
              {equationTokens.length === 0 ? (
                <span className="eq-placeholder">Tap number tiles &amp; operators below...</span>
              ) : (
                equationTokens.map((tok, i) => (
                  <span
                    key={tok.id || i}
                    className={`eq-token ${tok.type === "number" ? "token-num" : "token-op"}`}
                    title="Click to remove token"
                    onClick={() => handleRemoveToken(i)}
                  >
                    {tok.val}
                  </span>
                ))
              )}
            </div>
            <div className="eq-eval-row">
              <div className="eq-eval-result">
                = {currentVal === "DIV_ZERO" ? (
                  <span style={{ color: "var(--coral)", fontSize: "0.9rem" }}>Div / 0</span>
                ) : currentVal !== null ? (
                  <strong style={{ color: isTargetMatched ? "var(--mint)" : "inherit" }}>{currentVal}</strong>
                ) : (
                  <span className="dim-dash">—</span>
                )}
              </div>
              {parenBalance !== 0 && (
                <div className="eq-paren-indicator" style={{ color: "var(--amber)" }}>
                  ( {parenBalance} open
                </div>
              )}
            </div>
          </div>

          {evalError && <div className="eq-error-toast animate-pop">{evalError}</div>}

          {/* Numbers Palette */}
          <div className="eq-tiles-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="palette-label">AVAILABLE NUMBER TILES:</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>(click tile to add or recall)</span>
            </div>
            <div className="eq-numbers-grid">
              {current.numbers.map((num, i) => {
                const isUsed = usedNumberIndices.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    className={`btn-eq-num ${isUsed ? "num-used" : ""}`}
                    onClick={() => handleAddNumber(num, i)}
                    disabled={isEscaped}
                    title={isUsed ? "Click to return this number" : `Use ${num}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operators Palette */}
          <div className="eq-tiles-section">
            <span className="palette-label">OPERATORS:</span>
            <div className="eq-ops-grid">
              {OPERATORS.map((op) => (
                <button
                  key={op}
                  type="button"
                  className="btn-eq-op"
                  onClick={() => handleAddOperator(op)}
                  disabled={isEscaped}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="eq-actions-row">
            <button className="btn-eq-tool" onClick={handleBackspace} disabled={equationTokens.length === 0 || isEscaped}>
              ⌫ Delete
            </button>
            <button className="btn-eq-tool" onClick={handleClear} disabled={equationTokens.length === 0 || isEscaped}>
              ✕ Clear
            </button>
            {!hintUsed && !isEscaped && (
              <button className="btn-eq-tool btn-eq-hint" onClick={handleUseHint}>
                💡 Hint (−50 pts)
              </button>
            )}
            {!isEscaped ? (
              <button
                className={`btn-eq-verify ${isTargetMatched ? "ready-to-unlock" : ""}`}
                onClick={handleTestEscape}
              >
                {isTargetMatched ? "Unlock Lock! 🔓" : "Check Equation"}
              </button>
            ) : (
              <button className="btn-eq-next animate-pop" onClick={handleNextPuzzle}>
                {puzzleIdx + 1 < TOTAL_PUZZLES ? "Next Lock →" : "See Final Score →"}
              </button>
            )}
          </div>

          <div className="eq-keyboard-note">
            ⌨️ Keyboard supported: numbers, + − * / ( ), Backspace, Enter to unlock
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === "gameover" && (
        <div className="mini-card gameover-modal">
          {solved >= 7 && <Confetti />}
          <div className="gameover-icon">{rank.icon}</div>
          <h2>{rank.label}</h2>
          <p className="ready-desc">{rank.desc}</p>
          <div className="results-metrics">
            <div className="metric-box"><span className="m-val">{score}</span><span className="m-lbl">Score</span></div>
            <div className="metric-box"><span className="m-val">{solved} / {TOTAL_PUZZLES}</span><span className="m-lbl">Locks Escaped</span></div>
            <div className="metric-box"><span className="m-val">{Math.round((solved / TOTAL_PUZZLES) * 100)}%</span><span className="m-lbl">Accuracy</span></div>
          </div>
          <div className="modal-actions">
            <button className="btn-play-again" style={{ background: "var(--mint)" }} onClick={startGame}>
              Play Again ↺
            </button>
            <button className="btn-hub" onClick={onBack}>
              Arcade Hub
            </button>
          </div>
        </div>
      )}

      {isEscaped && gameState === "playing" && <Confetti />}
    </div>
  );
}
