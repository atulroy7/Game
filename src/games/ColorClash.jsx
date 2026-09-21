import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const COLOR_PALETTE = [
  { name: 'RED',    hex: '#ef4444' },
  { name: 'BLUE',   hex: '#3b82f6' },
  { name: 'GREEN',  hex: '#10b981' },
  { name: 'YELLOW', hex: '#f59e0b' },
  { name: 'PURPLE', hex: '#a855f7' },
  { name: 'CYAN',   hex: '#06b6d4' },
];

export default function ColorClash({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);

  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);
  const [shake, setShake] = useState(false);

  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const bestStreakRef = useRef(0);

  // Generate question
  const nextQuestion = useCallback(() => {
    // 3 modes: 'ink' (match ink color), 'word' (match written word), 'match' (binary Yes/No)
    const modes = ['ink', 'ink', 'word', 'match', 'match'];
    const mode = modes[Math.floor(Math.random() * modes.length)];

    const wordColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    // 40% chance ink matches word, 60% chance conflict (Stroop effect)
    let inkColor;
    if (Math.random() < 0.4) {
      inkColor = wordColor;
    } else {
      const others = COLOR_PALETTE.filter(c => c.name !== wordColor.name);
      inkColor = others[Math.floor(Math.random() * others.length)];
    }

    if (mode === 'match') {
      const isMatch = wordColor.name === inkColor.name;
      setCurrentPrompt({
        mode: 'match',
        instruction: 'Do the WORD and COLOR match?',
        word: wordColor.name,
        ink: inkColor.hex,
        targetAnswer: isMatch ? 'YES' : 'NO',
        options: ['YES', 'NO'],
      });
    } else if (mode === 'ink') {
      // Options are 4 color swatches
      const others = COLOR_PALETTE.filter(c => c.name !== inkColor.name);
      const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [...shuffledOthers, inkColor].sort(() => 0.5 - Math.random());
      setCurrentPrompt({
        mode: 'ink',
        instruction: 'Pick the INK COLOR (ignore the word)',
        word: wordColor.name,
        ink: inkColor.hex,
        targetAnswer: inkColor.name,
        options,
      });
    } else {
      // 'word' mode: pick the written word
      const others = COLOR_PALETTE.filter(c => c.name !== wordColor.name);
      const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [...shuffledOthers, wordColor].sort(() => 0.5 - Math.random());
      setCurrentPrompt({
        mode: 'word',
        instruction: 'Pick the WRITTEN WORD (ignore the color)',
        word: wordColor.name,
        ink: inkColor.hex,
        targetAnswer: wordColor.name,
        options,
      });
    }
  }, []);

  const startGame = () => {
    scoreRef.current = 0;
    bestStreakRef.current = 0;
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTotalAttempts(0);
    setCorrectAttempts(0);
    setTimeLeft(30);
    setFeedback(null);
    setGameState('playing');
    nextQuestion();
  };

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState('gameover');
    sound.playTimeout();
    if (onSaveScore) onSaveScore('colorClash', scoreRef.current);
  }, [sound, onSaveScore]);

  // Timer loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        if (prev <= 5) sound.playTick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState, endGame, sound]);

  const handleSelect = (selectedAnswer) => {
    if (gameState !== 'playing' || !currentPrompt) return;

    setTotalAttempts(t => t + 1);
    const isCorrect = selectedAnswer === currentPrompt.targetAnswer;

    if (isCorrect) {
      const newStreak = streak + 1;
      const mult = newStreak >= 8 ? 3 : newStreak >= 4 ? 2 : 1;
      const pts = 50 * mult;

      scoreRef.current += pts;
      bestStreakRef.current = Math.max(bestStreakRef.current, newStreak);

      setScore(scoreRef.current);
      setStreak(newStreak);
      setBestStreak(bestStreakRef.current);
      setCorrectAttempts(c => c + 1);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);
      setFeedback('correct');

      // Add time bonus!
      setTimeLeft(t => Math.min(t + 1, 45));

      if (newStreak % 5 === 0) {
        sound.playStreak();
      } else {
        sound.playCorrect();
      }
    } else {
      setStreak(0);
      setFeedback('wrong');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      sound.playWrong();
      // Penalty: deduct 2s
      setTimeLeft(t => Math.max(t - 2, 0));
    }

    setTimeout(() => {
      setFeedback(null);
      nextQuestion();
    }, 180);
  };

  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  const multiplier = streak >= 8 ? '3× FRENZY' : streak >= 4 ? '2× MULT' : '1×';

  return (
    <div className={`screen mini-game-screen ${feedback ? `feedback-${feedback}` : ''}`}>
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Top Bar */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">⚡ Color Clash</div>
        <div className={`timer-pill ${timeLeft <= 7 ? 'danger' : ''}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop">⚡ Reflex &amp; Focus</div>
          <h2>Color Clash Blitz</h2>
          <p className="ready-desc">
            The famous <strong>Stroop Effect</strong>! Read the instruction carefully: sometimes you match the <em>ink color</em>, sometimes the <em>word</em>, and sometimes test if they match!
          </p>
          <div className="rules-grid">
            <div className="rule-item">⏱️ 30s Speed Run</div>
            <div className="rule-item">🔥 Streak Multipliers up to 3×</div>
            <div className="rule-item">⚡ +1s for each right answer</div>
            <div className="rule-item">⚠️ -2s penalty for mistakes</div>
          </div>
          <button className="btn-start-mini" onClick={startGame}>
            <span>Engage Stroop Rush</span> →
          </button>
        </div>
      )}

      {gameState === 'playing' && currentPrompt && (
        <div className={`mini-game-play-area ${shake ? 'shake-fx' : ''}`}>
          {/* Stats Bar */}
          <div className="hud-strip">
            <div className="hud-badge">
              <span className="lbl">Score</span>
              <span className="val">{score}</span>
            </div>
            <div className={`hud-badge streak-badge ${streak >= 4 ? 'frenzy' : ''}`}>
              <span className="lbl">Streak</span>
              <span className="val">🔥 {streak} ({multiplier})</span>
            </div>
          </div>

          {/* Prompt card */}
          <div className="stroop-card">
            <div className="instruction-tag">{currentPrompt.instruction}</div>
            <div
              className="stroop-word"
              style={{ color: currentPrompt.ink }}
            >
              {currentPrompt.word}
            </div>
          </div>

          {/* Action buttons */}
          {currentPrompt.mode === 'match' ? (
            <div className="binary-buttons">
              <button
                className="btn-binary btn-yes"
                onClick={() => handleSelect('YES')}
              >
                ✅ YES
              </button>
              <button
                className="btn-binary btn-no"
                onClick={() => handleSelect('NO')}
              >
                ❌ NO
              </button>
            </div>
          ) : (
            <div className="color-swatch-grid">
              {currentPrompt.options.map((opt) => (
                <button
                  key={opt.name}
                  className="color-swatch-btn"
                  style={{ '--btn-color': opt.hex }}
                  onClick={() => handleSelect(opt.name)}
                >
                  <span className="swatch-circle" style={{ background: opt.hex }} />
                  <span className="swatch-text">{opt.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal">
          {accuracy >= 70 && <Confetti />}
          <div className="gameover-icon">{score >= 1000 ? '👑' : '⚡'}</div>
          <h2>Time's Up!</h2>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Final Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{accuracy}%</span>
              <span className="m-lbl">Accuracy</span>
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
