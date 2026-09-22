import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const RAPID_QUESTIONS = [
  {
    prompt: 'Is 91 a prime number?',
    answer: 'False',
    options: ['True', 'False'],
    explanation: '91 = 7 × 13 (composite)',
  },
  {
    prompt: 'Which is larger?',
    answer: '15% of 200',
    options: ['15% of 200', '25% of 100'],
    explanation: '15% of 200 = 30, while 25% of 100 = 25',
  },
  {
    prompt: 'Does a regular hexagon have 6 lines of symmetry?',
    answer: 'True',
    options: ['True', 'False'],
    explanation: 'A regular hexagon has 6 lines of symmetry',
  },
  {
    prompt: 'If yesterday was Tuesday, what day is 3 days after tomorrow?',
    answer: 'Sunday',
    options: ['Saturday', 'Sunday'],
    explanation: 'Yesterday was Tuesday -> Today is Wednesday -> Tomorrow is Thursday -> +3 days = Sunday',
  },
  {
    prompt: 'Which is smaller?',
    answer: '5/8',
    options: ['5/8', '2/3'],
    explanation: '5/8 = 0.625, while 2/3 ≈ 0.667',
  },
  {
    prompt: 'Is the word "RHYTHM" spelled correctly?',
    answer: 'True',
    options: ['True', 'False'],
    explanation: 'R-H-Y-T-H-M is the correct spelling',
  },
  {
    prompt: 'Which has more sides?',
    answer: 'Heptagon',
    options: ['Heptagon', 'Hexagon'],
    explanation: 'Heptagon has 7 sides; Hexagon has 6 sides',
  },
  {
    prompt: 'Is 1024 a power of 2?',
    answer: 'True',
    options: ['True', 'False'],
    explanation: '2¹⁰ = 1024',
  },
  {
    prompt: 'Which is heavier?',
    answer: 'Same Weight',
    options: ['1kg of Iron', 'Same Weight'],
    explanation: 'Both weigh exactly 1kg',
  },
  {
    prompt: '3 × 8 + 4 ÷ 2 = ?',
    answer: '26',
    options: ['26', '14'],
    explanation: 'Order of operations: (3×8) + (4÷2) = 24 + 2 = 26',
  },
  {
    prompt: 'Is Australia both an island and a continent?',
    answer: 'True',
    options: ['True', 'False'],
    explanation: 'Australia is formally classified as an island continent',
  },
  {
    prompt: 'Which is greater?',
    answer: '3⁴ (81)',
    options: ['4³ (64)', '3⁴ (81)'],
    explanation: '4³ = 64, while 3⁴ = 81',
  },
];

export default function Countdown60({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready');
  const [timeLeft, setTimeLeft] = useState(60);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(60);

  const current = RAPID_QUESTIONS[qIdx % RAPID_QUESTIONS.length];

  const nextQuestion = useCallback(() => {
    setQIdx(i => i + 1);
    setSelectedOpt(null);
  }, []);

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState('gameover');
    sound.playTimeout();
    if (onSaveScore) onSaveScore('countdown60', scoreRef.current);
  }, [sound, onSaveScore]);

  const startGame = () => {
    scoreRef.current = 0;
    timeLeftRef.current = 60;
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setQIdx(0);
    setGameState('playing');
    nextQuestion();
  };

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
        if (next <= 6) sound.playTick();
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState, endGame, sound]);

  const handleAnswer = (opt) => {
    if (selectedOpt !== null || gameState !== 'playing') return;
    setSelectedOpt(opt);

    if (opt === current.answer) {
      sound.playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(b => Math.max(b, newStreak));
      setCorrectCount(c => c + 1);

      const mult = newStreak >= 5 ? 3 : newStreak >= 3 ? 2 : 1;
      const pts = 50 * mult;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);

      // +1s bonus
      timeLeftRef.current = Math.min(timeLeftRef.current + 1, 60);
      setTimeLeft(timeLeftRef.current);

      if (newStreak % 4 === 0) sound.playStreak();
      setTimeout(nextQuestion, 350);
    } else {
      sound.playWrong();
      setStreak(0);
      // -3s penalty
      timeLeftRef.current = Math.max(0, timeLeftRef.current - 3);
      setTimeLeft(timeLeftRef.current);
      setTimeout(nextQuestion, 500);
    }
  };

  return (
    <div className="screen mini-game-screen countdown-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">⏱️ Countdown 60</div>
        <div className={`timer-pill ${timeLeft <= 10 ? 'danger' : ''}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop" style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>
            High-Speed Decision Gauntlet
          </div>
          <h2>Countdown 60</h2>
          <p className="ready-desc">
            You have 60 seconds on the clock. Answer rapid-fire aptitude, logic, and general knowledge questions with instant snap decisions!
          </p>
          <div className="rules-grid">
            <div className="rule-item">⏱️ 60-second continuous timer</div>
            <div className="rule-item">➕ Correct answers grant +1s bonus</div>
            <div className="rule-item">➖ Errors dock -3s penalty</div>
            <div className="rule-item">🔥 Streaks multiply your score up to 3×</div>
          </div>
          <button className="btn-start-mini" style={{ background: 'var(--coral)' }} onClick={startGame}>
            <span>Start 60s Blitz</span> →
          </button>
        </div>
      )}

      {gameState === 'playing' && current && (
        <div className="countdown-play-area">
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
              <span className="lbl">Answered</span>
              <span className="val">{correctCount}</span>
            </div>
          </div>

          {/* Time Progress Bar */}
          <div className="countdown-progress-track">
            <div
              className={`countdown-progress-bar ${timeLeft <= 15 ? 'bar-critical' : ''}`}
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            />
          </div>

          {/* Rapid Question Card */}
          <div className="countdown-q-card animate-pop">
            <h3 className="countdown-q-text">{current.prompt}</h3>
          </div>

          {/* Binary Options */}
          <div className="countdown-options-grid">
            {current.options.map((opt, i) => {
              const isSelected = selectedOpt === opt;
              const isCorrect = opt === current.answer;
              let stateClass = '';
              if (selectedOpt !== null) {
                if (isSelected) stateClass = isCorrect ? 'opt-correct' : 'opt-wrong';
                else if (isCorrect) stateClass = 'opt-revealed';
              }

              return (
                <button
                  key={i}
                  className={`btn-countdown-choice ${stateClass}`}
                  onClick={() => handleAnswer(opt)}
                  disabled={selectedOpt !== null}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal">
          {score >= 1000 && <Confetti />}
          <div className="gameover-icon">⏱️</div>
          <h2>Time's Up!</h2>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Final Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{correctCount}</span>
              <span className="m-lbl">Questions Cleared</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{bestStreak}🔥</span>
              <span className="m-lbl">Max Streak</span>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-play-again" style={{ background: 'var(--coral)' }} onClick={startGame}>
              Run Again ↺
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
