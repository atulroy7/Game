import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const DETECTIVE_CASES = [
  // ── Classic Blood Relations ──
  {
    caseNo: 'Case #101',
    title: 'The Photograph Riddle',
    category: '🩸 Blood Relation',
    story: "Pointing to a photograph of a boy, Suresh said: 'He is the son of the only son of my mother.'",
    question: 'How is Suresh related to the boy in the photograph?',
    answer: 'Father',
    options: ['Brother', 'Father', 'Uncle', 'Grandfather'],
    breakdown: "Mother's only son is Suresh himself. So the boy is his son — Suresh is the Father.",
  },
  {
    caseNo: 'Case #102',
    title: 'The Ancestral Chain',
    category: '🩸 Blood Relation',
    story: "A is B's brother. C is A's mother. D is C's father. E is B's son.",
    question: 'How is D related to A?',
    answer: 'Maternal Grandfather',
    options: ['Father', 'Uncle', 'Maternal Grandfather', 'Great Grandfather'],
    breakdown: "A's mother is C, and C's father is D. Therefore D is A's maternal grandfather.",
  },
  {
    caseNo: 'Case #103',
    title: 'The Banquet Encounter',
    category: '🩸 Blood Relation',
    story: "Introducing a man at a party, a woman said: 'His wife is the only daughter of my father.'",
    question: 'How is the man related to the woman?',
    answer: 'Husband',
    options: ['Brother', 'Father-in-law', 'Cousin', 'Husband'],
    breakdown: "The only daughter of the woman's father is the woman herself. So the man's wife is the woman — he is her Husband.",
  },
  {
    caseNo: 'Case #104',
    title: 'The Football Field',
    category: '🩸 Blood Relation',
    story: "Deepak said: 'That boy playing football is the younger of the two brothers of the daughter of my father's wife.'",
    question: 'How is the boy related to Deepak?',
    answer: 'Brother',
    options: ['Son', 'Brother', 'Nephew', 'Cousin'],
    breakdown: "Father's wife = Deepak's mother. Daughter of his mother = his sister. Brother of his sister = Deepak's own Brother.",
  },
  {
    caseNo: 'Case #105',
    title: 'The Gallery Portrait',
    category: '🩸 Blood Relation',
    story: "A man pointing to a lady said: 'Her mother is the only daughter of my mother.'",
    question: 'How is the man related to the lady?',
    answer: 'Maternal Uncle',
    options: ['Father', 'Brother', 'Maternal Uncle', 'Grandfather'],
    breakdown: "Only daughter of the man's mother = man's sister. The lady is the daughter of his sister. So the man is her Maternal Uncle.",
  },
  {
    caseNo: 'Case #106',
    title: 'The Conference Call',
    category: '🩸 Blood Relation',
    story: "Rahul said: 'The girl I met at the beach was the youngest daughter of the brother-in-law of my friend's mother.'",
    question: "How is the girl related to Rahul's friend?",
    answer: 'Cousin',
    options: ['Niece', 'Sister', 'Cousin', 'Aunt'],
    breakdown: "Brother-in-law of friend's mother = friend's maternal uncle. Daughter of the maternal uncle = the friend's Cousin.",
  },
  // ── Out-of-the-Box Logic Puzzles ──
  {
    caseNo: 'Case #107',
    title: 'The Island Liar',
    category: '🔍 Logic Paradox',
    story: "On an island, knights always tell the truth and knaves always lie. A stranger says: 'I am a knave.'",
    question: 'What is the stranger?',
    answer: 'Neither (impossible)',
    options: ['Knight', 'Knave', 'Neither (impossible)', 'Both'],
    breakdown: "If the stranger were a knight, he'd never say 'I am a knave' — contradiction. If a knave, his lie would mean he's a knight — contradiction. The statement is self-contradicting and impossible.",
  },
  {
    caseNo: 'Case #108',
    title: 'The Poisoned Well',
    category: '🔍 Logic Paradox',
    story: "A town has 100 wells. The murderer poisoned exactly 1 well. After testing, the detective narrows it down to 3 suspects, each claiming the other two did it. Only one suspect can be guilty.",
    question: 'If exactly one suspect is lying, how many are telling the truth?',
    answer: '2',
    options: ['0', '1', '2', '3'],
    breakdown: "If one is lying (the guilty one who falsely accuses others), the other two genuinely accuse each other's guilt. Exactly 2 tell the truth about seeing someone else do it.",
  },
  {
    caseNo: 'Case #109',
    title: 'The Stolen Diamond',
    category: '🔍 Logic Paradox',
    story: "Three suspects — Alex, Blake, and Casey — are questioned. Alex says 'Blake is lying.' Blake says 'Casey is innocent.' Casey says 'Alex is telling the truth.' Only one person is actually lying.",
    question: 'Who is lying?',
    answer: 'Blake',
    options: ['Alex', 'Blake', 'Casey', 'All three'],
    breakdown: "If Blake is lying, Casey is guilty (not innocent). Alex says Blake is lying — true. Casey says Alex is truthful — true. Only Blake is lying. Consistent! Blake is the liar.",
  },
  {
    caseNo: 'Case #110',
    title: 'The Age Enigma',
    category: '🔢 Number Deduction',
    story: "A mother is 21 years older than her son. In 6 years, the mother will be 5 times as old as her son.",
    question: 'How old is the son right now?',
    answer: '-3 (not born yet)',
    options: ['3 years old', '6 months old', '-3 (not born yet)', '1 year old'],
    breakdown: "Let son's age = x. Mother = x + 21. In 6 years: x + 21 + 6 = 5(x + 6) → x + 27 = 5x + 30 → -4x = 3 → x = -3/4. The son is not born yet — the mother is 9 months pregnant!",
  },
  {
    caseNo: 'Case #111',
    title: 'The Clock Conspiracy',
    category: '🔢 Number Deduction',
    story: "A clock loses exactly 5 minutes every hour. It was set to the correct time at 8:00 AM. The clock now shows 12:00 PM.",
    question: 'What is the actual correct time?',
    answer: '12:20 PM',
    options: ['12:00 PM', '12:15 PM', '12:20 PM', '12:25 PM'],
    breakdown: "In 4 shown hours, a clock losing 5 min/hr shows 4 real hours as only 48 effective minutes per hour. Real elapsed time = 4 hours × (60/55) ≈ 4h 22 min. Actual time = 8:00 AM + 4h 22m ≈ 12:22 PM. Closest = 12:20 PM.",
  },
  {
    caseNo: 'Case #112',
    title: 'The Three Doors',
    category: '🚪 Probability Trap',
    story: "You're on a game show. There are 3 doors — 1 hides a prize, 2 hide goats. You pick Door 1. The host, who knows what's behind each door, opens Door 3 to reveal a goat.",
    question: 'Should you switch to Door 2?',
    answer: 'Yes — switching wins 2/3 of the time',
    options: ['No — 50/50 either way', 'Yes — switching wins 2/3 of the time', 'No — switching loses more', 'Yes — guaranteed win'],
    breakdown: "This is the Monty Hall Problem. Initially 1/3 chance on Door 1. After host reveals a goat, Door 2 holds 2/3 probability. Always switching wins twice as often as staying.",
  },
  {
    caseNo: 'Case #113',
    title: 'The Missing Dollar',
    category: '🔢 Number Deduction',
    story: "3 friends split a ₹30 hotel bill paying ₹10 each. The manager refunds ₹5. The bellboy pockets ₹2 and returns ₹1 each. Now each paid ₹9 (total ₹27) + bellboy kept ₹2 = ₹29. Where is the missing ₹1?",
    question: 'What is the logical error in this puzzle?',
    answer: 'False addition — ₹27 already includes the ₹2',
    options: [
      'The bellboy stole the extra ₹1',
      'The manager miscounted',
      'False addition — ₹27 already includes the ₹2',
      'One friend overpaid',
    ],
    breakdown: "The trick is in the framing. The 3 friends paid ₹27 total: ₹25 to hotel + ₹2 to bellboy. There's no missing ₹1 — adding the ₹2 to ₹27 is double-counting. The real accounting: ₹27 paid − ₹2 kept = ₹25 correct hotel price.",
  },
  {
    caseNo: 'Case #114',
    title: 'The Twins Paradox',
    category: '🔍 Logic Paradox',
    story: "Identical twins Aarav and Bhavik were born 5 minutes apart in the same hospital. Bhavik is older. However, Aarav celebrates his birthday one day before Bhavik every year.",
    question: 'How is this possible?',
    answer: 'Daylight saving time shifted clocks back',
    options: [
      'They have different birth years',
      'One was adopted',
      'Daylight saving time shifted clocks back',
      'Hospital records were mixed up',
    ],
    breakdown: "When daylight saving time ends, clocks roll back 1 hour. Aarav was born just after the clock rolled back. Bhavik, born 5 minutes earlier, had a later calendar timestamp making Bhavik officially older but with a later date.",
  },
  {
    caseNo: 'Case #115',
    title: 'The Sealed Room',
    category: '🏠 Spatial Deduction',
    story: "A man is found dead in a locked room with no windows. The only clue: a pool of water on the floor and a tiny puddle near the man's hand. The door was locked from inside. No weapon was found.",
    question: 'How was the man killed?',
    answer: 'Stabbed with an ice weapon that melted',
    options: [
      'Poisoned via the water',
      'Stabbed with an ice weapon that melted',
      'Suffocated — no air vents',
      'Self-inflicted wound',
    ],
    breakdown: "The weapon was made of ice — an icicle or ice dagger. It was used to stab the victim, then melted away, leaving only the pool of water as evidence. A classic 'impossible crime' solution.",
  },
  {
    caseNo: 'Case #116',
    title: 'The Light in the Dark',
    category: '🏠 Spatial Deduction',
    story: "A blind man walks into a hardware store. Without any help, he pays for sunglasses at the counter. Why does he buy sunglasses?",
    question: 'Why does the blind man buy sunglasses?',
    answer: 'To protect his eyes from the sun',
    options: [
      'He is not really blind',
      'They are a gift for someone else',
      'To protect his eyes from the sun',
      'For a costume',
    ],
    breakdown: "Being blind does not mean the eyes are removed. Blind people can still benefit from UV protection for their eyes. The twist: we assume blind people have no need for sunglasses, but medically that is false.",
  },
  {
    caseNo: 'Case #117',
    title: 'The Elevator Button',
    category: '🏠 Spatial Deduction',
    story: "A man lives on the 20th floor of an apartment. Every morning he takes the elevator to the ground floor. On the way back, he takes the elevator to the 10th floor and walks the remaining 10 floors — unless it's raining.",
    question: 'Why does he take the stairs the last 10 floors?',
    answer: 'He is too short to reach the 20th button',
    options: [
      'He prefers exercise',
      'The elevator skips even floors',
      'He is too short to reach the 20th button',
      'The elevator is slow above floor 10',
    ],
    breakdown: "He can only reach the button for floor 10 with his hand. When raining, he uses his umbrella to press the 20th floor button. This is a classic lateral thinking puzzle.",
  },
  {
    caseNo: 'Case #118',
    title: "The Surgeon's Dilemma",
    category: '🔍 Logic Paradox',
    story: "A boy is in a serious accident. His father dies at the scene. At the hospital, the surgeon says: 'I cannot operate on this boy — he is my son.'",
    question: 'How is this possible?',
    answer: 'The surgeon is his mother',
    options: [
      'The boy was adopted',
      'The surgeon is his stepfather',
      'The surgeon is his mother',
      'The boy has two fathers',
    ],
    breakdown: "The surgeon is the boy's mother. This puzzle reveals unconscious gender bias — many people assume surgeons are male, so they get confused. The simplest answer is that the surgeon is a woman.",
  },
  {
    caseNo: 'Case #119',
    title: 'The Midnight Train',
    category: '🔢 Number Deduction',
    story: "A train leaves City A at 7:00 PM and arrives at City B at 7:00 AM. Another train leaves City B at 7:00 PM going the same route in reverse, arriving at City A at 7:00 AM. Both travel at the same speed.",
    question: 'How many times do the two trains pass each other?',
    answer: 'Once',
    options: ['Never', 'Once', 'Twice', 'Three times'],
    breakdown: "Since both depart at 7:00 PM and travel at the same speed on the same route, they meet exactly once — in the middle of the route at 1:00 AM. They pass each other just one time.",
  },
  {
    caseNo: 'Case #120',
    title: 'The Case of the Double Nephew',
    category: '🩸 Blood Relation',
    story: "Two brothers married two sisters. Each couple had one child. The children are cousins from both their mother's side AND their father's side simultaneously.",
    question: 'What is the exact relationship between the two children?',
    answer: 'Double first cousins',
    options: [
      'Step-siblings',
      'Half-siblings',
      'Double first cousins',
      'Second cousins',
    ],
    breakdown: "When two brothers marry two sisters and each has a child, those children share 4 common grandparents instead of the usual 2. This makes them 'double first cousins,' genetically as close as half-siblings.",
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

// Animated detective background SVG elements
function DetectiveBg({ activeClue }) {
  return (
    <div className="detective-animated-bg" aria-hidden="true">
      {/* Floating fingerprint rings */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`fp-${i}`}
          className="det-bg-fingerprint"
          style={{
            left: `${10 + i * 15}%`,
            top: `${15 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.7}s`,
            opacity: activeClue ? 0.18 : 0.08,
          }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            {[8, 16, 24, 32, 40].map((r, ri) => (
              <circle
                key={ri}
                cx="30"
                cy="30"
                r={r}
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray={`${r * 0.6} ${r * 0.4}`}
              />
            ))}
          </svg>
        </div>
      ))}

      {/* Magnifying glass outline */}
      <div className="det-bg-mag" style={{ right: '8%', top: '20%' }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="48" y1="48" x2="68" y2="68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Dossier file stack */}
      <div className="det-bg-files" style={{ left: '3%', bottom: '25%' }}>
        {[0, 4, 8].map((off, i) => (
          <div
            key={i}
            className="det-bg-file"
            style={{ transform: `rotate(${-8 + i * 8}deg) translateY(${off}px)` }}
          />
        ))}
      </div>

      {/* Dotted string lines — crime board */}
      <svg className="det-bg-strings" viewBox="0 0 400 300" preserveAspectRatio="none">
        <line x1="20" y1="60" x2="200" y2="140" stroke="currentColor" strokeWidth="1" strokeDasharray="5 8" opacity="0.15" />
        <line x1="200" y1="140" x2="380" y2="80" stroke="currentColor" strokeWidth="1" strokeDasharray="5 8" opacity="0.12" />
        <line x1="60" y1="200" x2="340" y2="220" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" opacity="0.10" />
        <circle cx="200" cy="140" r="5" fill="currentColor" opacity="0.2" />
        <circle cx="20" cy="60" r="4" fill="currentColor" opacity="0.15" />
        <circle cx="380" cy="80" r="4" fill="currentColor" opacity="0.15" />
      </svg>

      {/* Footsteps */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={`step-${i}`}
          className="det-bg-footstep"
          style={{
            left: `${20 + i * 18}%`,
            bottom: `${8 + (i % 2) * 6}%`,
            animationDelay: `${i * 0.4}s`,
          }}
        >
          👣
        </div>
      ))}
    </div>
  );
}

