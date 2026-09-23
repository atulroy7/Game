import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const QUESTIONS_PER_ROUND = 10;

const TABOO_DATA = [
  {
    id: 'taboo-1',
    type: 'deduction',
    title: 'The Celestial Explorer',
    category: '🚀 Science & Space',
    target: 'Astronaut',
    tabooWords: ['Space', 'Moon', 'NASA', 'Rocket', 'Star'],
    prompt: 'A specialized voyager who undergoes extreme physical conditioning to operate complex orbital machinery beyond Earth\'s gravitational atmosphere.',
    question: 'Which profession is being described without using the taboo words?',
    options: ['Astronaut', 'Scuba Diver', 'Geologist', 'Commercial Pilot'],
    answer: 'Astronaut',
    breakdown: 'Notice how the description completely avoided Space, Moon, NASA, Rocket, and Star, yet uniquely identifies an Astronaut!',
  },
  {
    id: 'taboo-2',
    type: 'deduction',
    title: 'The Silent Follower',
    category: '🌿 Everyday Nature',
    target: 'Shadow',
    tabooWords: ['Dark', 'Sun', 'Light', 'Silhouette', 'Night'],
    prompt: 'A shape-shifting projection that faithfully mirrors an opaque body’s movements whenever positioned in front of an illumination beam, but instantly vanishes in total obscurity.',
    question: 'What entity is being described?',
    answer: 'Shadow',
    options: ['Shadow', 'Mirror Reflection', 'Echo', 'Footprint'],
    answerDesc: 'Shadow',
    breakdown: 'A shadow matches an object’s silhouette without light/dark being spoken.',
  },
  {
    id: 'taboo-3',
    type: 'reverse',
    title: 'Reverse Taboo: Morning Ritual',
    category: '☕ Everyday Items',
    tabooWords: ['Caffeine', 'Mug', 'Bean', 'Brew', 'Morning'],
    prompt: 'These 5 words are strictly forbidden. Which target item are they designated to protect?',
    question: 'Which item cannot be described without triggering these taboo words?',
    options: ['Coffee', 'Chocolate', 'Energy Drink', 'Alarm Clock'],
    answer: 'Coffee',
    breakdown: 'Caffeine, Mug, Bean, Brew, and Morning are the 5 classic taboo associations for Coffee!',
  },
  {
    id: 'taboo-4',
    type: 'trap',
    title: 'Taboo Inspector: The Volcano',
    category: '🌋 Earth Science',
    target: 'Volcano',
    tabooWords: ['Lava', 'Eruption', 'Magma', 'Mountain', 'Ash'],
    prompt: 'Identify the ONLY statement below that cleanly describes the target WITHOUT containing any of the 5 forbidden taboo words:',
    options: [
      'A geological rupture where pressurized molten subterranean rock discharges violently onto the surface.',
      'A steep mountain peak that spews out thick gray ash clouds.',
      'A vent where red-hot magma boils underneath the rocky crust.',
      'A fiery fissure in the island that overflows with bubbling lava.'
    ],
    answer: 'A geological rupture where pressurized molten subterranean rock discharges violently onto the surface.',
    breakdown: 'Option A replaces "mountain", "ash", "magma", and "lava" with "geological rupture" and "molten subterranean rock" — 0 taboo violations!',
  },
  {
    id: 'taboo-5',
    type: 'deduction',
    title: 'The Electronic Memory',
    category: '💻 Technology',
    target: 'Internet',
    tabooWords: ['Web', 'Online', 'Computer', 'Wifi', 'Google'],
    prompt: 'A planetary mesh of interconnected optical fibers and digital nodes enabling instantaneous packets of data exchange across distant continents.',
    question: 'What global infrastructure is described?',
    answer: 'Internet',
    options: ['Internet', 'Television Cable', 'Power Grid', 'GPS Satellite Network'],
    breakdown: 'The global digital fiber network is the Internet, described without Web, Online, Computer, or Wifi.',
  },
  {
    id: 'taboo-6',
    type: 'reverse',
    title: 'Reverse Taboo: Ancient Monster',
    category: '🦖 Paleontology',
    tabooWords: ['Extinct', 'Fossil', 'Jurassic', 'Reptile', 'T-Rex'],
    prompt: 'These 5 words are classified as Taboo. What prehistoric entity do they shield?',
    question: 'What is the secret subject?',
    options: ['Dinosaur', 'Mammoth', 'Sabertooth Tiger', 'Meteor'],
    answer: 'Dinosaur',
    breakdown: 'Extinct, Fossil, Jurassic, Reptile, and T-Rex are the definitive taboo barriers for Dinosaur.',
  },
  {
    id: 'taboo-7',
    type: 'deduction',
    title: 'The Portable Intelligence',
    category: '📱 Gadgets',
    target: 'Smartphone',
    tabooWords: ['Call', 'Screen', 'Apple', 'Mobile', 'App'],
    prompt: 'A pocket-sized battery-driven slab with touch sensors, camera lenses, and microprocessors that serves as a pocket portal for global communication.',
    question: 'Which modern gadget is this description defining?',
    answer: 'Smartphone',
    options: ['Smartphone', 'Digital Watch', 'E-Reader Tablet', 'Calculator'],
    breakdown: 'Described without saying Call, Screen, Apple, Mobile, or App — it is a Smartphone!',
  },
  {
    id: 'taboo-8',
    type: 'trap',
    title: 'Taboo Inspector: The Ocean',
    category: '🌊 Geography',
    target: 'Ocean',
    tabooWords: ['Water', 'Fish', 'Salt', 'Blue', 'Wave'],
    prompt: 'Find the ONLY statement that does NOT contain any taboo word (Water, Fish, Salt, Blue, Wave):',
    options: [
      'A vast expanse of aqueous brine teeming with marine organisms and rolling tidal swells.',
      'A deep blue expanse that crashes with huge waves onto the beach.',
      'A massive body of salty liquid where diverse fish swim freely.',
      'A continuous reservoir of deep water that covers three-quarters of the globe.'
    ],
    answer: 'A vast expanse of aqueous brine teeming with marine organisms and rolling tidal swells.',
    breakdown: 'Notice: "aqueous brine" avoids Water & Salt; "marine organisms" avoids Fish; "rolling tidal swells" avoids Wave; no mention of Blue! Perfect clean clue.',
  },
  {
    id: 'taboo-9',
    type: 'deduction',
    title: 'The Frozen Crystallite',
    category: '❄️ Weather & Nature',
    target: 'Snowflake',
    tabooWords: ['Winter', 'Cold', 'White', 'Ice', 'Fall'],
    prompt: 'A microscopic six-fold hexagonal atmospheric crystal that precipitates through low temperatures and displays endless unique geometric symmetry.',
    question: 'What meteorological phenomenon is described?',
    answer: 'Snowflake',
    options: ['Snowflake', 'Hailstone', 'Morning Dew', 'Quartz Crystal'],
    breakdown: 'A six-fold hexagonal crystal precipitating from clouds is a Snowflake (described with zero taboo words!).',
  },
  {
    id: 'taboo-10',
    type: 'reverse',
    title: 'Reverse Taboo: The Hidden Melody',
    category: '🎵 Music & Sound',
    tabooWords: ['Song', 'Listen', 'Ear', 'Instrument', 'Radio'],
    prompt: 'These 5 words are forbidden. What core concept are they guarding?',
    question: 'Identify the underlying taboo target:',
    options: ['Music', 'Silence', 'Speech', 'Podcast'],
    answer: 'Music',
    breakdown: 'Song, Listen, Ear, Instrument, and Radio are the primary taboo anchors for Music.',
  },
  {
    id: 'taboo-11',
    type: 'deduction',
    title: 'The Red Fluid',
    category: '🩸 Human Biology',
    target: 'Blood',
    tabooWords: ['Red', 'Heart', 'Vein', 'Bleed', 'Body'],
    prompt: 'A specialized biological circulating liquid composed of hemoglobin-rich cells and plasma that transports respiratory gases to multicellular tissue.',
    question: 'What vital biological fluid is being described?',
    answer: 'Blood',
    options: ['Blood', 'Lymph', 'Saliva', 'Insulin'],
    breakdown: 'Hemoglobin and plasma circulating fluid cleanly describes Blood without using Red, Heart, Vein, Bleed, or Body.',
  },
  {
    id: 'taboo-12',
    type: 'trap',
    title: 'Taboo Inspector: The Book',
    category: '📚 Literature',
    target: 'Book',
    tabooWords: ['Read', 'Paper', 'Pages', 'Author', 'Cover'],
    prompt: 'Find the ONLY statement that does NOT use any taboo word (Read, Paper, Pages, Author, Cover):',
    options: [
      'A bound volume containing literary prose printed for the intellectual consumption of scholars.',
      'A paper publication with multiple pages stitched between protective leather.',
      'An author’s creative work printed onto thin cellulose sheets.',
      'A written item that you read cover to cover.'
    ],
    answer: 'A bound volume containing literary prose printed for the intellectual consumption of scholars.',
    breakdown: 'Option A replaces "paper/pages" with "bound volume", "read" with "intellectual consumption", and avoids "author" and "cover".',
  },
  {
    id: 'taboo-13',
    type: 'deduction',
    title: 'The Honey Architect',
    category: '🐝 Entomology',
    target: 'Bee',
    tabooWords: ['Honey', 'Sting', 'Insect', 'Yellow', 'Flower'],
    prompt: 'A winged pollinator that inhabits cooperative wax colonies, performs aerial waggle dances to communicate nectar coordinates, and serves as an agricultural cornerstone.',
    question: 'Which creature is being described?',
    answer: 'Bee',
    options: ['Bee', 'Butterfly', 'Hummingbird', 'Ant'],
    breakdown: 'Waggle dance and wax colony identify the Honeybee with zero taboo violations.',
  },
  {
    id: 'taboo-14',
    type: 'reverse',
    title: 'Reverse Taboo: The Sweet Treat',
    category: '🍫 Culinary',
    tabooWords: ['Sweet', 'Cocoa', 'Dark', 'Candy', 'Bar'],
    prompt: 'These 5 words are forbidden. What confectionary target do they shield?',
    question: 'What is the secret subject?',
    options: ['Chocolate', 'Vanilla Ice Cream', 'Caramel', 'Chewing Gum'],
    answer: 'Chocolate',
    breakdown: 'Cocoa, Sweet, Dark, Candy, Bar are the canonical taboo words for Chocolate.',
  },
  {
    id: 'taboo-15',
    type: 'deduction',
    title: 'The Time Machine',
    category: '🕰️ Devices',
    target: 'Clock',
    tabooWords: ['Hour', 'Minute', 'Hand', 'Time', 'Watch'],
    prompt: 'A calibrated mechanical or quartz instrument with cyclic periodic oscillations designed to partition the continuous flow of existence into standard chronological increments.',
    question: 'What apparatus is defined?',
    answer: 'Clock',
    options: ['Clock', 'Sundial', 'Metronome', 'Telescope'],
    breakdown: 'Partitioning chronological flow with quartz oscillations describes a Clock without saying Time, Hour, Minute, Hand, or Watch!',
  },
  {
    id: 'taboo-16',
    type: 'trap',
    title: 'Taboo Inspector: The Sun',
    category: '☀️ Astronomy',
    target: 'Sun',
    tabooWords: ['Hot', 'Light', 'Day', 'Yellow', 'Star'],
    prompt: 'Find the ONLY statement that does NOT contain any of the 5 taboo words (Hot, Light, Day, Yellow, Star):',
    options: [
      'The central gravitational anchor of our planetary system, powered by nuclear fusion of hydrogen into helium.',
      'The massive yellow star that warms our planet every morning.',
      'A blinding source of hot rays that lights up the afternoon sky.',
      'The cosmic body that shines daylight across the revolving continents.'
    ],
    answer: 'The central gravitational anchor of our planetary system, powered by nuclear fusion of hydrogen into helium.',
    breakdown: 'Option A focuses on astrophysics (nuclear fusion of hydrogen into helium, central gravitational anchor), strictly bypassing all 5 taboo words.',
  },
  {
    id: 'taboo-17',
    type: 'deduction',
    title: 'The Aerial Navigator',
    category: '✈️ Aviation',
    target: 'Airplane',
    tabooWords: ['Fly', 'Wing', 'Pilot', 'Airport', 'Sky'],
    prompt: 'A multi-engine pressurized metallic transport vessel that exploits aerodynamic lift across fixed airfoils to ferry passengers across transcontinental distances.',
    question: 'What transport vehicle is described?',
    answer: 'Airplane',
    options: ['Airplane', 'Helicopter', 'Submarine', 'High-Speed Bullet Train'],
    breakdown: 'Multi-engine pressurized vehicle with fixed airfoils describes an Airplane with zero taboo triggers.',
  },
  {
    id: 'taboo-18',
    type: 'reverse',
    title: 'Reverse Taboo: The Cold Season',
    category: '❄️ Seasons',
    tabooWords: ['Snow', 'December', 'Ice', 'Cold', 'Freezing'],
    prompt: 'What season or phenomenon are these 5 taboo words shielding?',
    question: 'Identify the target concept:',
    options: ['Winter', 'Autumn', 'Monsoon', 'Antarctica'],
    answer: 'Winter',
    breakdown: 'Snow, December, Ice, Cold, and Freezing are the primary taboo constraints for Winter.',
  },
  {
    id: 'taboo-19',
    type: 'deduction',
    title: 'The Silent Cinema',
    category: '💤 Human Mind',
    target: 'Dream',
    tabooWords: ['Sleep', 'Night', 'Bed', 'Wake', 'Nightmare'],
    prompt: 'An involuntary sequence of sensory hallucinations, subconscious narratives, and emotional imagery experienced during rapid eye movement neurological states.',
    question: 'What psychological phenomenon is described?',
    answer: 'Dream',
    options: ['Dream', 'Daydream', 'Meditation', 'Hypnosis'],
    breakdown: 'Involuntary sensory hallucinations during rapid eye movement (REM) describes a Dream without using Sleep, Night, Bed, Wake, or Nightmare.',
  },
  {
    id: 'taboo-20',
    type: 'deduction',
    title: 'The Digital Currency',
    category: '🪙 Economics & Tech',
    target: 'Bitcoin',
    tabooWords: ['Crypto', 'Coin', 'Mining', 'Blockchain', 'Digital'],
    prompt: 'A decentralized cryptographic ledger protocol with a hard cap of 21 million units, validated by proof-of-work consensus across distributed global compute nodes.',
    question: 'What asset is being described?',
    answer: 'Bitcoin',
    options: ['Bitcoin', 'Gold Bullion', 'Stock Option', 'Credit Card'],
    breakdown: 'Decentralized ledger with 21 million units and proof-of-work consensus defines Bitcoin with zero taboo words used.',
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

function getTabooRank(solved, total) {
  const ratio = solved / total;
  if (ratio === 1.0) return { title: 'Master Linguist', badge: '👑', desc: 'Flawless deduction with zero taboo traps triggered!' };
  if (ratio >= 0.8) return { title: 'Wordsmith Sleuth', badge: '🧠', desc: 'Incredible semantic agility and taboo detection!' };
  if (ratio >= 0.6) return { title: 'Deduction Agent', badge: '🔍', desc: 'Strong grasp of indirect reasoning and constraints!' };
  if (ratio >= 0.4) return { title: 'Apprentice Sleuth', badge: '📚', desc: 'Decent instincts, keep dodging the forbidden traps!' };
  return { title: 'Taboo Novice', badge: '⚠️', desc: 'Study the forbidden word barriers and try again!' };
}

export default function TabooReasoning({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready');
  const [questions, setQuestions] = useState(() => shuffleArray(TABOO_DATA).slice(0, QUESTIONS_PER_ROUND));
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [history, setHistory] = useState([]);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const currentQ = questions[qIdx] || questions[0];

  const shuffledOptions = React.useMemo(() => {
    if (!currentQ) return [];
    return shuffleArray(currentQ.options);
  }, [currentQ]);

  const handleSelect = (opt) => {
    if (selectedOpt !== null || gameState !== 'playing') return;
    setSelectedOpt(opt);

    const isCorrect = opt === currentQ.answer;
    setHistory(prev => [
      ...prev,
      {
        title: currentQ.title,
        category: currentQ.category,
        isCorrect,
      },
    ]);

    if (isCorrect) {
      sound.playCorrect();
      const pts = 200;
      const newScore = score + pts;
      setScore(newScore);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);
      setSolved(s => s + 1);
      if (onSaveScore) onSaveScore('tabooReasoning', newScore);
    } else {
      sound.playWrong();
    }
  };

  const handleNextQuestion = () => {
    if (qIdx + 1 < questions.length) {
      setQIdx(i => i + 1);
      setSelectedOpt(null);
    } else {
      setGameState('completed');
      if (solved >= 6) {
        sound.playStreak();
      } else {
        sound.playCorrect();
      }
    }
  };

  const startGame = () => {
    const newQuestions = shuffleArray(TABOO_DATA).slice(0, QUESTIONS_PER_ROUND);
    setQuestions(newQuestions);
    setScore(0);
    setSolved(0);
    setQIdx(0);
    setSelectedOpt(null);
    setHistory([]);
    setGameState('playing');
  };

  const rank = getTabooRank(solved, questions.length);

  return (
    <div className="screen mini-game-screen taboo-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Nav Bar */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🚫 Taboo Reasoning</div>
        <div className="hud-badge-compact">Solved: {solved}/{questions.length}</div>
      </div>

      {/* Ready Screen */}
      {gameState === 'ready' && (
        <div className="mini-card ready-modal animate-pop">
          <div className="mode-badge-pop" style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>
            Forbidden Clue Deduction · 10 Rounds
          </div>
          <h2>Taboo Reasoning</h2>
          <p className="ready-desc">
            Deduce secret targets and verify indirect definitions while strictly navigating around <strong>forbidden taboo words</strong>!
          </p>
          <div className="rules-grid">
            <div className="rule-item">🚫 5 Forbidden Taboo words per challenge</div>
            <div className="rule-item">🔍 Deduce concepts from indirect descriptions</div>
            <div className="rule-item">⚡ Spot which statements violate the taboo constraints</div>
            <div className="rule-item">🏆 200 pts per cracked round (Max 2000 pts)</div>
          </div>
          <button className="btn-start-mini" style={{ background: 'var(--coral)' }} onClick={startGame}>
            <span>Start Taboo Gauntlet (10 Rounds)</span> →
          </button>
        </div>
      )}

      {/* Playing Screen */}
      {gameState === 'playing' && currentQ && (
        <div className="taboo-play-area">
          {/* Progress Strip */}
          <div className="taboo-dots-strip" role="status" aria-label="Taboo Progress">
            {questions.map((q, i) => {
              const h = history[i];
              const isCurrent = i === qIdx;
              let dotClass = 'dot-pending';
              let dotContent = i + 1;
              if (h) {
                dotClass = h.isCorrect ? 'dot-solved' : 'dot-wrong';
                dotContent = h.isCorrect ? '✓' : '✗';
              } else if (isCurrent) {
                dotClass = 'dot-current-taboo';
              }
              return (
                <div key={i} className={`case-dot ${dotClass}`} title={q.title}>
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
              <span className="val">{qIdx + 1} of {questions.length}</span>
            </div>
            <div className="hud-badge" style={{ borderColor: 'var(--coral)' }}>
              <span className="val" style={{ fontSize: '0.75rem', color: 'var(--coral)' }}>{currentQ.category}</span>
            </div>
          </div>

          {/* Taboo Banner & Card */}
          <div className="taboo-card animate-pop">
            <div className="taboo-card-header">
              <span className="taboo-stamp">FORBIDDEN CONSTRAINTS</span>
              <h3 className="taboo-card-title">{currentQ.title}</h3>
            </div>

            {/* Forbidden Taboo Words Pill Box */}
            <div className="taboo-box">
              <div className="taboo-box-label">
                <span className="taboo-icon">🚫</span>
                <span>TABOO WORDS (Strictly Forbidden):</span>
              </div>
              <div className="taboo-words-row">
                {currentQ.tabooWords.map((word, wi) => (
                  <span key={wi} className="taboo-word-badge">
                    <span className="taboo-cross">✕</span> {word}
                  </span>
                ))}
              </div>
            </div>

            {/* The Clue Prompt */}
            <div className="taboo-prompt-box">
              <p className="taboo-prompt-text">"{currentQ.prompt}"</p>
            </div>

            <div className="taboo-question-prompt">
              <strong>Question:</strong> {currentQ.question}
            </div>
          </div>

          {/* Options Grid */}
          <div className="taboo-options-grid">
            {shuffledOptions.map((opt, idx) => {
              const isSelected = selectedOpt === opt;
              const isCorrect = opt === currentQ.answer;
              let stateClass = '';
              if (selectedOpt !== null) {
                if (isSelected) stateClass = isCorrect ? 'taboo-opt-correct' : 'taboo-opt-wrong';
                else if (isCorrect) stateClass = 'taboo-opt-revealed';
              }

              return (
                <button
                  key={idx}
                  className={`btn-taboo-opt ${stateClass}`}
                  onClick={() => handleSelect(opt)}
                  disabled={selectedOpt !== null}
                >
                  <span className="opt-letter-tag">{['A', 'B', 'C', 'D'][idx]}</span>
                  <span className="taboo-opt-text">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Breakdown / Reveal Card */}
          {selectedOpt !== null && (
            <div className="taboo-breakdown-card animate-pop">
              <div className="breakdown-title" style={{ color: selectedOpt === currentQ.answer ? 'var(--mint)' : 'var(--coral)' }}>
                {selectedOpt === currentQ.answer ? '✅ Flawless Deduction!' : '❌ Taboo Trap Triggered'}
              </div>
              <p className="breakdown-text">{currentQ.breakdown}</p>
              <button className="btn-next-taboo" onClick={handleNextQuestion}>
                {qIdx + 1 < questions.length ? `Next Taboo Round (${qIdx + 2}/10) ➔` : 'Final Taboo Dossier Report ➔'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Completed Results Screen */}
      {gameState === 'completed' && (
        <div className="detective-results-modal animate-pop" style={{ borderColor: 'var(--coral)' }}>
          <div className="dossier-stamp" style={{ background: 'var(--coral-soft)', color: 'var(--coral)', alignSelf: 'center', fontSize: '0.8rem', padding: '4px 14px' }}>
            TABOO EVALUATION COMPLETE · 10 ROUNDS
          </div>

          <div className="det-rank-badge-wrap">
            <span className="det-rank-icon">{rank.badge}</span>
            <h2 className="det-rank-title">{rank.title}</h2>
            <p className="det-rank-desc">{rank.desc}</p>
          </div>

          {/* Stats Grid */}
          <div className="det-results-metrics">
            <div className="det-metric-box">
              <span className="lbl">Cracked</span>
              <span className="val" style={{ color: 'var(--mint)' }}>{solved} / {questions.length}</span>
            </div>
            <div className="det-metric-box">
              <span className="lbl">Accuracy</span>
              <span className="val">{Math.round((solved / questions.length) * 100)}%</span>
            </div>
            <div className="det-metric-box">
              <span className="lbl">Score</span>
              <span className="val" style={{ color: 'var(--coral)' }}>{score}</span>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="det-summary-panel">
            <h4 className="det-summary-heading">Taboo Challenge Log</h4>
            <div className="det-summary-list">
              {history.map((item, idx) => (
                <div key={idx} className={`det-summary-item ${item.isCorrect ? 'item-correct' : 'item-wrong'}`}>
                  <div className="item-left">
                    <span className="item-num">#{idx + 1}</span>
                    <div className="item-info">
                      <span className="item-title">{item.title}</span>
                      <span className="item-cat">{item.category}</span>
                    </div>
                  </div>
                  <div className="item-status">
                    {item.isCorrect ? '✅ Clean' : '❌ Trapped'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="det-results-actions">
            <button className="btn-det-action" style={{ background: 'var(--coral)', color: '#fff' }} onClick={startGame}>
              <span>New Taboo Round</span> 🔄
            </button>
            <button className="btn-det-action btn-det-hub" onClick={onBack}>
              ← Return to Hub
            </button>
          </div>
        </div>
      )}

      {gameState === 'completed' && solved >= 6 && <Confetti />}
    </div>
  );
}
