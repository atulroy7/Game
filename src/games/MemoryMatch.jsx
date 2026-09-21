import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const ICONS = [
  { icon: '🦊', name: 'Fox' },
  { icon: '🐼', name: 'Panda' },
  { icon: '🦁', name: 'Lion' },
  { icon: '🐬', name: 'Dolphin' },
  { icon: '🦉', name: 'Owl' },
  { icon: '🐨', name: 'Koala' },
  { icon: '🐢', name: 'Turtle' },
  { icon: '🦄', name: 'Unicorn' },
];

function generateDeck() {
  const deck = [];
  ICONS.forEach((item, index) => {
    deck.push({ id: `${index}-a`, pairId: index, ...item });
    deck.push({ id: `${index}-b`, pairId: index, ...item });
  });
  return deck.sort(() => 0.5 - Math.random());
}

export default function MemoryMatch({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'won' | 'gameover'
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const lockBoardRef = useRef(false);

  const startGame = () => {
    const newDeck = generateDeck();
    setCards(newDeck);
    setFlippedCards([]);
    setMatchedIds([]);
    setMoves(0);
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    scoreRef.current = 0;
    lockBoardRef.current = false;
    setGameState('playing');
  };

  const endGame = useCallback((status) => {
    clearInterval(timerRef.current);
    setGameState(status);
    if (status === 'won') {
      sound.playLevelUp();
    } else {
      sound.playTimeout();
    }
    if (onSaveScore) onSaveScore('memoryMatch', scoreRef.current);
  }, [sound, onSaveScore]);

  // Timer loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame('gameover');
          return 0;
        }
        if (prev <= 5) sound.playTick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState, endGame, sound]);

  // Handle card flip
  const handleCardClick = (index) => {
    if (lockBoardRef.current || gameState !== 'playing') return;

    const card = cards[index];
    if (matchedIds.includes(card.pairId) || flippedCards.includes(index)) return;

    sound.playFlip();
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      lockBoardRef.current = true;
      setMoves(m => m + 1);

      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.pairId === secondCard.pairId) {
        // MATCH
        sound.playMatch();
        const newStreak = streak + 1;
        setStreak(newStreak);

        const pts = 120 + newStreak * 20;
        scoreRef.current += pts;
        setScore(scoreRef.current);
        setLastPts(pts);
        setScoreTrigger(t => t + 1);

        const newMatched = [...matchedIds, firstCard.pairId];
        setMatchedIds(newMatched);
        setFlippedCards([]);
        lockBoardRef.current = false;

        if (newMatched.length === ICONS.length) {
          const timeBonus = timeLeft * 10;
          scoreRef.current += timeBonus;
          setScore(scoreRef.current);
          endGame('won');
        }
      } else {
        // MISMATCH
        setStreak(0);
        setTimeout(() => {
          setFlippedCards([]);
          lockBoardRef.current = false;
        }, 700);
      }
    }
  };

  const getStars = () => {
    if (moves <= 14 && timeLeft >= 25) return 3;
    if (moves <= 20) return 2;
    return 1;
  };

  return (
    <div className="screen mini-game-screen">
      <BgOrbs />
      {gameState === 'won' && <Confetti />}
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Top Bar */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🃏 Memory Match</div>
        <div className={`timer-pill ${timeLeft <= 8 ? 'danger' : ''}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop">Visual Focus &amp; Memory</div>
          <h2>Memory Match</h2>
          <p className="ready-desc">
            Test your visual recall! Flip cards to find all 8 matching pairs before time expires.
          </p>
          <div className="rules-grid">
            <div className="rule-item">🃏 8 Matching Animal Pairs</div>
            <div className="rule-item">🔥 Streak bonus for consecutive matches</div>
            <div className="rule-item">⭐ Earn up to 3 Stars</div>
            <div className="rule-item">⏱️ 60s Countdown Clock</div>
          </div>
          <button className="btn-start-mini" onClick={startGame}>
            <span>Start Matching</span> →
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="mini-game-play-area">
          {/* HUD Strip */}
          <div className="hud-strip">
            <div className="hud-badge">
              <span className="lbl">Score</span>
              <span className="val">{score}</span>
            </div>
            <div className="hud-badge">
              <span className="lbl">Moves</span>
              <span className="val">{moves}</span>
            </div>
            <div className="hud-badge">
              <span className="lbl">Pairs</span>
              <span className="val">{matchedIds.length} / 8</span>
            </div>
          </div>

          {/* 4x4 Card Grid */}
          <div className="matte-cards-grid">
            {cards.map((card, idx) => {
              const isMatched = matchedIds.includes(card.pairId);
              const isFlipped = isMatched || flippedCards.includes(idx);

              return (
                <div
                  key={card.id}
                  className={`matte-card ${isFlipped ? 'is-flipped' : ''} ${isMatched ? 'is-matched' : ''}`}
                  onClick={() => handleCardClick(idx)}
                >
                  <div className="matte-card-inner">
                    <div className="card-face card-back">
                      <span className="back-mark">✦</span>
                    </div>
                    <div className="card-face card-front">
                      <span className="card-icon">{card.icon}</span>
                      <span className="card-name">{card.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'won' && (
        <div className="mini-card gameover-modal">
          <div className="stars-banner">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={`star-icon ${i < getStars() ? 'earned' : ''}`}>★</span>
            ))}
          </div>
          <h2>Board Cleared!</h2>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Final Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{moves}</span>
              <span className="m-lbl">Moves</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{timeLeft}s</span>
              <span className="m-lbl">Time Left</span>
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

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal">
          <div className="gameover-icon">⏱️</div>
          <h2>Time's Up!</h2>
          <p className="ready-desc">You found {matchedIds.length} out of 8 pairs.</p>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{moves}</span>
              <span className="m-lbl">Moves</span>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-play-again" onClick={startGame}>
              Try Again ↺
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
