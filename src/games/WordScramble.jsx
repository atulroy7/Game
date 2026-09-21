import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const WORD_BANK = [
  { word: 'ORBIT', clue: 'Path around a star or planet' },
  { word: 'TIGER', clue: 'Striped jungle predator' },
  { word: 'SOLAR', clue: 'Related to the sun' },
  { word: 'RIVER', clue: 'Flowing natural stream of water' },
  { word: 'PIXEL', clue: 'Smallest element of a digital display' },
  { word: 'BRAIN', clue: 'The organ of thought and memory' },
  { word: 'CLOUD', clue: 'Water vapor condensed in the sky' },
  { word: 'FLAME', clue: 'Visible gaseous part of a fire' },
  { word: 'LASER', clue: 'Focused beam of light radiation' },
  { word: 'EAGLE', clue: 'Majestic bird of prey' },
  { word: 'ROBOT', clue: 'Automated mechanical device' },
  { word: 'STORM', clue: 'Violent atmospheric disturbance' },
  { word: 'MANGO', clue: 'Sweet tropical stone fruit' },
  { word: 'OCEAN', clue: 'Vast body of saltwater' },
  { word: 'PRISM', clue: 'Optical glass separating light colors' },
  { word: 'NINJA', clue: 'Feudal Japanese covert warrior' },
  { word: 'GALAXY', clue: 'Vast gravitationally bound system of stars' },
  { word: 'ROCKET', clue: 'Vehicle propelled by ejecting exhaust' },
  { word: 'SILVER', clue: 'Precious shiny metallic element' },
  { word: 'FOREST', clue: 'Dense growth of trees and plants' },
  { word: 'SHADOW', clue: 'Dark shape cast when light is blocked' },
  { word: 'PUZZLE', clue: 'Game or problem testing ingenuity' },
];

