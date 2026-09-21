import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const WORDS_POOL = [
  { word: 'PLANET', clue: 'Celestial body orbiting a star' },
  { word: 'ROCKET', clue: 'Vehicle propelled into outer space' },
  { word: 'SILVER', clue: 'Precious lustrous metallic element' },
  { word: 'GALAXY', clue: 'Vast system of stars, gas, and dust' },
  { word: 'STREAM', clue: 'Flowing natural body of running water' },
  { word: 'CASTLE', clue: 'Fortified medieval royal residence' },
  { word: 'WIZARD', clue: 'Magical spellcaster or enchanter' },
  { word: 'FROZEN', clue: 'Turned into ice by severe cold' },
  { word: 'JUNGLE', clue: 'Dense tropical forest with wild tangled vegetation' },
  { word: 'PIRATE', clue: 'High-seas raider seeking hidden treasure' },
  { word: 'SHADOW', clue: 'Dark outline cast when light is blocked' },
  { word: 'SPRING', clue: 'Season of blossoming flowers and renewal' },
  { word: 'BRIGHT', clue: 'Emitting or reflecting much luminous light' },
  { word: 'COSMOS', clue: 'The universe seen as a well-ordered whole' },
  { word: 'MAGNET', clue: 'Object producing an invisible magnetic field' },
  { word: 'VALLEY', clue: 'Low area between hills or mountains' },
  { word: 'TURTLE', clue: 'Slow-moving reptile with a hard bony shell' },
  { word: 'CANYON', clue: 'Deep gorge typically carved by a river' },
  { word: 'SUMMIT', clue: 'The highest point or peak of a mountain' },
  { word: 'ISLAND', clue: 'Tract of land surrounded entirely by water' },
  { word: 'TEMPLE', clue: 'Sacred building dedicated to worship' },
  { word: 'VORTEX', clue: 'Mass of whirling air or whirlpool fluid' },
  { word: 'METEOR', clue: 'Streak of light formed when space rock enters atmosphere' },
];

function jumbleWord(str) {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (arr.join('') === str && arr.length > 1) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr.join('');
}

const MAX_ATTEMPTS = 5;

