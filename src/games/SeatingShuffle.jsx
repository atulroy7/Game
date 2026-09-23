import React, { useState } from "react";
import BgOrbs from "../components/BgOrbs";
import Confetti from "../components/Confetti";
import ScorePop from "../components/ScorePop";

const SEATING_PUZZLES = [
  {
    title: "Linear 5-Chair Row",
    people: ["Alex", "Bella", "Chris", "Diana", "Evan"],
    correctOrder: ["Bella", "Evan", "Alex", "Chris", "Diana"],
    clues: [
      { text: "Diana sits at the extreme right end (Chair 5).", check: a => a[4] === "Diana" },
      { text: "Evan sits in Chair 2.", check: a => a[1] === "Evan" },
      { text: "Alex sits immediately to the left of Chris.", check: a => { const ai = a.indexOf("Alex"), ci = a.indexOf("Chris"); return ai !== -1 && ci !== -1 && ai + 1 === ci; } },
      { text: "Bella is seated to the left of Evan.", check: a => { const bi = a.indexOf("Bella"), ei = a.indexOf("Evan"); return bi !== -1 && ei !== -1 && bi < ei; } },
    ],
  },
  {
    title: "Executive Boardroom",
    people: ["Leo", "Maya", "Noah", "Olivia", "Paul"],
    correctOrder: ["Noah", "Maya", "Leo", "Paul", "Olivia"],
    clues: [
      { text: "Leo sits in the exact middle seat (Chair 3).", check: a => a[2] === "Leo" },
      { text: "Noah sits at the extreme left (Chair 1).", check: a => a[0] === "Noah" },
      { text: "Maya sits between Noah and Leo (Chair 2).", check: a => a[1] === "Maya" },
      { text: "Olivia sits at the extreme right end (Chair 5).", check: a => a[4] === "Olivia" },
    ],
  },
  {
    title: "Dinner Party Order",
    people: ["Emma", "Jack", "Liam", "Sophia", "Zoe"],
    correctOrder: ["Jack", "Zoe", "Emma", "Sophia", "Liam"],
    clues: [
      { text: "Emma sits in the center seat (Chair 3).", check: a => a[2] === "Emma" },
      { text: "Liam is on the far right end (Chair 5).", check: a => a[4] === "Liam" },
      { text: "Jack is seated to the immediate left of Zoe.", check: a => { const ji = a.indexOf("Jack"), zi = a.indexOf("Zoe"); return ji !== -1 && zi !== -1 && ji + 1 === zi; } },
      { text: "Sophia sits between Emma and Liam (Chair 4).", check: a => a[3] === "Sophia" },
    ],
  },
  {
    title: "Library Reading Corner",
    people: ["Amy", "Ben", "Cara", "Dan", "Eve"],
    correctOrder: ["Amy", "Cara", "Ben", "Eve", "Dan"],
    clues: [
      { text: "Amy sits first on the left (Chair 1).", check: a => a[0] === "Amy" },
      { text: "Dan sits at the far right (Chair 5).", check: a => a[4] === "Dan" },
      { text: "Ben is between Cara and Eve (Chair 3).", check: a => a[2] === "Ben" },
      { text: "Cara sits in Chair 2.", check: a => a[1] === "Cara" },
    ],
  },
  {
    title: "Science Lab Bench",
    people: ["Finn", "Gina", "Hugo", "Iris", "Jay"],
    correctOrder: ["Gina", "Finn", "Hugo", "Jay", "Iris"],
    clues: [
      { text: "Iris sits at the far right end (Chair 5).", check: a => a[4] === "Iris" },
      { text: "Hugo sits in Chair 3 (middle).", check: a => a[2] === "Hugo" },
      { text: "Finn sits immediately to the right of Gina.", check: a => { const fi = a.indexOf("Finn"), gi = a.indexOf("Gina"); return fi !== -1 && gi !== -1 && gi + 1 === fi; } },
      { text: "Jay is to the left of Iris.", check: a => { const ji = a.indexOf("Jay"), ii = a.indexOf("Iris"); return ji !== -1 && ii !== -1 && ji < ii; } },
    ],
  },
  {
    title: "Cinema Row Seating",
    people: ["Kate", "Leo", "Mia", "Nick", "Ora"],
    correctOrder: ["Leo", "Mia", "Kate", "Ora", "Nick"],
    clues: [
      { text: "Nick sits at the extreme right (Chair 5).", check: a => a[4] === "Nick" },
      { text: "Kate sits in the middle (Chair 3).", check: a => a[2] === "Kate" },
      { text: "Leo sits immediately to the left of Mia.", check: a => { const li = a.indexOf("Leo"), mi = a.indexOf("Mia"); return li !== -1 && mi !== -1 && li + 1 === mi; } },
      { text: "Ora is to the left of Nick.", check: a => { const oi = a.indexOf("Ora"), ni = a.indexOf("Nick"); return oi !== -1 && ni !== -1 && oi < ni; } },
    ],
  },
];

const TOTAL_PUZZLES = 6;

