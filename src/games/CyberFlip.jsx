import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const CARD_ITEMS = [
  { icon: '🚀', name: 'Rocket', color: '#3b82f6' },
  { icon: '💎', name: 'Diamond', color: '#06b6d4' },
  { icon: '⚡', name: 'Volt', color: '#f59e0b' },
  { icon: '🔮', name: 'Orb', color: '#a855f7' },
  { icon: '🧬', name: 'Helix', color: '#10b981' },
  { icon: '👾', name: 'Alien', color: '#ec4899' },
  { icon: '🎯', name: 'Target', color: '#ef4444' },
  { icon: '🔥', name: 'Fire', color: '#f97316' },
];

function generateDeck() {
  const deck = [];
  CARD_ITEMS.forEach((item, index) => {
    deck.push({ id: `${index}-a`, pairId: index, ...item });
    deck.push({ id: `${index}-b`, pairId: index, ...item });
  });
  // Shuffle
  return deck.sort(() => 0.5 - Math.random());
}

export default function CyberFlip({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'won' | 'gameover'
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(65);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  // Powerups: 1 charge each
  const [powerups, setPowerups] = useState({ xray: true, freeze: true, radar: true });
  const [isXrayActive, setIsXrayActive] = useState(false);
  const [isFreezeActive, setIsFreezeActive] = useState(false);
  const [radarPair, setRadarPair] = useState([]);

  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const freezeTimeoutRef = useRef(null);
  const lockBoardRef = useRef(false);

  const startGame = () => {
    const newDeck = generateDeck();
    setCards(newDeck);
    setFlippedCards([]);
    setMatchedIds([]);
    setMoves(0);
    setTimeLeft(65);
    setScore(0);
    setStreak(0);
    scoreRef.current = 0;
    setPowerups({ xray: true, freeze: true, radar: true });
    setIsXrayActive(false);
    setIsFreezeActive(false);
    setRadarPair([]);
    lockBoardRef.current = false;
    setGameState('playing');
  };

  const endGame = useCallback((status) => {
    clearInterval(timerRef.current);
    clearTimeout(freezeTimeoutRef.current);
    setGameState(status);
    if (status === 'won') {
      sound.playLevelUp();
    } else {
      sound.playTimeout();
    }
    if (onSaveScore) onSaveScore('cyberFlip', scoreRef.current);
  }, [sound, onSaveScore]);

  // Timer loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      if (isFreezeActive) return; // Don't decrease time while frozen

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
  }, [gameState, isFreezeActive, endGame, sound]);

  // Handle Card Click
  const handleCardClick = (index) => {
    if (lockBoardRef.current || gameState !== 'playing') return;

    const card = cards[index];
    // Already matched or already open
    if (matchedIds.includes(card.pairId) || flippedCards.includes(index)) return;

    sound.playFlip();
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    // If 2 cards flipped
    if (newFlipped.length === 2) {
      lockBoardRef.current = true;
      setMoves(m => m + 1);

      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.pairId === secondCard.pairId) {
        // MATCH!
        sound.playMatch();
        const newStreak = streak + 1;
        setStreak(newStreak);

        const streakBonus = newStreak * 25;
        const pts = 100 + streakBonus;
        scoreRef.current += pts;
        setScore(scoreRef.current);
        setLastPts(pts);
        setScoreTrigger(t => t + 1);

        const newMatched = [...matchedIds, firstCard.pairId];
        setMatchedIds(newMatched);
        setFlippedCards([]);
        setRadarPair([]);
        lockBoardRef.current = false;

        // Check if all matched
        if (newMatched.length === CARD_ITEMS.length) {
          const timeBonus = timeLeft * 15;
          scoreRef.current += timeBonus;
          setScore(scoreRef.current);
          endGame('won');
        }
      } else {
        // WRONG PAIR
        setStreak(0);
        setTimeout(() => {
          setFlippedCards([]);
          lockBoardRef.current = false;
        }, 750);
      }
    }
  };

  // Powerup 1: X-Ray Scan
  const useXray = () => {
    if (!powerups.xray || gameState !== 'playing' || lockBoardRef.current) return;
    setPowerups(p => ({ ...p, xray: false }));
    sound.playPowerup();
    setIsXrayActive(true);
    setTimeout(() => {
      setIsXrayActive(false);
    }, 1400);
  };

  // Powerup 2: Time Freeze
  const useFreeze = () => {
    if (!powerups.freeze || gameState !== 'playing') return;
    setPowerups(p => ({ ...p, freeze: false }));
    sound.playPowerup();
    setIsFreezeActive(true);
    freezeTimeoutRef.current = setTimeout(() => {
      setIsFreezeActive(false);
    }, 6000);
  };

  // Powerup 3: Radar Ping (highlight matching pair)
  const useRadar = () => {
    if (!powerups.radar || gameState !== 'playing') return;
    const unmatchedPairs = CARD_ITEMS.map((_, i) => i).filter(id => !matchedIds.includes(id));
    if (unmatchedPairs.length === 0) return;

    const targetPairId = unmatchedPairs[Math.floor(Math.random() * unmatchedPairs.length)];
    const matchingIndices = cards
      .map((c, i) => (c.pairId === targetPairId ? i : -1))
      .filter(i => i !== -1);

    setPowerups(p => ({ ...p, radar: false }));
    sound.playPowerup();
    setRadarPair(matchingIndices);
  };

  // Stars calculation
  const getStars = () => {
    if (moves <= 14 && timeLeft >= 30) return 3;
    if (moves <= 20) return 2;
    return 1;
  };

  return (
    <div className="screen mini-game-screen cyberflip-screen">
      <BgOrbs />
      {gameState === 'won' && <Confetti />}
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Top Bar */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🃏 Cyber Flip 3D</div>
        <div className={`timer-pill ${isFreezeActive ? 'frozen' : timeLeft <= 10 ? 'danger' : ''}`}>
          {isFreezeActive ? '❄️ FROZEN' : `⏱️ ${timeLeft}s`}
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop">🃏 Spatial Memory</div>
          <h2>Cyber Flip 3D Matrix</h2>
          <p className="ready-desc">
            Test your photographic spatial recall with 3D cybernetic cards. Match all 8 pairs before the reactor times out! Equip cutting-edge cyber gadgets to turn the odds in your favor.
          </p>
          <div className="rules-grid">
            <div className="rule-item">👁️ X-Ray Scan (1.4s full reveal)</div>
            <div className="rule-item">❄️ Cryo-Freeze (+6s timer stop)</div>
            <div className="rule-item">💡 Radar Ping (locates 1 pair)</div>
            <div className="rule-item">⭐ Earn up to 3 Stars rating</div>
          </div>
          <button className="btn-start-mini" onClick={startGame}>
            <span>Engage Memory Grid</span> →
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="cyberflip-play-area">
          {/* HUD Bar */}
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

          {/* Gadget Bar */}
          <div className="cyber-gadgets-bar">
            <button
              className={`btn-gadget ${!powerups.xray ? 'used' : ''}`}
              onClick={useXray}
              disabled={!powerups.xray}
              title="Peek all cards for 1.4s"
            >
              <span className="g-icon">👁️</span>
              <span className="g-name">X-Ray</span>
            </button>
            <button
              className={`btn-gadget ${!powerups.freeze ? 'used' : ''}`}
              onClick={useFreeze}
              disabled={!powerups.freeze}
              title="Freeze timer for 6 seconds"
            >
              <span className="g-icon">❄️</span>
              <span className="g-name">Freeze</span>
            </button>
            <button
              className={`btn-gadget ${!powerups.radar ? 'used' : ''}`}
              onClick={useRadar}
              disabled={!powerups.radar}
              title="Radar highlight a pair"
            >
              <span className="g-icon">💡</span>
              <span className="g-name">Radar</span>
            </button>
          </div>

          {/* 4x4 3D Card Grid */}
          <div className="cards-grid-4x4">
            {cards.map((card, idx) => {
              const isMatched = matchedIds.includes(card.pairId);
              const isFlipped = isXrayActive || isMatched || flippedCards.includes(idx);
              const isRadarTarget = radarPair.includes(idx);

              return (
                <div
                  key={card.id}
                  className={`card-3d-wrapper ${isFlipped ? 'is-flipped' : ''} ${isMatched ? 'is-matched' : ''} ${isRadarTarget ? 'radar-glow' : ''}`}
                  onClick={() => handleCardClick(idx)}
                >
                  <div className="card-3d-inner">
                    {/* Card Back (hidden face) */}
                    <div className="card-face card-back">
                      <div className="card-back-pattern">◈</div>
                    </div>
                    {/* Card Front (revealed face) */}
                    <div
                      className="card-face card-front"
                      style={{ '--card-tint': card.color }}
                    >
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
          <h2>Grid Decoded!</h2>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Final Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{moves}</span>
              <span className="m-lbl">Total Moves</span>
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
          <h2>Reactor Overheat!</h2>
          <p className="ready-desc">Time ran out before all pairs were found.</p>
          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{matchedIds.length} / 8</span>
              <span className="m-lbl">Pairs Found</span>
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
