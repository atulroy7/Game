import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const SEATING_PUZZLES = [
  {
    title: 'Linear 5-Chair Row',
    people: ['Alex', 'Bella', 'Chris', 'Diana', 'Evan'],
    correctOrder: ['Bella', 'Evan', 'Alex', 'Chris', 'Diana'],
    clues: [
      { text: 'Diana sits at the extreme right end (Chair 5).', check: (arr) => arr[4] === 'Diana' },
      { text: 'Evan sits in Chair 2.', check: (arr) => arr[1] === 'Evan' },
      { text: 'Alex sits immediately to the left of Chris.', check: (arr) => {
        const a = arr.indexOf('Alex');
        const c = arr.indexOf('Chris');
        return a !== -1 && c !== -1 && a + 1 === c;
      }},
      { text: 'Bella is seated to the left of Evan.', check: (arr) => {
        const b = arr.indexOf('Bella');
        const e = arr.indexOf('Evan');
        return b !== -1 && e !== -1 && b < e;
      }},
    ],
  },
  {
    title: 'Executive Boardroom',
    people: ['Leo', 'Maya', 'Noah', 'Olivia', 'Paul'],
    correctOrder: ['Noah', 'Maya', 'Leo', 'Paul', 'Olivia'],
    clues: [
      { text: 'Leo sits in the exact middle seat (Chair 3).', check: (arr) => arr[2] === 'Leo' },
      { text: 'Noah sits at the extreme left (Chair 1).', check: (arr) => arr[0] === 'Noah' },
      { text: 'Maya sits between Noah and Leo.', check: (arr) => arr[1] === 'Maya' },
      { text: 'Olivia sits at the extreme right end (Chair 5).', check: (arr) => arr[4] === 'Olivia' },
    ],
  },
  {
    title: 'Dinner Party Order',
    people: ['Emma', 'Jack', 'Liam', 'Sophia', 'Zoe'],
    correctOrder: ['Jack', 'Zoe', 'Emma', 'Sophia', 'Liam'],
    clues: [
      { text: 'Emma sits in the center seat (Chair 3).', check: (arr) => arr[2] === 'Emma' },
      { text: 'Liam is on the far right end.', check: (arr) => arr[4] === 'Liam' },
      { text: 'Jack is seated to the immediate left of Zoe.', check: (arr) => {
        const j = arr.indexOf('Jack');
        const z = arr.indexOf('Zoe');
        return j !== -1 && z !== -1 && j + 1 === z;
      }},
      { text: 'Sophia sits between Emma and Liam.', check: (arr) => arr[3] === 'Sophia' },
    ],
  },
];

export default function SeatingShuffle({ sound, onBack, onSaveScore }) {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [slots, setSlots] = useState([null, null, null, null, null]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [shake, setShake] = useState(false);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const current = SEATING_PUZZLES[puzzleIdx % SEATING_PUZZLES.length];

  const availablePeople = current.people.filter(p => !slots.includes(p));

  const handleSeatClick = (seatIdx) => {
    sound.playPop();
    if (selectedPerson) {
      // Put selected person in this seat
      const next = [...slots];
      // If someone was there, replace
      next[seatIdx] = selectedPerson;
      setSlots(next);
      setSelectedPerson(null);
    } else if (slots[seatIdx]) {
      // Pick up person from seat
      const person = slots[seatIdx];
      const next = [...slots];
      next[seatIdx] = null;
      setSlots(next);
      setSelectedPerson(person);
    }
  };

  const handleCheckArrangement = () => {
    const allFilled = slots.every(s => s !== null);
    if (!allFilled) {
      sound.playWrong();
      setShake(true);
      setTimeout(() => setShake(false), 300);
      return;
    }

    const allCluesPass = current.clues.every(clue => clue.check(slots));

    if (allCluesPass) {
      sound.playCorrect();
      setIsSolved(true);
      const pts = 250;
      const newScore = score + pts;
      setScore(newScore);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);
      setSolved(s => s + 1);
      if (onSaveScore) onSaveScore('seatingShuffle', newScore);
    } else {
      sound.playWrong();
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }
  };

  const handleNextPuzzle = () => {
    setPuzzleIdx(i => i + 1);
    setSlots([null, null, null, null, null]);
    setSelectedPerson(null);
    setIsSolved(false);
  };

  return (
    <div className="screen mini-game-screen seating-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🪑 Seating Shuffle</div>
        <div className="hud-badge-compact">Solved: {solved}</div>
      </div>

      <div className="seating-main-container">
        <div className="hud-strip">
          <div className="hud-badge">
            <span className="lbl">Score</span>
            <span className="val">{score}</span>
          </div>
          <div className="hud-badge">
            <span className="lbl">Puzzle</span>
            <span className="val">#{puzzleIdx + 1}</span>
          </div>
        </div>

        {/* Puzzle Header */}
        <div className="seating-puzzle-header">
          <h3>{current.title}</h3>
          <p>Arrange 5 people in the 5 chairs according to the logical clues!</p>
        </div>

        {/* The 5 Chairs Row */}
        <div className={`chairs-row-wrapper ${shake ? 'shake-fx' : ''}`}>
          <div className="chairs-row">
            {slots.map((person, i) => (
              <div
                key={i}
                className={`chair-slot ${person ? 'chair-occupied' : 'chair-empty'} ${selectedPerson ? 'chair-target-hint' : ''}`}
                onClick={() => handleSeatClick(i)}
              >
                <div className="chair-num">Chair {i + 1}</div>
                <div className="chair-seat-icon">🪑</div>
                <div className="chair-occupant">
                  {person || <span className="empty-dash">—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Character Bench (available people) */}
        <div className="people-bench-section">
          <div className="bench-lbl">Click person to pick up, then click a chair:</div>
          <div className="people-pills-row">
            {availablePeople.map((person) => (
              <button
                key={person}
                className={`btn-person-pill ${selectedPerson === person ? 'person-selected' : ''}`}
                onClick={() => setSelectedPerson(p => p === person ? null : person)}
              >
                👤 {person}
              </button>
            ))}
          </div>
        </div>

        {/* Clues with Live Evaluation */}
        <div className="seating-clues-card">
          <h4>Arrangement Clues:</h4>
          <div className="seating-clues-list">
            {current.clues.map((clue, idx) => {
              const satisfied = clue.check(slots);
              return (
                <div key={idx} className={`seating-clue-item ${satisfied ? 'clue-met' : ''}`}>
                  <span className="clue-status-icon">{satisfied ? '🟢' : '⚪'}</span>
                  <span className="clue-desc">{clue.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        {!isSolved ? (
          <button className="btn-verify-seating" onClick={handleCheckArrangement}>
            Verify Seating Arrangement ➔
          </button>
        ) : (
          <button className="btn-next-seating animate-pop" onClick={handleNextPuzzle}>
            Next Seating Puzzle →
          </button>
        )}
      </div>

      {isSolved && <Confetti />}
    </div>
  );
}
