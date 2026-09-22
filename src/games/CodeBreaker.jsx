import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const WORDS = [
  'BRAIN', 'SMART', 'LIGHT', 'SHINE', 'FOCUS', 'FLASH',
  'POWER', 'MAGIC', 'TIGER', 'ZEBRA', 'FROST', 'STORM',
  'CLOUD', 'SOLAR', 'LUNAR', 'ORBIT', 'SWIFT', 'FLAME',
  'STONE', 'WATER', 'EARTH', 'SPACE', 'CYBER', 'ROBOT'
];

function shiftStr(str, n) {
  return str
    .split('')
    .map(ch => {
      const code = ch.charCodeAt(0) - 65;
      const shifted = (code + n + 26) % 26;
      return String.fromCharCode(65 + shifted);
    })
    .join('');
}

function atbashStr(str) {
  return str
    .split('')
    .map(ch => {
      const code = ch.charCodeAt(0) - 65;
      return String.fromCharCode(65 + (25 - code));
    })
    .join('');
}

function wordValue(str) {
  return str.split('').reduce((acc, ch) => acc + (ch.charCodeAt(0) - 64), 0);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateDynamicCipher() {
  const types = ['shift_pos', 'shift_neg', 'atbash', 'alternating', 'val_sum', 'reverse_shift'];
  const type = types[Math.floor(Math.random() * types.length)];

  // Pick 2 distinct words
  const w1 = WORDS[Math.floor(Math.random() * WORDS.length)];
  let w2 = WORDS[Math.floor(Math.random() * WORDS.length)];
  while (w2 === w1) {
    w2 = WORDS[Math.floor(Math.random() * WORDS.length)];
  }

  let typeName = '';
  let rule = '';
  let example = {};
  let target = '';
  let answer = '';
  let options = [];

  if (type === 'shift_pos') {
    const shift = Math.floor(Math.random() * 3) + 1; // +1, +2, or +3
    typeName = `Alphabet Shift (+${shift})`;
    rule = `Each letter is shifted forward by ${shift} in the alphabet`;
    example = { word: w1, code: shiftStr(w1, shift) };
    target = w2;
    answer = shiftStr(w2, shift);

    // Distractors
    const f1 = shiftStr(w2, shift + 1);
    const f2 = shiftStr(w2, shift - 1);
    const f3 = shiftStr(w2, shift + 2);
    options = [answer, f1, f2, f3];
  } else if (type === 'shift_neg') {
    const shift = Math.floor(Math.random() * 2) + 1; // -1 or -2
    typeName = `Alphabet Shift (-${shift})`;
    rule = `Each letter is shifted backward by ${shift} in the alphabet`;
    example = { word: w1, code: shiftStr(w1, -shift) };
    target = w2;
    answer = shiftStr(w2, -shift);

    // Distractors
    const f1 = shiftStr(w2, -shift - 1);
    const f2 = shiftStr(w2, -shift + 1);
    const f3 = shiftStr(w2, shift);
    options = [answer, f1, f2, f3];
  } else if (type === 'atbash') {
    typeName = 'Reverse Mirror Cipher';
    rule = 'Letters mapped to reverse alphabet positions (A↔Z, B↔Y, C↔X)';
    example = { word: w1, code: atbashStr(w1) };
    target = w2;
    answer = atbashStr(w2);

    // Distractors: alter 1 or 2 letters
    const arr = answer.split('');
    const f1Arr = [...arr];
    f1Arr[0] = String.fromCharCode(65 + ((f1Arr[0].charCodeAt(0) - 64) % 26));
    const f2Arr = [...arr];
    f2Arr[f2Arr.length - 1] = String.fromCharCode(65 + ((f2Arr[f2Arr.length - 1].charCodeAt(0) - 63) % 26));
    const f3 = shiftStr(w2, 1);
    options = [answer, f1Arr.join(''), f2Arr.join(''), f3];
  } else if (type === 'alternating') {
    typeName = 'Alternating Shift (+1, -1)';
    rule = 'Odd position letters shift +1, even position letters shift -1';
    const alt = (w) => w.split('').map((ch, i) => shiftStr(ch, i % 2 === 0 ? 1 : -1)).join('');
    example = { word: w1, code: alt(w1) };
    target = w2;
    answer = alt(w2);

    const f1 = w2.split('').map((ch, i) => shiftStr(ch, i % 2 === 0 ? -1 : 1)).join('');
    const f2 = shiftStr(w2, 1);
    const f3 = shiftStr(w2, -1);
    options = [answer, f1, f2, f3];
  } else if (type === 'val_sum') {
    typeName = 'Letter Position Sum';
    rule = 'Sum of alphabet position numbers (A=1, B=2, C=3... Z=26)';
    const v1 = wordValue(w1);
    const v2 = wordValue(w2);
    example = { word: `${w1} (Sum)`, code: `${v1}` };
    target = `${w2} (Sum)`;
    answer = `${v2}`;

    options = [`${v2}`, `${v2 + 2}`, `${v2 - 2}`, `${v2 + 4}`];
  } else {
    // Reverse + Shift
    typeName = 'Reverse Word + Shift (+1)';
    rule = 'Word is reversed, then each letter is shifted forward by 1';
    const revShift = (w) => shiftStr(w.split('').reverse().join(''), 1);
    example = { word: w1, code: revShift(w1) };
    target = w2;
    answer = revShift(w2);

    const f1 = w2.split('').reverse().join('');
    const f2 = shiftStr(w2, 1);
    const f3 = shiftStr(w2.split('').reverse().join(''), 2);
    options = [answer, f1, f2, f3];
  }

  // Collect 3 distinct distractors that do not match answer
  const distSet = new Set();
  const rawDistractors = options.filter(o => o && String(o).trim() !== String(answer).trim());
  for (const d of rawDistractors) {
    if (d !== answer) distSet.add(d);
  }
  let step = 1;
  while (distSet.size < 3) {
    let extra = '';
    if (type === 'val_sum') {
      const num = Number(answer) || 50;
      extra = String(num + (step % 2 === 0 ? step * 2 : -step * 2));
    } else {
      extra = shiftStr(answer, step);
    }
    if (extra && extra !== answer) distSet.add(extra);
    step++;
  }
  const finalOptions = Array.from(distSet).slice(0, 3);
  // Pick random position 0, 1, 2, or 3 (A, B, C, or D) for the correct answer
  const correctSlot = Math.floor(Math.random() * 4);
  finalOptions.splice(correctSlot, 0, answer);

  return {
    type: typeName,
    rule,
    example,
    target,
    answer,
    options: finalOptions,
  };
}

export default function CodeBreaker({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready');
  const [currentQ, setCurrentQ] = useState(null);
  const [round, setRound] = useState(1);
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

  const nextQuestion = useCallback(() => {
    setCurrentQ(generateDynamicCipher());
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
    setRound(1);
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

    if (opt === currentQ.answer) {
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

      setTimeout(() => {
        setRound(r => r + 1);
        nextQuestion();
      }, 900);
    } else {
      sound.playWrong();
      setStreak(0);
      setTimeout(() => {
        setRound(r => r + 1);
        nextQuestion();
      }, 1200);
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

      {gameState === 'playing' && currentQ && (
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
            <div className="cipher-type-badge">{currentQ.type}</div>

            <div className="cipher-clue-box">
              <span className="clue-sub-label">SAMPLE DECRYPT:</span>
              <div className="clue-formula">
                <span className="c-word">{currentQ.example.word}</span>
                <span className="c-arrow">➔</span>
                <span className="c-code">{currentQ.example.code}</span>
              </div>
            </div>

            <div className="cipher-target-box">
              <span className="target-sub-label">DECODE TARGET:</span>
              <div className="target-prompt">
                <span className="t-word">{currentQ.target}</span>
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

          {/* Options with A, B, C, D indicators */}
          <div className="cipher-options-grid">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedOpt === opt;
              const isCorrect = opt === currentQ.answer;
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
                  <span className="opt-letter-tag">{['A', 'B', 'C', 'D'][i]}</span>
                  <span className="cipher-code-txt">{opt}</span>
                </button>
              );
            })}
          </div>

          {selectedOpt !== null && (
            <div className="cipher-explanation-toast animate-pop">
              💡 {currentQ.rule}
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