export default function Scramble5({ sound, onBack, onSaveScore }) {
  const [currentWordItem, setCurrentWordItem] = useState(null);
  const [scrambledStr, setScrambledStr] = useState('');
  
  // Attempts state: array of 5 rows. Each row: string or null
  const [guesses, setGuesses] = useState([]); // array of strings
  const [currentInput, setCurrentInput] = useState('');
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'won' | 'lost'

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);
  const [shakeRow, setShakeRow] = useState(false);
  const [revealClue, setRevealClue] = useState(false);

  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const poolIndexRef = useRef(0);
  const shuffledPoolRef = useRef([]);

  // Load a new word
  const loadWord = useCallback(() => {
    if (poolIndexRef.current >= shuffledPoolRef.current.length) {
      shuffledPoolRef.current = [...WORDS_POOL].sort(() => 0.5 - Math.random());
      poolIndexRef.current = 0;
    }
    const item = shuffledPoolRef.current[poolIndexRef.current];
    poolIndexRef.current += 1;

    setCurrentWordItem(item);
    setScrambledStr(jumbleWord(item.word));
    setGuesses([]);
    setCurrentInput('');
    setGameState('playing');
    setRevealClue(false);
  }, []);

  // Start initial session
  useEffect(() => {
    shuffledPoolRef.current = [...WORDS_POOL].sort(() => 0.5 - Math.random());
    poolIndexRef.current = 0;
    scoreRef.current = 0;
    streakRef.current = 0;
    loadWord();
  }, [loadWord]);

  // Handle typing input
  const handleCharInput = (char) => {
    if (gameState !== 'playing' || !currentWordItem) return;
    const upper = char.toUpperCase();
    if (/^[A-Z]$/.test(upper)) {
      if (currentInput.length < currentWordItem.word.length) {
        sound.playFlip();
        setCurrentInput(prev => prev + upper);
      }
    }
  };

  const handleBackspace = () => {
    if (gameState !== 'playing') return;
    sound.playFlip();
    setCurrentInput(prev => prev.slice(0, -1));
  };

  // Submit current attempt
  const handleSubmitGuess = () => {
    if (gameState !== 'playing' || !currentWordItem) return;

    if (currentInput.length < currentWordItem.word.length) {
      setShakeRow(true);
      sound.playWrong();
      setTimeout(() => setShakeRow(false), 350);
      return;
    }

    const nextGuesses = [...guesses, currentInput];
    setGuesses(nextGuesses);
    const attemptIndex = nextGuesses.length;

    if (currentInput === currentWordItem.word) {
      // WON THIS WORD!
      sound.playMatch();
      setGameState('won');

      streakRef.current += 1;
      const newStreak = streakRef.current;
      setStreak(newStreak);
      setBestStreak(b => Math.max(b, newStreak));
      setSolvedCount(s => s + 1);

      // Points formula: fewer attempts = higher score (up to 1000 pts)
      const attemptBonus = (MAX_ATTEMPTS - attemptIndex + 1) * 180;
      const pts = 200 + attemptBonus;
      scoreRef.current += pts;

      setScore(scoreRef.current);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);

      if (onSaveScore) onSaveScore('scramble5', scoreRef.current);
    } else if (nextGuesses.length >= MAX_ATTEMPTS) {
      // LOST AFTER 5 ATTEMPTS
      sound.playWrong();
      setGameState('lost');
      streakRef.current = 0;
      setStreak(0);
      if (onSaveScore) onSaveScore('scramble5', scoreRef.current);
    } else {
      // Mismatched guess, move to next attempt
      sound.playCorrect();
      setCurrentInput('');
    }
  };

  // Physical keyboard support
  useEffect(() => {
    const onKeyDown = (e) => {
      if (gameState !== 'playing') return;
      if (e.key === 'Enter') {
        handleSubmitGuess();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleCharInput(e.key);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, currentInput, currentWordItem, guesses]);

  // Compute tile statuses (Green = correct spot, Amber = wrong spot, Muted = not in word)
  const getLetterStatus = (guessWord, targetWord, charIndex) => {
    const char = guessWord[charIndex];
    if (char === targetWord[charIndex]) {
      return 'status-exact'; // Green
    }
    if (targetWord.includes(char)) {
      return 'status-present'; // Amber
    }
    return 'status-absent'; // Muted
  };

  const wordLength = currentWordItem ? currentWordItem.word.length : 6;

  // On-screen keyboard keys layout
  const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
  ];

  return (
    <div className="screen mini-game-screen scramble5-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />
      {gameState === 'won' && <Confetti />}

      {/* Top Bar */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🔤 Scramble 5</div>
        <div className="timer-pill">
          Attempt {Math.min(guesses.length + (gameState === 'playing' ? 1 : 0), MAX_ATTEMPTS)} of {MAX_ATTEMPTS}
        </div>
      </div>

      {currentWordItem && (
        <div className="mini-game-play-area">
          {/* HUD Strip */}
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
              <span className="lbl">Solved</span>
              <span className="val">{solvedCount}</span>
            </div>
          </div>

          {/* Scramble & Clue Card */}
          <div className="scramble-target-card">
            <div className="scramble-card-top">
              <span className="scramble-lbl">SCRAMBLED WORD</span>
              <button
                className="btn-clue-toggle"
                onClick={() => setRevealClue(prev => !prev)}
                title="Toggle Clue"
              >
                💡 {revealClue ? 'Hide Clue' : 'Show Clue'}
              </button>
            </div>

            {/* Scrambled Letters Tiles Display */}
            <div className="scrambled-letters-row">
              {scrambledStr.split('').map((char, i) => (
                <span key={i} className="scramble-char-pill">
                  {char}
                </span>
              ))}
            </div>

            {revealClue && (
              <p className="scramble-clue-text animate-pop">
                Clue: <em>"{currentWordItem.clue}"</em>
              </p>
            )}
          </div>

          {/* 5-Attempts Grid */}
          <div className="attempts-grid">
            {[...Array(MAX_ATTEMPTS)].map((_, rowIndex) => {
              const submittedGuess = guesses[rowIndex];
              const isCurrentRow = rowIndex === guesses.length && gameState === 'playing';

              return (
                <div
                  key={rowIndex}
                  className={`attempt-row ${isCurrentRow && shakeRow ? 'shake-fx' : ''}`}
                >
                  {[...Array(wordLength)].map((_, colIndex) => {
                    let letter = '';
                    let statusClass = 'empty';

                    if (submittedGuess) {
                      letter = submittedGuess[colIndex] || '';
                      statusClass = getLetterStatus(submittedGuess, currentWordItem.word, colIndex);
                    } else if (isCurrentRow) {
                      letter = currentInput[colIndex] || '';
                      statusClass = letter ? 'filled' : 'empty';
                    }

                    return (
                      <div key={colIndex} className={`attempt-cell ${statusClass}`}>
                        {letter}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Win / Loss Overlay Alert */}
          {gameState === 'won' && (
            <div className="round-result-card animate-pop" style={{ borderColor: 'var(--mint)' }}>
              <div className="result-headline" style={{ color: 'var(--mint)' }}>
                🎉 Unscrambled in {guesses.length} {guesses.length === 1 ? 'attempt' : 'attempts'}!
              </div>
              <p className="result-word-reveal">
                The word was <strong>{currentWordItem.word}</strong>
              </p>
              <button
                className="btn-next-word"
                style={{ background: 'var(--mint)' }}
                onClick={loadWord}
              >
                Next Word →
              </button>
            </div>
          )}

          {gameState === 'lost' && (
            <div className="round-result-card animate-pop" style={{ borderColor: 'var(--coral)' }}>
              <div className="result-headline" style={{ color: 'var(--coral)' }}>
                ❌ 5 Attempts Used!
              </div>
              <p className="result-word-reveal">
                The word was <strong style={{ color: 'var(--coral)' }}>{currentWordItem.word}</strong>
              </p>
              <div className="lost-actions-row">
                <button
                  className="btn-next-word"
                  style={{ background: 'var(--coral)' }}
                  onClick={loadWord}
                >
                  Try Another Word ↺
                </button>
                <button className="btn-hub" onClick={onBack}>
                  Arcade Hub
                </button>
              </div>
            </div>
          )}

          {/* Virtual Keyboard (for touch or click) */}
          {gameState === 'playing' && (
            <div className="virtual-keyboard">
              {KEYBOARD_ROWS.map((row, rIdx) => (
                <div key={rIdx} className="keyboard-row">
                  {row.map(key => {
                    const isEnter = key === 'ENTER';
                    const isBack = key === '⌫';

                    return (
                      <button
                        key={key}
                        className={`key-btn ${isEnter ? 'key-enter' : ''} ${isBack ? 'key-back' : ''}`}
                        onClick={() => {
                          if (isEnter) handleSubmitGuess();
                          else if (isBack) handleBackspace();
                          else handleCharInput(key);
                        }}
                      >
                        {key}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
