import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const CIPHER_QUESTIONS = [
  {
    type: 'Shift +1',
    rule: 'Each letter is shifted forward by 1 in the alphabet (A→B, B→C)',
    example: { word: 'BRAIN', code: 'CSBJO' },
    target: 'SMART',
    answer: 'TNBUS',
    options: ['TNBUS', 'TLBQS', 'TMCUS', 'SMBRT'],
  },
  {
    type: 'Shift +2',
    rule: 'Each letter is shifted forward by 2 in the alphabet (A→C, D→F)',
    example: { word: 'TIGER', code: 'VKIGT' },
    target: 'ZEBRA',
    answer: 'BGDTC',
    options: ['BGDTC', 'AFCSB', 'BGCUB', 'AGDSB'],
  },
  {
    type: 'Shift -1',
    rule: 'Each letter is shifted backward by 1 in the alphabet (B→A, Z→Y)',
    example: { word: 'LIGHT', code: 'KHFGS' },
    target: 'SHINE',
    answer: 'RGHMD',
    options: ['RGHMD', 'THJOF', 'QFHMC', 'RGINE'],
  },
  {
    type: 'Alphabet Reverse Mirror',
    rule: 'Letters are mapped to their reverse alphabet positions (A↔Z, B↔Y, C↔X)',
    example: { word: 'BOY', code: 'YLB' },
    target: 'MAN',
    answer: 'NZM',
    options: ['NZM', 'MZN', 'OAM', 'LAM'],
  },
  {
    type: 'Alternating Shift (+1, -1)',
    rule: 'Odd positions shift +1, even positions shift -1',
    example: { word: 'GOLD', code: 'HNMC' },
    target: 'SILVER',
    answer: 'TJKUDQ',
    options: ['TJKUDQ', 'THKWDQ', 'TJMVCQ', 'RIKUCP'],
  },
  {
    type: 'Letter Position Value Sum',
    rule: 'Sum of alphabet order values (A=1, B=2, C=3... Z=26)',
    example: { word: 'CAT (3+1+20)', code: '24' },
    target: 'DOG (4+15+7)',
    answer: '26',
    options: ['26', '24', '28', '25'],
  },
  {
    type: 'Vowel/Consonant Double',
    rule: 'Each vowel shifts +2, each consonant shifts +1',
    example: { word: 'BIRD', code: 'CKSE' },
    target: 'FROG',
    answer: 'GSQH',
    options: ['GSQH', 'GSOG', 'FRPH', 'HTRI'],
  },
  {
    type: 'Reverse String + Shift',
    rule: 'Word is reversed then shifted forward by 1',
    example: { word: 'STAR', code: 'SBUU (RATS + 1)' },
    target: 'MOON',
    answer: 'OPPN',
    options: ['OPPN', 'NOOM', 'OPPM', 'NPPO'],
  },
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CodeBreaker({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready');
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [showHelper, setShowHelper] = useState(true);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(25);

  const q = CIPHER_QUESTIONS[qIdx % CIPHER_QUESTIONS.length];

  const shuffledOptions = React.useMemo(() => {
    return shuffleArray(q.options);
  }, [q]);

  const nextQuestion = useCallback(() => {
    setQIdx(i => i + 1);
    setSelectedOpt(null);
    timeLeftRef.current = 25;
    setTimeLeft(25);
  }, []);

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState('gameover');
    sound.playTimeout();
    if (onSaveScore) onSaveScore('codeBreaker', scoreRef.current);
  }, [sound, onSaveScore]);

  const startGame = () => {
    scoreRef.current = 0;
    setScore(0);
    setStreak(0);
    setSolved(0);
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
        if (next <= 5) sound.playTick();
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState, endGame, sound]);

  const handleSelectOption = (opt) => {
    if (selectedOpt !== null || gameState !== 'playing') return;
    setSelectedOpt(opt);

    if (opt === q.answer) {
      sound.playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setSolved(s => s + 1);

      const mult = newStreak >= 4 ? 2 : 1;
      const pts = (100 + timeLeftRef.current * 4) * mult;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);

      setTimeout(nextQuestion, 900);
    } else {
      sound.playWrong();
      setStreak(0);
      setTimeout(nextQuestion, 1200);
    }
  };

  return (
    <div className="screen mini-game-screen cipher-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🔎 Code Breaker</div>
        <div className={`timer-pill ${timeLeft <= 6 ? 'danger' : ''}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop" style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}>
            Analytical Cipher Decoding
          </div>
          <h2>Code Breaker</h2>
          <p className="ready-desc">
            Decrypt encrypted intelligence codes! Analyze sample word transformations and decipher the target encrypted message.
          </p>
          <div className="rules-grid">
            <div className="rule-item">🔤 Letter shift &amp; substitution ciphers</div>
            <div className="rule-item">🔢 Alphabet position reference helper</div>
            <div className="rule-item">⏱️ 25 seconds per encrypted transmission</div>
            <div className="rule-item">🔥 Streak bonuses for rapid decodes</div>
          </div>
          <button className="btn-start-mini" style={{ background: 'var(--violet)' }} onClick={startGame}>
            <span>Initialize Decoder</span> →
          </button>
        </div>
      )}

      {gameState === 'playing' && q && (
        <div className="cipher-play-area">
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
              <span className="lbl">Decoded</span>
              <span className="val">{solved}</span>
            </div>
          </div>

          {/* Cipher Terminal Dossier */}
          <div className="cipher-dossier-card">
            <div className="cipher-type-badge">{q.type}</div>

            <div className="cipher-clue-box">
              <span className="clue-sub-label">SAMPLE DECRYPT:</span>
              <div className="clue-formula">
                <span className="c-word">{q.example.word}</span>
                <span className="c-arrow">➔</span>
                <span className="c-code">{q.example.code}</span>
              </div>
            </div>

            <div className="cipher-target-box">
              <span className="target-sub-label">DECODE TARGET:</span>
              <div className="target-prompt">
                <span className="t-word">{q.target}</span>
                <span className="t-arrow">➔</span>
                <span className="t-code">? ? ? ?</span>
              </div>
            </div>
          </div>

          {/* Alphabet Helper Strip */}
          {showHelper && (
            <div className="alphabet-helper-bar">
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((char, i) => (
                <div key={char} className="alpha-item">
                  <span className="a-char">{char}</span>
                  <span className="a-num">{i + 1}</span>
                </div>
              ))}
            </div>
          )}

          {/* Options */}
          <div className="cipher-options-grid">
            {shuffledOptions.map((opt, i) => {
              const isSelected = selectedOpt === opt;
              const isCorrect = opt === q.answer;
              let stateClass = '';
              if (selectedOpt !== null) {
                if (isSelected) stateClass = isCorrect ? 'c-opt-correct' : 'c-opt-wrong';
                else if (isCorrect) stateClass = 'c-opt-revealed';
              }

              return (
                <button
                  key={i}
                  className={`btn-cipher-opt ${stateClass}`}
                  onClick={() => handleSelectOption(opt)}
                  disabled={selectedOpt !== null}
                >
                  <span className="cipher-code-txt">{opt}</span>
                </button>
              );
            })}
          </div>

          {selectedOpt !== null && (
            <div className="cipher-explanation-toast animate-pop">
              💡 {q.rule}
            </div>
          )}
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal">
          {score >= 800 && <Confetti />}
          <div className="gameover-icon">🔎</div>
          <h2>Session Terminated</h2>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Final Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{solved}</span>
              <span className="m-lbl">Transmissions Cracked</span>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-play-again" style={{ background: 'var(--violet)' }} onClick={startGame}>
              Crack Again ↺
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
