import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const ROUNDS_PER_SESSION = 10;

const FUNNY_SORT_DATA = [
  {
    id: 'fs-1',
    category: '😳 Social Blunders',
    prompt: 'Sort from Least Awkward to "Must Fake Identity & Move to Antarctica":',
    directionHint: '1 = Mild Oof  ➔  4 = Maximum Cringe',
    items: [
      { id: 'a', title: 'The Movie Ticket Fumble', text: 'Saying "You too!" when the cinema cashier says "Enjoy your movie!"', order: 1, icon: '🍿' },
      { id: 'b', title: 'The Phantom Wave', text: 'Waving enthusiastically back at someone who was actually waving at the stranger behind you', order: 2, icon: '👋' },
      { id: 'c', title: 'The Ventilated Speech', text: 'Realizing your fly has been completely unzipped through your entire 25-minute PowerPoint presentation', order: 3, icon: '👖' },
      { id: 'd', title: 'The Screenshot Treason', text: 'Accidentally sending a screenshot of a text chat back to the exact person you took a screenshot of', order: 4, icon: '📱' },
    ],
    explanation: 'From quick verbal slip-up, to misdirected gesture, to public wardrobe malfunction, to undisputed digital self-destruction!',
  },
  {
    id: 'fs-2',
    category: '☕ Monday Chaos',
    prompt: 'Sort by Monday Morning Energy (Mild Inconvenience to Total Spiritual Defeat):',
    directionHint: '1 = Slightly Annoying  ➔  4 = Going Back to Sleep Forever',
    items: [
      { id: 'a', title: 'The Stolen Sleep', text: 'Your alarm blares 2 minutes before you naturally open your eyes', order: 1, icon: '⏰' },
      { id: 'b', title: 'The Hot Coffee Scald', text: 'First sip burns the roof of your mouth so all food tastes like cardboard for 3 days', order: 2, icon: '☕' },
      { id: 'c', title: 'The Soggy Sock Puddle', text: 'Stepping into a cold puddle on the bathroom floor in brand new dry socks', order: 3, icon: '🧦' },
      { id: 'd', title: 'The Phantom Charger', text: 'Waking up to 2% battery because the charging plug was tilted at a 0.001° angle all night', order: 4, icon: '🪫' },
    ],
    explanation: 'Early wake-up is annoying, burned tongue hurts, wet socks ruins morale, but dead phone in the morning means the universe has abandoned you.',
  },
  {
    id: 'fs-3',
    category: '✈️ Airline Chaos',
    prompt: 'Sort Animals by How Catastrophically They Would Flunk an Airline Pilot Test:',
    directionHint: '1 = Good Intentions  ➔  4 = Absolute Airborne Menace',
    items: [
      { id: 'a', title: 'The Golden Retriever', text: 'Tries desperately to be a good boy; accidentally bites the landing gear lever thinking it is a stick', order: 1, icon: '🐕' },
      { id: 'b', title: 'The Sloth', text: 'Takes 4 hours to toggle the seatbelt sign; entire flight runs out of fuel while idling on the runway', order: 2, icon: '🦥' },
      { id: 'c', title: 'The Household Cat', text: 'Stares straight into co-pilot’s soul while deliberately pushing the altitude joystick off the console', order: 3, icon: '🐈' },
      { id: 'd', title: 'The Canada Goose', text: 'Aggressive road rage; ignores air traffic control, honks violently at clouds, flies directly into a storm out of spite', order: 4, icon: '🪿' },
    ],
    explanation: 'The dog means well, the sloth is just slow, the cat is actively malicious, but the goose was born to cause airborne terror.',
  },
  {
    id: 'fs-4',
    category: '🦹 Villain Origins',
    prompt: 'Sort from "Mild Irritation" to "Immediate Supervillain Origin Story":',
    directionHint: '1 = Minor Grumble  ➔  4 = Plotting World Domination',
    items: [
      { id: 'a', title: 'The Untouchable Itch', text: 'An itchy spot in the geometric dead-center of your back that your arms cannot reach by 1 centimeter', order: 1, icon: '🪰' },
      { id: 'b', title: 'The 99% Buffer Freeze', text: 'Video stream freezes at 99% right during the plot reveal of a 10-episode series finale', order: 2, icon: '⏳' },
      { id: 'c', title: 'The Double Cheek Bite', text: 'Accidentally biting the inside of your cheek, then immediately biting the EXACT same swollen bump 2 bites later', order: 3, icon: '🦷' },
      { id: 'd', title: 'The Midnight Lego Mine', text: 'Stepping barefoot on a sharp upward-facing Lego brick in pitch-black darkness at 3:15 AM', order: 4, icon: '🧱' },
    ],
    explanation: 'Itchy back is annoying, buffering is frustrating, cheek bite brings genuine rage, but the midnight Lego produces pure unadulterated villainy.',
  },
  {
    id: 'fs-5',
    category: '🧙 Inconvenient Magic',
    prompt: 'Sort Superpowers by How Inconvenient They Would Be in Everyday Life:',
    directionHint: '1 = Manageable Quirk  ➔  4 = Constant Nightmare',
    items: [
      { id: 'a', title: 'Selective Invisibility', text: 'You turn invisible, but your clothes, glasses, and whatever you just digested remain 100% visible', order: 1, icon: '👻' },
      { id: 'b', title: 'Sub-Sonic Hovering', text: 'You can fly, but only at walking speed and strictly 3 inches off the ground', order: 2, icon: '🦅' },
      { id: 'c', title: 'Petty Telepathy', text: 'You can read minds, but only people’s quiet complaints about how loud your breathing is', order: 3, icon: '🧠' },
      { id: 'd', title: 'Chronological Knee-Drop', text: 'You can pause time, but every single second paused permanently ages your joints by 2 months', order: 4, icon: '⏳' },
    ],
    explanation: 'Floating is just slow, digested food looks weird, hearing breathing complaints destroys ego, but aging your knees every second will cripple you by lunch.',
  },
  {
    id: 'fs-6',
    category: '🍝 Carpet Catastrophes',
    prompt: 'Sort Food Items by Danger Level if Dropped on a Pure White Wool Carpet:',
    directionHint: '1 = Quick Pick Up  ➔  4 = Say Goodbye to the Security Deposit',
    items: [
      { id: 'a', title: 'The Dry Pretzel', text: 'Single salted pretzel stick; retrieved in 0.5s with zero moisture residue', order: 1, icon: '🥨' },
      { id: 'b', title: 'The Ice Cream Drip', text: 'Spoonful of vanilla ice cream; sticky and melts fast, but lukewarm water can dissolve it', order: 2, icon: '🍦' },
      { id: 'c', title: 'The Buttered Toast Rule', text: 'Toast with melted butter; physics laws guarantee it executes a 180° flip to land butter-face down', order: 3, icon: '🍞' },
      { id: 'd', title: 'The Beetroot Turmeric Spill', text: 'Steaming bowl of spicy beet & turmeric curry knocked over while stepping on the vacuum cord', order: 4, icon: '🍛' },
    ],
    explanation: 'Pretzels leave no mark, vanilla washes out, butter creates a greasy halo, but turmeric & beetroot will permanently dye the floorboards beneath the carpet.',
  },
  {
    id: 'fs-7',
    category: '🏰 Medieval Witchcraft',
    prompt: 'Sort Modern Inventions by How Fast They Would Get You Burned at the Stake in 1340 AD:',
    directionHint: '1 = "Fascinating Blacksmith Tool"  ➔  4 = "SUMMON THE INQUISITOR"',
    items: [
      { id: 'a', title: 'The Swiss Pocket Knife', text: 'Stainless steel multi-tool; local village blacksmith is deeply impressed and wants to copy the hinges', order: 1, icon: '🔪' },
      { id: 'b', title: 'The Laser Pointer', text: 'Bright red laser dot dancing on stone walls; priest begins aggressively splashing holy water on the cat', order: 2, icon: '🔦' },
      { id: 'c', title: 'The Bluetooth Boombox', text: 'Blasting 80s synth-pop with flashing RGB LEDs from an invisible wireless frequency', order: 3, icon: '📻' },
      { id: 'd', title: 'The Autonomous Roomba', text: 'A motorized black disc roaming village cobblestones at night while beeping and devouring sacred dust', order: 4, icon: '🤖' },
    ],
    explanation: 'Knife is just clever metalwork, laser looks like a demon dot, boombox is acoustic sorcery, but a disc crawling on its own is indisputable black magic.',
  },
  {
    id: 'fs-8',
    category: '💼 Workplace Crimes',
    prompt: 'Sort Workplace Email Blunders from Mild Cringe to Immediate HR Intervention:',
    directionHint: '1 = "Oops Haha"  ➔  4 = "Clean Out Your Desk by 5 PM"',
    items: [
      { id: 'a', title: 'The Missing Attachment', text: 'Sending "Please find attached below" with absolutely nothing attached to the email', order: 1, icon: '📎' },
      { id: 'b', title: 'The Keyboard Misstep', text: 'Typing "Best regards" as "Best retards" because the T and G keys are adjacent neighbours', order: 2, icon: '⌨️' },
      { id: 'c', title: 'The Reply-All Catastrophe', text: 'Hitting "Reply All" to a 7,000-person CEO companywide broadcast with "Thanks, received!"', order: 3, icon: '✉️' },
      { id: 'd', title: 'The Boss-Complaint Forward', text: 'Writing a scathing satirical rant about your boss, intended for your work bestie, but sending it directly to your boss', order: 4, icon: '💀' },
    ],
    explanation: 'Empty attachment is classic, typo is embarrassing, companywide reply-all gets you publicly shamed, but roasting your boss to their inbox is game over.',
  },
  {
    id: 'fs-9',
    category: '🌙 Midnight Fridge Guilt',
    prompt: 'Sort Late-Night Kitchen Raids by Level of Self-Respect Lost:',
    directionHint: '1 = Just a Snack  ➔  4 = Gazing Into the Abyss at 3 AM',
    items: [
      { id: 'a', title: 'The Solitary String Cheese', text: 'Peeling a single mozzarella stick thread-by-thread at 11:15 PM while watching cat reels', order: 1, icon: '🧀' },
      { id: 'b', title: 'The Sink Pizza', text: 'Eating a slice of cold leftover pepperoni pizza bent 90° directly over the kitchen sink to avoid plates', order: 2, icon: '🍕' },
      { id: 'c', title: 'The Mixing Bowl Cereal', text: 'Pouring half a box of chocolate cereal into an oversized metal salad bowl with chocolate milk at 2 AM', order: 3, icon: '🥣' },
      { id: 'd', title: 'The Butter Knife Nutella', text: 'Eating hazelnut spread directly from the jar using a serrated butter knife under the cold hum of the fridge light', order: 4, icon: '🍫' },
    ],
    explanation: 'Cheese is innocent, sink pizza is efficient bachelor energy, salad-bowl cereal is gluttony, but knife-Nutella in fridge light is spiritual rock bottom.',
  },
  {
    id: 'fs-10',
    category: '🍳 Kitchen Disasters',
    prompt: 'Sort Cooking Mistakes from "Still Edible" to "Call the Fire Brigade":',
    directionHint: '1 = Minor Flavour Shift  ➔  4 = Hazmat Zone',
    items: [
      { id: 'a', title: 'The Unsalted Pasta', text: 'Forgetting to add salt to the boiling pasta water; noodles taste like wet paper towels', order: 1, icon: '🍝' },
      { id: 'b', title: 'The Shell Shocker', text: 'Cracking an egg with aggressive vigor, dispersing 28 microscopic eggshell shards into the omelette', order: 2, icon: '🥚' },
      { id: 'c', title: 'The Fork in the Microwave', text: 'Reheating soup with a stainless steel fork inside; summoning lightning sparks like a budget Thor', order: 3, icon: '⚡' },
      { id: 'd', title: 'The Soda vs Powder Swap', text: 'Confusing 1 tsp baking powder with 1 tbsp baking soda; cake turns into an erupting chemical volcano', order: 4, icon: '🌋' },
    ],
    explanation: 'Bland pasta can be sauced, crunchy eggshell is unpleasant, microwave lightning is hazardous, but baking soda chemical overload destroys the oven.',
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

function getFunnyRank(score, maxScore) {
  const ratio = score / maxScore;
  if (ratio >= 0.95) return { title: '👑 Supreme Arbiter of Chaos', badge: '🥇', desc: 'Flawless comedic intuition! You understand the subtle hierarchy of embarrassment!' };
  if (ratio >= 0.75) return { title: '🎭 Master of Absurdity', badge: '🥈', desc: 'Impressive comedic sorting! You know when a situation is truly doomed.' };
  if (ratio >= 0.50) return { title: '🛋️ Casual Chaos Observer', badge: '🥉', desc: 'Decent sense of humor, but you underestimated some legendary blunders.' };
  return { title: '🙃 Accidentally Reasonable', badge: '🤷', desc: 'You tried to use cold, logical sense in a world of ridiculous chaos!' };
}

export default function FunnySort({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'revealed' | 'gameover'
  const [rounds, setRounds] = useState(() => shuffleArray(FUNNY_SORT_DATA).slice(0, ROUNDS_PER_SESSION));
  const [roundIdx, setRoundIdx] = useState(0);
  const [currentItems, setCurrentItems] = useState([]);
  const [selectedCardIdx, setSelectedCardIdx] = useState(null);
  const [score, setScore] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [roundFeedback, setRoundFeedback] = useState(null);
  const [history, setHistory] = useState([]);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const currentRound = rounds[roundIdx] || rounds[0];

  // Set up items for current round (shuffled so player must order them)
  const setupRound = useCallback((roundData) => {
    let shuffled = shuffleArray(roundData.items);
    // Ensure it's not accidentally already in 1-2-3-4 order
    const isAlreadySorted = shuffled.every((item, i) => item.order === i + 1);
    if (isAlreadySorted && shuffled.length > 1) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }
    setCurrentItems(shuffled);
    setSelectedCardIdx(null);
    setRoundFeedback(null);
  }, []);

  const startGame = () => {
    const newRounds = shuffleArray(FUNNY_SORT_DATA).slice(0, ROUNDS_PER_SESSION);
    setRounds(newRounds);
    setRoundIdx(0);
    setScore(0);
    setSolvedCount(0);
    setHistory([]);
    setGameState('playing');
    setupRound(newRounds[0]);
  };

  // Move item up
  const moveUp = (idx, e) => {
    if (e) e.stopPropagation();
    if (idx <= 0 || gameState !== 'playing') return;
    sound.playPop();
    setCurrentItems(prev => {
      const next = [...prev];
      [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
      return next;
    });
  };

  // Move item down
  const moveDown = (idx, e) => {
    if (e) e.stopPropagation();
    if (idx >= currentItems.length - 1 || gameState !== 'playing') return;
    sound.playPop();
    setCurrentItems(prev => {
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  // Click-to-swap: click card A then card B to swap positions
  const handleCardClick = (idx) => {
    if (gameState !== 'playing') return;
    sound.playPop();
    if (selectedCardIdx === null) {
      setSelectedCardIdx(idx);
    } else if (selectedCardIdx === idx) {
      setSelectedCardIdx(null);
    } else {
      // Swap selected with this card
      setCurrentItems(prev => {
        const next = [...prev];
        [next[selectedCardIdx], next[idx]] = [next[idx], next[selectedCardIdx]];
        return next;
      });
      setSelectedCardIdx(null);
    }
  };

  // Submit and verify order
  const handleSubmitOrder = () => {
    if (gameState !== 'playing') return;

    // Check accuracy
    let correctCount = 0;
    currentItems.forEach((item, index) => {
      if (item.order === index + 1) {
        correctCount++;
      }
    });

    const isPerfect = correctCount === currentItems.length;
    let earnedPts = 0;

    if (isPerfect) {
      earnedPts = 300;
      sound.playCorrect();
      setSolvedCount(s => s + 1);
    } else if (correctCount >= 2) {
      earnedPts = correctCount * 50;
      sound.playPop();
    } else {
      earnedPts = 30;
      sound.playWrong();
    }

    const newScore = score + earnedPts;
    setScore(newScore);
    setLastPts(earnedPts);
    setScoreTrigger(t => t + 1);

    const feedbackObj = {
      isPerfect,
      correctCount,
      earnedPts,
      submittedItems: [...currentItems],
      correctOrder: [...currentRound.items].sort((a, b) => a.order - b.order),
    };

    setRoundFeedback(feedbackObj);
    setHistory(prev => [
      ...prev,
      {
        category: currentRound.category,
        isPerfect,
        earnedPts,
      },
    ]);
    setGameState('revealed');

    if (onSaveScore) onSaveScore('funnySort', newScore);
  };

  // Next round or complete
  const handleNext = () => {
    if (roundIdx + 1 < rounds.length) {
      const nextIdx = roundIdx + 1;
      setRoundIdx(nextIdx);
      setGameState('playing');
      setupRound(rounds[nextIdx]);
    } else {
      setGameState('gameover');
      if (score >= 2000) {
        sound.playStreak();
      } else {
        sound.playCorrect();
      }
    }
  };

  const maxPossibleScore = rounds.length * 300;
  const rank = getFunnyRank(score, maxPossibleScore);

  return (
    <div className="screen mini-game-screen funny-sort-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Top Bar */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🤪 Funny Sort</div>
        <div className="hud-badge-compact">Perfect: {solvedCount}/{rounds.length}</div>
      </div>

      {/* Ready Screen */}
      {gameState === 'ready' && (
        <div className="mini-card ready-modal animate-pop">
          <div className="mode-badge-pop" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>
            Absurd Logic &amp; Comedy Ranking · 10 Rounds
          </div>
          <h2>Funny Sort 🤪</h2>
          <p className="ready-desc">
            Test your comedic intuition! Rank hilarious scenarios, absurd blunders, and chaotic situations from <strong>least extreme to pure comedy gold</strong>!
          </p>
          <div className="rules-grid">
            <div className="rule-item">👆 Tap ▲ / ▼ arrows or click two cards to swap</div>
            <div className="rule-item">🎯 Arrange cards in order: 1 (Top) to 4 (Bottom)</div>
            <div className="rule-item">🏆 300 pts for flawless comedy ranking</div>
            <div className="rule-item">😂 10 rounds of relatable, hilarious chaos</div>
          </div>
          <button className="btn-start-mini" style={{ background: 'var(--amber)' }} onClick={startGame}>
            <span>Start Sorting Chaos</span> →
          </button>
        </div>
      )}

      {/* Playing / Revealed Screen */}
      {(gameState === 'playing' || gameState === 'revealed') && currentRound && (
        <div className="funny-sort-play-area">
          {/* Progress Strip */}
          <div className="funny-dots-strip" role="status" aria-label="Funny Sort Progress">
            {rounds.map((r, i) => {
              const h = history[i];
              const isCurrent = i === roundIdx;
              let dotClass = 'dot-pending';
              let dotContent = i + 1;
              if (h) {
                dotClass = h.isPerfect ? 'dot-solved' : 'dot-wrong';
                dotContent = h.isPerfect ? '✓' : '~';
              } else if (isCurrent) {
                dotClass = 'dot-current-funny';
              }
              return (
                <div key={i} className={`case-dot ${dotClass}`} title={r.category}>
                  {dotContent}
                </div>
              );
            })}
          </div>

          {/* HUD Strip */}
          <div className="hud-strip">
            <div className="hud-badge">
              <span className="lbl">Score</span>
              <span className="val">{score}</span>
            </div>
            <div className="hud-badge">
              <span className="lbl">Round</span>
              <span className="val">{roundIdx + 1} of {rounds.length}</span>
            </div>
            <div className="hud-badge" style={{ borderColor: 'var(--amber)' }}>
              <span className="val" style={{ fontSize: '0.75rem', color: 'var(--amber)' }}>{currentRound.category}</span>
            </div>
          </div>

          {/* Prompt Header Card */}
          <div className="funny-sort-header-card animate-pop">
            <div className="funny-stamp">HUMOROUS RANKING CHALLENGE</div>
            <h3 className="funny-sort-prompt">{currentRound.prompt}</h3>
            <div className="direction-hint-pill">
              <span>{currentRound.directionHint}</span>
            </div>
            {gameState === 'playing' && (
              <span className="swap-tip">💡 Tip: Use ▲ ▼ buttons or click any two cards to swap them!</span>
            )}
          </div>

          {/* Sortable List of 4 Cards */}
          <div className="funny-sort-list">
            {currentItems.map((item, idx) => {
              const isSelected = selectedCardIdx === idx;
              let statusClass = '';
              if (gameState === 'revealed') {
                const isExact = item.order === idx + 1;
                statusClass = isExact ? 'card-status-correct' : 'card-status-wrong';
              }

              return (
                <div
                  key={item.id}
                  className={`funny-sort-item-card ${isSelected ? 'card-selected' : ''} ${statusClass} ${gameState === 'playing' ? 'card-interactive' : ''}`}
                  onClick={() => handleCardClick(idx)}
                >
                  {/* Position Badge */}
                  <div className="item-rank-column">
                    <span className="item-rank-num">#{idx + 1}</span>
                    <span className="item-icon-circle">{item.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="item-body">
                    <h4 className="item-title">{item.title}</h4>
                    <p className="item-text">{item.text}</p>
                    {gameState === 'revealed' && (
                      <span className="revealed-target-tag">
                        {item.order === idx + 1 ? '✓ Correctly Placed' : `Actual Rank: #${item.order}`}
                      </span>
                    )}
                  </div>

                  {/* Reorder Controls */}
                  {gameState === 'playing' && (
                    <div className="item-reorder-controls">
                      <button
                        type="button"
                        className="btn-reorder-arrow"
                        onClick={(e) => moveUp(idx, e)}
                        disabled={idx === 0}
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="btn-reorder-arrow"
                        onClick={(e) => moveDown(idx, e)}
                        disabled={idx === currentItems.length - 1}
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Trigger */}
          {gameState === 'playing' && (
            <button className="btn-submit-sort" onClick={handleSubmitOrder}>
              <span>Lock In My Order</span> ➔
            </button>
          )}

          {/* Feedback & Breakdown Reveal Card */}
          {gameState === 'revealed' && roundFeedback && (
            <div className="funny-breakdown-card animate-pop">
              <div className="breakdown-header-row">
                <span className="breakdown-badge" style={{ color: roundFeedback.isPerfect ? 'var(--mint)' : 'var(--amber)' }}>
                  {roundFeedback.isPerfect ? '🎉 FLAWLESS ORDER!' : `Matched ${roundFeedback.correctCount}/4 Ranks!`}
                </span>
                <span className="pts-won-tag">+{roundFeedback.earnedPts} pts</span>
              </div>
              <p className="funny-breakdown-text">{currentRound.explanation}</p>
              <button className="btn-next-funny" onClick={handleNext}>
                {roundIdx + 1 < rounds.length ? `Next Round (${roundIdx + 2}/${rounds.length}) ➔` : 'View Final Comedy Report ➔'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="detective-results-modal animate-pop" style={{ borderColor: 'var(--amber)' }}>
          <div className="dossier-stamp" style={{ background: 'var(--amber-soft)', color: 'var(--amber)', alignSelf: 'center', fontSize: '0.8rem', padding: '4px 14px' }}>
            FUNNY SORT COMPLETE · 10 ROUNDS
          </div>

          <div className="det-rank-badge-wrap">
            <span className="det-rank-icon">{rank.badge}</span>
            <h2 className="det-rank-title">{rank.title}</h2>
            <p className="det-rank-desc">{rank.desc}</p>
          </div>

          {/* Metrics */}
          <div className="det-results-metrics">
            <div className="det-metric-box">
              <span className="lbl">Flawless</span>
              <span className="val" style={{ color: 'var(--mint)' }}>{solvedCount} / {rounds.length}</span>
            </div>
            <div className="det-metric-box">
              <span className="lbl">Score</span>
              <span className="val" style={{ color: 'var(--amber)' }}>{score}</span>
            </div>
            <div className="det-metric-box">
              <span className="lbl">Max</span>
              <span className="val">{maxPossibleScore}</span>
            </div>
          </div>

          {/* Log */}
          <div className="det-summary-panel">
            <h4 className="det-summary-heading">Comedy Ranking Log</h4>
            <div className="det-summary-list">
              {history.map((item, idx) => (
                <div key={idx} className={`det-summary-item ${item.isPerfect ? 'item-correct' : 'item-wrong'}`}>
                  <div className="item-left">
                    <span className="item-num">#{idx + 1}</span>
                    <div className="item-info">
                      <span className="item-title">{item.category}</span>
                    </div>
                  </div>
                  <div className="item-status">
                    {item.isPerfect ? '✅ Perfect' : `+${item.earnedPts} pts`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="det-results-actions">
            <button className="btn-det-action btn-det-replay" onClick={startGame}>
              <span>Play Funny Sort Again</span> 🔄
            </button>
            <button className="btn-det-action btn-det-hub" onClick={onBack}>
              ← Return to Hub
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameover' && solvedCount >= 5 && <Confetti />}
    </div>
  );
}