function shuffleString(str) {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // If shuffle matches original, swap first two
  if (arr.join('') === str && arr.length > 1) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

export default function WordScramble({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [wordsSolved, setWordsSolved] = useState(0);

  const [currentWordObj, setCurrentWordObj] = useState(null);
  const [poolTiles, setPoolTiles] = useState([]); // [{ id, char, used }]
  const [placedTiles, setPlacedTiles] = useState([]); // [{ id, char }]
  const [hintsLeft, setHintsLeft] = useState(2);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const poolIndexRef = useRef(0);
  const shuffledBankRef = useRef([]);
  const timeLeftRef = useRef(45);

  // Load next word
  const nextWord = useCallback(() => {
    if (poolIndexRef.current >= shuffledBankRef.current.length) {
      shuffledBankRef.current = [...WORD_BANK].sort(() => 0.5 - Math.random());
      poolIndexRef.current = 0;
    }
    const wordItem = shuffledBankRef.current[poolIndexRef.current];
    poolIndexRef.current += 1;

    const letters = shuffleString(wordItem.word);
    const tiles = letters.map((char, index) => ({
      id: `${char}-${index}-${Date.now()}`,
      char,
      used: false,
    }));

    setCurrentWordObj(wordItem);
    setPoolTiles(tiles);
    setPlacedTiles([]);
    setFeedback(null);
  }, []);

  const startGame = () => {
    shuffledBankRef.current = [...WORD_BANK].sort(() => 0.5 - Math.random());
    poolIndexRef.current = 0;
    scoreRef.current = 0;
    timeLeftRef.current = 45;
    setScore(0);
    setWordsSolved(0);
    setTimeLeft(45);
    setHintsLeft(2);
    setGameState('playing');
    nextWord();
  };

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState('gameover');
    sound.playTimeout();
    if (onSaveScore) onSaveScore('wordScramble', scoreRef.current);
  }, [sound, onSaveScore]);

  // Timer loop (pure, no setStates within updaters)
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

  // Tap a letter from the available pool to place it
  const handleSelectPoolTile = (tile) => {
    if (tile.used || feedback) return;
    sound.playFlip();

    setPoolTiles(prev =>
      prev.map(t => (t.id === tile.id ? { ...t, used: true } : t))
    );
    const nextPlaced = [...placedTiles, tile];
    setPlacedTiles(nextPlaced);

    // Check if word is complete
    if (nextPlaced.length === currentWordObj.word.length) {
      checkSolution(nextPlaced);
    }
  };

  // Tap a placed letter to return it to the pool
  const handleRemovePlacedTile = (index) => {
    if (feedback) return;
    sound.playFlip();
    const removed = placedTiles[index];
    setPlacedTiles(prev => prev.filter((_, i) => i !== index));
    setPoolTiles(prev =>
      prev.map(t => (t.id === removed.id ? { ...t, used: false } : t))
    );
  };

  // Check user's answer
  const checkSolution = (placed) => {
    const userSpelling = placed.map(t => t.char).join('');
    if (userSpelling === currentWordObj.word) {
      // CORRECT!
      sound.playCorrect();
      setFeedback('correct');

      const pts = currentWordObj.word.length * 30 + 50;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setWordsSolved(w => w + 1);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);

      // Add +5s bonus time
      timeLeftRef.current = Math.min(timeLeftRef.current + 5, 60);
      setTimeLeft(timeLeftRef.current);

      setTimeout(() => {
        nextWord();
      }, 550);
    } else {
      // WRONG
      sound.playWrong();
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
        // Reset placed tiles back to pool
        setPlacedTiles([]);
        setPoolTiles(prev => prev.map(t => ({ ...t, used: false })));
      }, 600);
    }
  };

  // Shuffle the remaining available tiles visually
  const handleShuffle = () => {
    sound.playFlip();
    setPoolTiles(prev => [...prev].sort(() => 0.5 - Math.random()));
  };

  // Use a hint: reveals next correct letter
  const handleHint = () => {
    if (hintsLeft <= 0 || !currentWordObj || feedback) return;
    sound.playPowerup();
    setHintsLeft(h => h - 1);

    const targetChar = currentWordObj.word[placedTiles.length];
    // Find an unused pool tile with this character
    const availableTile = poolTiles.find(t => !t.used && t.char === targetChar);
    if (availableTile) {
      handleSelectPoolTile(availableTile);
    }
  };

  return (
    <div className="screen mini-game-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Top Bar */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🔤 Word Scramble</div>
        <div className={`timer-pill ${timeLeft <= 8 ? 'danger' : ''}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop">Vocabulary &amp; Speed</div>
          <h2>Word Scramble Dash</h2>
          <p className="ready-desc">
            Unscramble the jumbled letters before the timer runs out! Tap tiles in the correct order to spell the word.
          </p>
          <div className="rules-grid">
            <div className="rule-item">💡 Clues provided for every word</div>
            <div className="rule-item">⏱️ +5s bonus time per solved word</div>
            <div className="rule-item">🔄 Shuffle button to re-orient letters</div>
            <div className="rule-item">✨ 2 Free Hints per session</div>
          </div>
          <button className="btn-start-mini" onClick={startGame}>
            <span>Start Scramble</span> →
          </button>
        </div>
      )}

      {gameState === 'playing' && currentWordObj && (
        <div className="mini-game-play-area">
          {/* HUD Strip */}
          <div className="hud-strip">
            <div className="hud-badge">
              <span className="lbl">Score</span>
              <span className="val">{score}</span>
            </div>
            <div className="hud-badge">
              <span className="lbl">Solved</span>
              <span className="val">{wordsSolved}</span>
            </div>
            <div className="hud-badge">
              <span className="lbl">Hints</span>
              <span className="val">💡 {hintsLeft}</span>
            </div>
          </div>

          {/* Clue Box */}
          <div className="word-clue-card">
            <span className="clue-label">CLUE</span>
            <p className="clue-text">{currentWordObj.clue}</p>
          </div>

          {/* Answer Slots (placed tiles) */}
          <div className={`answer-slots-row ${feedback ? `feedback-${feedback}` : ''}`}>
            {[...Array(currentWordObj.word.length)].map((_, idx) => {
              const tile = placedTiles[idx];
              return (
                <button
                  key={idx}
                  className={`slot-tile ${tile ? 'filled' : 'empty'}`}
                  onClick={() => tile && handleRemovePlacedTile(idx)}
                >
                  {tile ? tile.char : ''}
                </button>
              );
            })}
          </div>

          {/* Available Letter Pool */}
          <div className="letters-pool-wrap">
            <div className="letters-pool-row">
              {poolTiles.map((tile) => (
                <button
                  key={tile.id}
                  className={`pool-tile ${tile.used ? 'used' : ''}`}
                  onClick={() => handleSelectPoolTile(tile)}
                  disabled={tile.used}
                >
                  {tile.char}
                </button>
              ))}
            </div>
          </div>

          {/* Action Tools */}
          <div className="word-tools-row">
            <button className="btn-tool" onClick={handleShuffle} title="Shuffle remaining letters">
              🔄 Shuffle
            </button>
            <button
              className="btn-tool"
              onClick={handleHint}
              disabled={hintsLeft <= 0}
              title="Reveal 1 letter"
            >
              💡 Hint ({hintsLeft})
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal">
          {wordsSolved >= 5 && <Confetti />}
          <div className="gameover-icon">📖</div>
          <h2>Session Over!</h2>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Final Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{wordsSolved}</span>
              <span className="m-lbl">Words Solved</span>
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