export default function DetectiveMystery({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready');
  const [cases] = useState(() => shuffleArray(DETECTIVE_CASES));
  const [caseIdx, setCaseIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [hoveredClue, setHoveredClue] = useState(false);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const currentCase = cases[caseIdx % cases.length];

  const shuffledOptions = React.useMemo(() => {
    return shuffleArray(currentCase.options);
  }, [currentCase]);

  const handleSelect = (opt) => {
    if (selectedOpt !== null || gameState !== 'playing') return;
    setSelectedOpt(opt);

    if (opt === currentCase.answer) {
      sound.playCorrect();
      const pts = 200;
      const newScore = score + pts;
      setScore(newScore);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);
      setSolved(s => s + 1);
      if (onSaveScore) onSaveScore('detectiveMystery', newScore);
    } else {
      sound.playWrong();
    }
  };

  const handleNextCase = () => {
    setCaseIdx(i => i + 1);
    setSelectedOpt(null);
    setHoveredClue(false);
  };

  const startGame = () => {
    setScore(0);
    setSolved(0);
    setCaseIdx(0);
    setSelectedOpt(null);
    setHoveredClue(false);
    setGameState('playing');
  };

  return (
    <div className="screen mini-game-screen detective-screen">
      <DetectiveBg activeClue={hoveredClue} />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🕵️ Detective Mystery</div>
        <div className="hud-badge-compact">Solved: {solved}</div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>
            Logic · Paradox · Blood Relations
          </div>
          <h2>Detective Mystery</h2>
          <p className="ready-desc">
            20 unique cases await — from blood relations and logic paradoxes to probability traps and lateral thinking puzzles. Crack them all!
          </p>
          <div className="rules-grid">
            <div className="rule-item">🔍 Logic paradoxes & brain teasers</div>
            <div className="rule-item">🩸 Family blood relation chains</div>
            <div className="rule-item">🚪 Lateral thinking & spatial puzzles</div>
            <div className="rule-item">🏆 200 pts per solved case</div>
          </div>
          <button className="btn-start-mini" style={{ background: 'var(--amber)' }} onClick={startGame}>
            <span>Open Case Files</span> →
          </button>
        </div>
      )}

      {gameState === 'playing' && currentCase && (
        <div className="detective-play-area">
          <div className="hud-strip">
            <div className="hud-badge">
              <span className="lbl">Score</span>
              <span className="val">{score}</span>
            </div>
            <div className="hud-badge">
              <span className="lbl">Case</span>
              <span className="val">{currentCase.caseNo}</span>
            </div>
            <div className="hud-badge det-category-badge">
              <span className="val" style={{ fontSize: '0.75rem' }}>{currentCase.category}</span>
            </div>
          </div>

          {/* Dossier Case File */}
          <div
            className={`detective-dossier-card ${hoveredClue ? 'dossier-lit' : ''}`}
            onMouseEnter={() => setHoveredClue(true)}
            onMouseLeave={() => setHoveredClue(false)}
          >
            <div className="dossier-header-row">
              <span className="dossier-stamp">CONFIDENTIAL EVIDENCE</span>
              <h3 className="dossier-title">{currentCase.title}</h3>
            </div>

            <div className="testimony-quote-box">
              <span className="quote-mark">"</span>
              <p className="testimony-text">{currentCase.story}</p>
            </div>

            <div className="detective-target-question">
              <strong>Question:</strong> {currentCase.question}
            </div>
          </div>

          {/* Suspect / Relation Options */}
          <div className="detective-options-grid">
            {shuffledOptions.map((opt, i) => {
              const isSelected = selectedOpt === opt;
              const isCorrect = opt === currentCase.answer;
              let stateClass = '';
              if (selectedOpt !== null) {
                if (isSelected) stateClass = isCorrect ? 'det-correct' : 'det-wrong';
                else if (isCorrect) stateClass = 'det-revealed';
              }

              return (
                <button
                  key={i}
                  className={`btn-detective-opt ${stateClass}`}
                  onClick={() => handleSelect(opt)}
                  disabled={selectedOpt !== null}
                  onMouseEnter={() => setHoveredClue(true)}
                  onMouseLeave={() => setHoveredClue(false)}
                >
                  <span className="opt-letter-tag">{['A', 'B', 'C', 'D'][i]}</span>
                  <span className="det-opt-text">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Breakdown Reveal */}
          {selectedOpt !== null && (
            <div className="detective-breakdown-card animate-pop">
              <div className="breakdown-title">
                {selectedOpt === currentCase.answer ? '✅ Case Cracked!' : '❌ Incorrect Deduction'}
              </div>
              <p className="breakdown-text">{currentCase.breakdown}</p>
              <button className="btn-next-case" onClick={handleNextCase}>
                Next Case File ➔
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