export default function SeatingShuffle({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState("ready");
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

  const playSoundSafe = (type) => {
    try {
      if (type === 'pop') {
        if (sound && sound.playPop) sound.playPop();
        else if (sound && sound.playFlip) sound.playFlip();
      } else if (type === 'correct') {
        if (sound && sound.playCorrect) sound.playCorrect();
      } else if (type === 'wrong') {
        if (sound && sound.playWrong) sound.playWrong();
      } else if (type === 'streak') {
        if (sound && sound.playStreak) sound.playStreak();
      }
    } catch (e) {
      // Audio fallback
    }
  };

  const startGame = () => {
    setPuzzleIdx(0);
    setSlots([null, null, null, null, null]);
    setSelectedPerson(null);
    setScore(0);
    setSolved(0);
    setIsSolved(false);
    setShake(false);
    setGameState("playing");
  };

  const handleBenchClick = (person) => {
    playSoundSafe('pop');
    // Toggle off if already selected; otherwise select this person
    setSelectedPerson(prev => (prev === person ? null : person));
  };

  const handleSeatClick = (seatIdx) => {
    playSoundSafe('pop');
    if (selectedPerson) {
      const next = [...slots];
      const fromSeatIdx = next.indexOf(selectedPerson);
      const existingOccupant = next[seatIdx];

      if (fromSeatIdx !== -1) {
        // Person was already in a seat: move or swap
        if (fromSeatIdx === seatIdx) {
          // Clicked same seat -> deselect
          setSelectedPerson(null);
          return;
        }
        next[fromSeatIdx] = existingOccupant;
        next[seatIdx] = selectedPerson;
      } else {
        // Person came from bench
        next[seatIdx] = selectedPerson;
      }
      setSlots(next);
      setSelectedPerson(null);
    } else if (slots[seatIdx]) {
      // Pick up occupant from this seat
      setSelectedPerson(slots[seatIdx]);
    }
  };

  const handleRemoveFromSeat = (seatIdx, e) => {
    e.stopPropagation();
    playSoundSafe('pop');
    const person = slots[seatIdx];
    if (!person) return;
    if (selectedPerson === person) setSelectedPerson(null);
    const next = [...slots];
    next[seatIdx] = null;
    setSlots(next);
  };

  const handleResetSeats = () => {
    playSoundSafe('pop');
    setSlots([null, null, null, null, null]);
    setSelectedPerson(null);
  };

  const handleCheckArrangement = () => {
    const allFilled = slots.every(s => s !== null);
    if (!allFilled) {
      playSoundSafe('wrong');
      setShake(true);
      setTimeout(() => setShake(false), 300);
      return;
    }
    const allCluesPass = current.clues.every(clue => clue.check(slots));
    if (allCluesPass) {
      playSoundSafe('correct');
      setIsSolved(true);
      const pts = 250;
      const ns = score + pts;
      setScore(ns);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);
      setSolved(s => s + 1);
      if (onSaveScore) onSaveScore("seatingShuffle", ns);
    } else {
      playSoundSafe('wrong');
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }
  };

  const handleNextPuzzle = () => {
    const next = puzzleIdx + 1;
    if (next >= TOTAL_PUZZLES) {
      setGameState("gameover");
      if (solved + 1 >= 5) playSoundSafe('streak');
      else playSoundSafe('correct');
    } else {
      setPuzzleIdx(next);
      setSlots([null, null, null, null, null]);
      setSelectedPerson(null);
      setIsSolved(false);
    }
  };

  return (
    <div className="screen mini-game-screen seating-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🪑 Seating Shuffle</div>
        <div className="hud-badge-compact">Solved: {solved}/{TOTAL_PUZZLES}</div>
      </div>

      {/* Ready Screen */}
      {gameState === "ready" && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop" style={{ background: "var(--mint-soft)", color: "var(--mint)" }}>
            Logic Puzzle · 6 Arrangements
          </div>
          <h2>Seating Shuffle 🪑</h2>
          <p className="ready-desc">
            Read the clues carefully and arrange 5 people across 5 chairs in the correct order.
            All clues must be satisfied!
          </p>
          <div className="rules-grid">
            <div className="rule-item">👤 Click a person to pick them up</div>
            <div className="rule-item">🪑 Click a chair to seat or swap them</div>
            <div className="rule-item">💡 Satisfy all 4 logical clues</div>
            <div className="rule-item">⭐ 250 pts per solved arrangement</div>
          </div>
          <button className="btn-start-mini" style={{ background: "var(--mint)" }} onClick={startGame}>
            <span>Begin Arrangements</span> →
          </button>
        </div>
      )}

      {/* Playing Screen */}
      {gameState === "playing" && (
        <div className="seating-main-container">
          <div className="hud-strip">
            <div className="hud-badge"><span className="lbl">Score</span><span className="val">{score}</span></div>
            <div className="hud-badge"><span className="lbl">Puzzle</span><span className="val">#{puzzleIdx + 1} of {TOTAL_PUZZLES}</span></div>
          </div>

          <div className="seating-puzzle-header">
            <h3>{current.title}</h3>
            <p>1. Click a person below to hold them &rarr; 2. Click a chair above to place them!</p>
          </div>

          {selectedPerson && (
            <div className="seating-held-banner animate-pop">
              👤 Holding: <strong>{selectedPerson}</strong> &mdash; Now click any chair below to seat them!
              <button
                className="btn-cancel-hold"
                style={{ marginLeft: '12px', background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', fontWeight: 900 }}
                onClick={() => setSelectedPerson(null)}
              >
                (Cancel ✕)
              </button>
            </div>
          )}

          <div className={`chairs-row-wrapper ${shake ? "shake-fx" : ""}`}>
            <div className="chairs-row">
              {slots.map((person, i) => {
                const isHeld = selectedPerson && selectedPerson === person;
                const isTarget = selectedPerson && selectedPerson !== person;
                return (
                  <div
                    key={i}
                    className={`chair-slot ${person ? "chair-occupied" : "chair-empty"} ${isHeld ? "chair-selected" : ""} ${isTarget ? "chair-target-hint" : ""}`}
                    onClick={() => handleSeatClick(i)}
                    title={selectedPerson ? `Seat ${selectedPerson} here` : person ? `Click to move ${person}` : 'Empty chair'}
                  >
                    {person && (
                      <button
                        className="chair-remove-btn"
                        title={`Remove ${person} back to bench`}
                        onClick={(e) => handleRemoveFromSeat(i, e)}
                      >
                        ✕
                      </button>
                    )}
                    <div className="chair-num">Chair {i + 1}</div>
                    <div className="chair-seat-icon">{person ? "🪑" : "🪑"}</div>
                    <div className="chair-occupant">{person || <span className="empty-dash">&mdash;</span>}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="people-bench-section">
            <div className="bench-lbl" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                {selectedPerson
                  ? `👤 Selected: ${selectedPerson} &rarr; Click a chair!`
                  : "Click a person below to pick up:"}
              </span>
              {slots.some(s => s !== null) && (
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                  onClick={handleResetSeats}
                >
                  Clear All Chairs ↺
                </button>
              )}
            </div>
            <div className="people-pills-row">
              {availablePeople.map(person => (
                <button
                  key={person}
                  type="button"
                  className={`btn-person-pill ${selectedPerson === person ? "person-selected" : ""}`}
                  onClick={() => handleBenchClick(person)}
                >
                  👤 {person}
                </button>
              ))}
              {availablePeople.length === 0 && (
                <span style={{ color: "var(--muted)", fontSize: "0.85rem", fontStyle: "italic", padding: "6px 0" }}>
                  All 5 people placed! Click any chair to swap or remove.
                </span>
              )}
            </div>
          </div>

          <div className="seating-clues-card">
            <h4>Arrangement Clues:</h4>
            <div className="seating-clues-list">
              {current.clues.map((clue, idx) => {
                const satisfied = clue.check(slots);
                return (
                  <div key={idx} className={`seating-clue-item ${satisfied ? "clue-met" : ""}`}>
                    <span className="clue-status-icon">{satisfied ? "🟢" : "⚪"}</span>
                    <span className="clue-desc">{clue.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="seating-actions-row">
            {!isSolved ? (
              <button
                className="btn-verify-seating"
                style={{ flex: 1 }}
                onClick={handleCheckArrangement}
              >
                Verify Seating Arrangement ➔
              </button>
            ) : (
              <button
                className="btn-next-seating animate-pop"
                style={{ flex: 1 }}
                onClick={handleNextPuzzle}
              >
                {puzzleIdx + 1 < TOTAL_PUZZLES ? "Next Puzzle →" : "See Final Score →"}
              </button>
            )}
            {slots.some(s => s !== null) && !isSolved && (
              <button
                className="btn-reset-seating"
                onClick={handleResetSeats}
                title="Clear all chairs"
              >
                Reset ↺
              </button>
            )}
          </div>

          {isSolved && <Confetti />}
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === "gameover" && (
        <div className="mini-card gameover-modal">
          {solved >= 5 && <Confetti />}
          <div className="gameover-icon">🪑</div>
          <h2>{solved >= 5 ? "Seating Maestro!" : solved >= 3 ? "Logical Arranger!" : "Keep Practicing!"}</h2>
          <p className="ready-desc">
            {solved >= 5
              ? "Outstanding! You arranged every group flawlessly."
              : solved >= 3
              ? "Great logical thinking across the puzzles!"
              : "Logic puzzles take practice — try again!"}
          </p>
          <div className="results-metrics">
            <div className="metric-box"><span className="m-val">{score}</span><span className="m-lbl">Score</span></div>
            <div className="metric-box"><span className="m-val">{solved} / {TOTAL_PUZZLES}</span><span className="m-lbl">Solved</span></div>
          </div>
          <div className="modal-actions">
            <button className="btn-play-again" style={{ background: "var(--mint)" }} onClick={startGame}>Try Again ↺</button>
            <button className="btn-hub" onClick={onBack}>Arcade Hub</button>
          </div>
        </div>
      )}
    </div>
  );
}
