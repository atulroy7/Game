import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const DETECTIVE_CASES = [
  {
    caseNo: 'Case #101',
    title: 'The Photograph Riddle',
    story: "Pointing to a photograph of a boy, Suresh said: 'He is the son of the only son of my mother.'",
    question: 'How is Suresh related to the boy in the photograph?',
    answer: 'Father',
    options: ['Father', 'Brother', 'Uncle', 'Grandfather'],
    breakdown: "Mother's only son is Suresh himself. The boy is his son, so Suresh is the Father.",
  },
  {
    caseNo: 'Case #102',
    title: 'The Ancestral Heritage',
    story: "A is B's brother. C is A's mother. D is C's father. E is B's son.",
    question: 'How is D related to A?',
    answer: 'Maternal Grandfather',
    options: ['Maternal Grandfather', 'Father', 'Uncle', 'Great Grandfather'],
    breakdown: "A's mother is C, and C's father is D. Therefore, D is A's maternal grandfather.",
  },
  {
    caseNo: 'Case #103',
    title: 'The Banquet Encounter',
    story: "Introducing a man at a party, a woman said: 'His wife is the only daughter of my father.'",
    question: 'How is the man related to the woman?',
    answer: 'Husband',
    options: ['Husband', 'Brother', 'Father-in-law', 'Cousin'],
    breakdown: "The only daughter of the woman's father is the woman herself. Since his wife is the woman herself, the man is her Husband.",
  },
  {
    caseNo: 'Case #104',
    title: 'The Football Field Mystery',
    story: "Deepak said to Nitin: 'That boy playing with the football is the younger of the two brothers of the daughter of my father’s wife.'",
    question: 'How is the boy playing football related to Deepak?',
    answer: 'Brother',
    options: ['Brother', 'Son', 'Nephew', 'Cousin'],
    breakdown: "Father's wife is Deepak's mother. Daughter of his mother is his sister. Brother of his sister is Deepak's Brother.",
  },
  {
    caseNo: 'Case #105',
    title: 'The Gallery Portrait',
    story: "A man pointing to a lady said: 'Her mother is the only daughter of my mother.'",
    question: 'How is the man related to the lady?',
    answer: 'Maternal Uncle',
    options: ['Maternal Uncle', 'Father', 'Brother', 'Grandfather'],
    breakdown: "Only daughter of the man's mother is the man's sister. The lady is the daughter of his sister. Therefore, the man is her Maternal Uncle.",
  },
  {
    caseNo: 'Case #106',
    title: 'The Conference Call',
    story: "Rahul said: 'The girl I met yesterday at the beach was the youngest daughter of the brother-in-law of my friend’s mother.'",
    question: 'How is the girl related to Rahul’s friend?',
    answer: 'Cousin',
    options: ['Cousin', 'Niece', 'Sister', 'Aunt'],
    breakdown: "Brother-in-law of friend's mother is friend's maternal uncle. Daughter of the maternal uncle is the friend's Cousin.",
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

export default function DetectiveMystery({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready');
  const [caseIdx, setCaseIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const currentCase = DETECTIVE_CASES[caseIdx % DETECTIVE_CASES.length];

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
  };

  const startGame = () => {
    setScore(0);
    setSolved(0);
    setCaseIdx(0);
    setSelectedOpt(null);
    setGameState('playing');
  };

  return (
    <div className="screen mini-game-screen detective-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🕵️ Detective Mystery</div>
        <div className="hud-badge-compact">Solved: {solved}</div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>
            Blood Relations &amp; Clue Deduction
          </div>
          <h2>Detective Mystery</h2>
          <p className="ready-desc">
            Put on your detective hat! Unravel intricate family relations, bloodlines, and statement paradoxes to deduce the true identity in each case file.
          </p>
          <div className="rules-grid">
            <div className="rule-item">🔍 Examine testimony statements</div>
            <div className="rule-item">🌳 Trace family tree blood relations</div>
            <div className="rule-item">💡 Detailed logic breakdown after each case</div>
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
          </div>

          {/* Dossier Case File */}
          <div className="detective-dossier-card">
            <div className="dossier-header-row">
              <span className="dossier-stamp">CONFIDENTIAL EVIDENCE</span>
              <h3 className="dossier-title">{currentCase.title}</h3>
            </div>

            <div className="testimony-quote-box">
              <span className="quote-mark">“</span>
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
                >
                  <span className="det-opt-icon">👤</span>
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
