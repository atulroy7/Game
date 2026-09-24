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
  // Mode: 'solo' | 'pvp'
  const [mode, setMode] = useState('solo');

  // ── Solo Mode State ──
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

  // ── 1v1 PvP Mode State ──
  const [p1Name, setP1Name] = useState('Player 1');
  const [p2Name, setP2Name] = useState('Player 2');
  const [pvpTurn, setPvpTurn] = useState(1); // 1 or 2
  const [pvpPairs, setPvpPairs] = useState({ p1: 0, p2: 0 });
  const [pvpScore, setPvpScore] = useState({ p1: 0, p2: 0 });
  const [pvpStreak, setPvpStreak] = useState({ p1: 0, p2: 0 });
  const [pvpMatchedBy, setPvpMatchedBy] = useState({}); // { [pairId]: 1 | 2 }
  const [pvpAnnouncement, setPvpAnnouncement] = useState('');
  const [pvpWinner, setPvpWinner] = useState(null); // 'p1' | 'p2' | 'tie'

  // Shared refs
  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const lockBoardRef = useRef(false);
  const timeLeftRef = useRef(60);

  const pvpTurnRef = useRef(pvpTurn);
  pvpTurnRef.current = pvpTurn;
  const pvpPairsRef = useRef(pvpPairs);
  pvpPairsRef.current = pvpPairs;
  const pvpStreakRef = useRef(pvpStreak);
  pvpStreakRef.current = pvpStreak;
  const pvpScoreRef = useRef(pvpScore);
  pvpScoreRef.current = pvpScore;

  // ─────────────────────────────────────────────────────────────
  // SOLO MODE LOGIC
  // ─────────────────────────────────────────────────────────────
  const startSoloGame = () => {
    const newDeck = generateDeck();
    setCards(newDeck);
    setFlippedCards([]);
    setMatchedIds([]);
    setMoves(0);
    timeLeftRef.current = 60;
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    scoreRef.current = 0;
    lockBoardRef.current = false;
    setGameState('playing');
  };

  const endSoloGame = useCallback((status) => {
    clearInterval(timerRef.current);
    setGameState(status);
    if (status === 'won') {
      sound.playLevelUp();
    } else {
      sound.playTimeout();
    }
    if (onSaveScore) onSaveScore('memoryMatch', scoreRef.current);
  }, [sound, onSaveScore]);

  // Solo Timer loop
  useEffect(() => {
    if (mode !== 'solo' || gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      const next = timeLeftRef.current - 1;
      if (next <= 0) {
        timeLeftRef.current = 0;
        setTimeLeft(0);
        endSoloGame('gameover');
      } else {
        timeLeftRef.current = next;
        setTimeLeft(next);
        if (next <= 5) sound.playTick();
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [mode, gameState, endSoloGame, sound]);

  // ─────────────────────────────────────────────────────────────
  // 1v1 PVP MODE LOGIC
  // ─────────────────────────────────────────────────────────────
  const startPvpGame = () => {
    const newDeck = generateDeck();
    setCards(newDeck);
    setFlippedCards([]);
    setMatchedIds([]);
    setPvpTurn(1);
    pvpTurnRef.current = 1;
    setPvpPairs({ p1: 0, p2: 0 });
    pvpPairsRef.current = { p1: 0, p2: 0 };
    setPvpScore({ p1: 0, p2: 0 });
    pvpScoreRef.current = { p1: 0, p2: 0 };
    setPvpStreak({ p1: 0, p2: 0 });
    pvpStreakRef.current = { p1: 0, p2: 0 };
    setPvpMatchedBy({});
    setPvpAnnouncement(`${p1Name || 'Player 1'} begins the duel!`);
    setPvpWinner(null);
    lockBoardRef.current = false;
    setGameState('playing');
  };

  // ─────────────────────────────────────────────────────────────
  // CARD CLICK HANDLER (SOLO & PVP)
  // ─────────────────────────────────────────────────────────────
  const handleCardClick = (index) => {
    if (lockBoardRef.current || gameState !== 'playing') return;

    const card = cards[index];
    if (matchedIds.includes(card.pairId) || flippedCards.includes(index)) return;

    sound.playFlip();
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      lockBoardRef.current = true;

      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];
      const isMatch = firstCard.pairId === secondCard.pairId;

      if (mode === 'solo') {
        // Solo Mode rules
        setMoves(m => m + 1);

        if (isMatch) {
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
            endSoloGame('won');
          }
        } else {
          setStreak(0);
          setTimeout(() => {
            setFlippedCards([]);
            lockBoardRef.current = false;
          }, 700);
        }
      } else {
        // 1v1 PvP Mode rules
        const activeTurn = pvpTurnRef.current;
        const activeName = activeTurn === 1 ? (p1Name || 'Player 1') : (p2Name || 'Player 2');

        if (isMatch) {
          // MATCH! Player keeps turn and scores bonus!
          sound.playMatch();
          const currentStreak = activeTurn === 1 ? pvpStreakRef.current.p1 : pvpStreakRef.current.p2;
          const newStreak = currentStreak + 1;
          const pts = 100 + newStreak * 25;

          const updatedPairs = {
            ...pvpPairsRef.current,
            [activeTurn === 1 ? 'p1' : 'p2']: pvpPairsRef.current[activeTurn === 1 ? 'p1' : 'p2'] + 1,
          };
          const updatedScore = {
            ...pvpScoreRef.current,
            [activeTurn === 1 ? 'p1' : 'p2']: pvpScoreRef.current[activeTurn === 1 ? 'p1' : 'p2'] + pts,
          };
          const updatedStreak = {
            ...pvpStreakRef.current,
            [activeTurn === 1 ? 'p1' : 'p2']: newStreak,
          };

          setPvpPairs(updatedPairs);
          pvpPairsRef.current = updatedPairs;
          setPvpScore(updatedScore);
          pvpScoreRef.current = updatedScore;
          setPvpStreak(updatedStreak);
          pvpStreakRef.current = updatedStreak;

          setPvpMatchedBy(prev => ({ ...prev, [firstCard.pairId]: activeTurn }));
          setPvpAnnouncement(`🌟 Pair found by ${activeName}! Extra Turn!`);

          const newMatched = [...matchedIds, firstCard.pairId];
          setMatchedIds(newMatched);
          setFlippedCards([]);
          lockBoardRef.current = false;

          if (newMatched.length === ICONS.length) {
            // Duel Finished!
            const finalP1 = updatedPairs.p1;
            const finalP2 = updatedPairs.p2;
            let winResult = 'tie';
            if (finalP1 > finalP2) winResult = 'p1';
            else if (finalP2 > finalP1) winResult = 'p2';

            setPvpWinner(winResult);
            sound.playLevelUp();
            setGameState('won');
          }
        } else {
          // MISMATCH: Turn switches to opponent
          const nextTurn = activeTurn === 1 ? 2 : 1;
          const nextName = nextTurn === 1 ? (p1Name || 'Player 1') : (p2Name || 'Player 2');

          // Reset streak for player who missed
          const updatedStreak = {
            ...pvpStreakRef.current,
            [activeTurn === 1 ? 'p1' : 'p2']: 0,
          };
          setPvpStreak(updatedStreak);
          pvpStreakRef.current = updatedStreak;

          setPvpAnnouncement(`Miss! Turn switches to ${nextName}`);

          setTimeout(() => {
            setFlippedCards([]);
            setPvpTurn(nextTurn);
            pvpTurnRef.current = nextTurn;
            lockBoardRef.current = false;
          }, 800);
        }
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
      {mode === 'solo' && <ScorePop points={lastPts} trigger={scoreTrigger} />}

      {/* Top Bar */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={() => {
          clearInterval(timerRef.current);
          onBack();
        }}>← Hub</button>
        <div className="mini-game-title">🃏 Memory Match</div>
        <div className={`timer-pill ${mode === 'solo' && timeLeft <= 8 ? 'danger' : ''}`}>
          {mode === 'solo' ? `⏱️ ${timeLeft}s` : `⚔️ 1v1 Duel`}
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="game-mode-switch-wrapper">
        <div className="mode-switch-pills" role="tablist">
          <button
            className={`btn-mode-pill ${mode === 'solo' ? 'active' : ''}`}
            onClick={() => {
              clearInterval(timerRef.current);
              setMode('solo');
              setGameState('ready');
            }}
          >
            <span>👤 Solo Challenge</span>
          </button>
          <button
            className={`btn-mode-pill ${mode === 'pvp' ? 'pvp-active' : ''}`}
            onClick={() => {
              clearInterval(timerRef.current);
              setMode('pvp');
              setGameState('ready');
            }}
          >
            <span>⚔️ 1v1 Pairs Duel</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MODE 1: SOLO CHALLENGE
          ══════════════════════════════════════════════════════════ */}
      {mode === 'solo' && (
        <>
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
              <button className="btn-start-mini" onClick={startSoloGame}>
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
                <button className="btn-play-again" onClick={startSoloGame}>
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
                <button className="btn-play-again" onClick={startSoloGame}>
                  Try Again ↺
                </button>
                <button className="btn-hub" onClick={onBack}>
                  Arcade Hub
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODE 2: 1v1 PAIRS DUEL
          ══════════════════════════════════════════════════════════ */}
      {mode === 'pvp' && (
        <>
          {gameState === 'ready' && (
            <div className="pvp-config-card">
              <div className="pvp-badge-header">
                <span>⚔️ Head-to-Head Duel</span>
              </div>
              <h2 style={{ margin: '4px 0 0', fontSize: '1.45rem' }}>Memory Match: 1v1 Battle</h2>
              <p className="ready-desc" style={{ margin: 0, textAlign: 'center' }}>
                Compete on a shared 16-card board! Memorize card positions on both your turn and your opponent's turn. Find the most animal pairs to claim victory!
              </p>

              {/* Player Setup */}
              <div className="pvp-players-setup-grid">
                <div className="pvp-player-input-box p1-box">
                  <span className="pvp-player-label">🦊 Player 1</span>
                  <input
                    type="text"
                    className="pvp-name-field"
                    value={p1Name}
                    maxLength={14}
                    onChange={(e) => setP1Name(e.target.value)}
                    placeholder="Player 1"
                  />
                  <span className="pvp-key-hint">Team: Red 🔴</span>
                </div>

                <div className="pvp-vs-divider">VS</div>

                <div className="pvp-player-input-box p2-box">
                  <span className="pvp-player-label">🦁 Player 2</span>
                  <input
                    type="text"
                    className="pvp-name-field"
                    value={p2Name}
                    maxLength={14}
                    onChange={(e) => setP2Name(e.target.value)}
                    placeholder="Player 2"
                  />
                  <span className="pvp-key-hint">Team: Blue 🔵</span>
                </div>
              </div>

              {/* Rules strip */}
              <div className="pvp-rules-strip">
                <div className="pvp-rule-item">
                  <span>✨</span>
                  <span><strong>Match Bonus:</strong> Finding a match awards +1 Pair and an <strong>Extra Turn</strong>!</span>
                </div>
                <div className="pvp-rule-item">
                  <span>🔁</span>
                  <span><strong>Turn Passing:</strong> Mismatches briefly reveal cards, then pass turn to opponent.</span>
                </div>
                <div className="pvp-rule-item">
                  <span>🏆</span>
                  <span><strong>Victory Condition:</strong> Player with the most pairs wins when board is cleared.</span>
                </div>
              </div>

              <button className="btn-start-pvp" onClick={startPvpGame}>
                <span>Start 1v1 Pairs Duel</span> →
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="mini-game-play-area">
              {/* Dual Player 1v1 Scoreboard HUD */}
              <div className="memory-pvp-header-hud">
                <div className={`memory-p-badge p1 ${pvpTurn === 1 ? 'is-turn' : ''}`}>
                  <span className="memory-p-avatar">🦊</span>
                  <div className="memory-p-info">
                    <span className="memory-p-name">{p1Name || 'Player 1'}</span>
                    <span className="memory-p-pairs-count">Pairs: {pvpPairs.p1} • {pvpScore.p1}pts</span>
                  </div>
                </div>

                <div className="pvp-vs-divider" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                  VS
                </div>

                <div className={`memory-p-badge p2 ${pvpTurn === 2 ? 'is-turn' : ''}`} style={{ justifyContent: 'flex-end', textAlign: 'right' }}>
                  <div className="memory-p-info">
                    <span className="memory-p-name">{p2Name || 'Player 2'}</span>
                    <span className="memory-p-pairs-count">Pairs: {pvpPairs.p2} • {pvpScore.p2}pts</span>
                  </div>
                  <span className="memory-p-avatar">🦁</span>
                </div>
              </div>

              {/* Turn Announcement Banner */}
              <div className={`memory-turn-banner ${pvpTurn === 1 ? 'p1' : 'p2'}`}>
                <span>{pvpTurn === 1 ? '🔴' : '🔵'}</span>
                <span>{pvpAnnouncement || (pvpTurn === 1 ? `${p1Name || 'Player 1'}'s Turn` : `${p2Name || 'Player 2'}'s Turn`)}</span>
              </div>

              {/* 4x4 Card Grid with Player Claim Tags */}
              <div className="matte-cards-grid">
                {cards.map((card, idx) => {
                  const isMatched = matchedIds.includes(card.pairId);
                  const isFlipped = isMatched || flippedCards.includes(idx);
                  const claimedBy = pvpMatchedBy[card.pairId]; // 1 or 2

                  return (
                    <div
                      key={card.id}
                      className={`matte-card ${isFlipped ? 'is-flipped' : ''} ${isMatched ? 'is-matched' : ''} ${claimedBy === 1 ? 'matched-p1' : claimedBy === 2 ? 'matched-p2' : ''}`}
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
            <div className="pvp-victory-modal">
              <div className="pvp-crown-icon">👑</div>
              <h2 className="pvp-champion-title">
                {pvpWinner === 'p1'
                  ? `${p1Name || 'Player 1'} Takes the Crown!`
                  : pvpWinner === 'p2'
                  ? `${p2Name || 'Player 2'} Takes the Crown!`
                  : 'Stalemate! An Epic 4-4 Tie!'}
              </h2>

              <div className="pvp-final-score-strip">
                <span className="score-p1">{p1Name || 'P1'}: {pvpPairs.p1} Pairs</span>
                <span className="score-div">—</span>
                <span className="score-p2">{pvpPairs.p2} Pairs :{p2Name || 'P2'}</span>
              </div>

              <div className="results-metrics" style={{ width: '100%' }}>
                <div className="metric-box">
                  <span className="m-val" style={{ color: '#EF4444' }}>{pvpScore.p1}</span>
                  <span className="m-lbl">{p1Name || 'P1'} Points</span>
                </div>
                <div className="metric-box">
                  <span className="m-val" style={{ color: '#6366F1' }}>{pvpScore.p2}</span>
                  <span className="m-lbl">{p2Name || 'P2'} Points</span>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: 8 }}>
                <button
                  className="btn-play-again"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #6366F1)', color: '#fff' }}
                  onClick={startPvpGame}
                >
                  Play Rematch ↺
                </button>
                <button
                  className="btn-hub"
                  onClick={() => {
                    setMode('solo');
                    setGameState('ready');
                  }}
                >
                  Solo Mode
                </button>
                <button className="btn-hub" onClick={onBack}>
                  Arcade Hub
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
