import React, { useState } from "react";
import BgOrbs from "../components/BgOrbs";
import Confetti from "../components/Confetti";
import ScorePop from "../components/ScorePop";

const SEATING_PUZZLES = [
  {
    title: "Linear 5-Chair Row",
    people: ["Alex","Bella","Chris","Diana","Evan"],
    correctOrder: ["Bella","Evan","Alex","Chris","Diana"],
    clues: [
      { text: "Diana sits at the extreme right end (Chair 5).", check: a => a[4]==="Diana" },
      { text: "Evan sits in Chair 2.", check: a => a[1]==="Evan" },
      { text: "Alex sits immediately to the left of Chris.", check: a => { const ai=a.indexOf("Alex"),ci=a.indexOf("Chris"); return ai!==-1&&ci!==-1&&ai+1===ci; } },
      { text: "Bella is seated to the left of Evan.", check: a => { const bi=a.indexOf("Bella"),ei=a.indexOf("Evan"); return bi!==-1&&ei!==-1&&bi<ei; } },
    ],
  },
  {
    title: "Executive Boardroom",
    people: ["Leo","Maya","Noah","Olivia","Paul"],
    correctOrder: ["Noah","Maya","Leo","Paul","Olivia"],
    clues: [
      { text: "Leo sits in the exact middle seat (Chair 3).", check: a => a[2]==="Leo" },
      { text: "Noah sits at the extreme left (Chair 1).", check: a => a[0]==="Noah" },
      { text: "Maya sits between Noah and Leo (Chair 2).", check: a => a[1]==="Maya" },
      { text: "Olivia sits at the extreme right end (Chair 5).", check: a => a[4]==="Olivia" },
    ],
  },
  {
    title: "Dinner Party Order",
    people: ["Emma","Jack","Liam","Sophia","Zoe"],
    correctOrder: ["Jack","Zoe","Emma","Sophia","Liam"],
    clues: [
      { text: "Emma sits in the center seat (Chair 3).", check: a => a[2]==="Emma" },
      { text: "Liam is on the far right end (Chair 5).", check: a => a[4]==="Liam" },
      { text: "Jack is seated to the immediate left of Zoe.", check: a => { const ji=a.indexOf("Jack"),zi=a.indexOf("Zoe"); return ji!==-1&&zi!==-1&&ji+1===zi; } },
      { text: "Sophia sits between Emma and Liam (Chair 4).", check: a => a[3]==="Sophia" },
    ],
  },
  {
    title: "Library Reading Corner",
    people: ["Amy","Ben","Cara","Dan","Eve"],
    correctOrder: ["Amy","Cara","Ben","Eve","Dan"],
    clues: [
      { text: "Amy sits first on the left (Chair 1).", check: a => a[0]==="Amy" },
      { text: "Dan sits at the far right (Chair 5).", check: a => a[4]==="Dan" },
      { text: "Ben is between Cara and Eve (Chair 3).", check: a => a[2]==="Ben" },
      { text: "Cara sits in Chair 2.", check: a => a[1]==="Cara" },
    ],
  },
  {
    title: "Science Lab Bench",
    people: ["Finn","Gina","Hugo","Iris","Jay"],
    correctOrder: ["Gina","Finn","Hugo","Jay","Iris"],
    clues: [
      { text: "Iris sits at the far right end (Chair 5).", check: a => a[4]==="Iris" },
      { text: "Hugo sits in Chair 3 (middle).", check: a => a[2]==="Hugo" },
      { text: "Finn sits immediately to the right of Gina.", check: a => { const fi=a.indexOf("Finn"),gi=a.indexOf("Gina"); return fi!==-1&&gi!==-1&&gi+1===fi; } },
      { text: "Jay is to the left of Iris.", check: a => { const ji=a.indexOf("Jay"),ii=a.indexOf("Iris"); return ji!==-1&&ii!==-1&&ji<ii; } },
    ],
  },
  {
    title: "Cinema Row Seating",
    people: ["Kate","Leo","Mia","Nick","Ora"],
    correctOrder: ["Leo","Mia","Kate","Ora","Nick"],
    clues: [
      { text: "Nick sits at the extreme right (Chair 5).", check: a => a[4]==="Nick" },
      { text: "Kate sits in the middle (Chair 3).", check: a => a[2]==="Kate" },
      { text: "Leo sits immediately to the left of Mia.", check: a => { const li=a.indexOf("Leo"),mi=a.indexOf("Mia"); return li!==-1&&mi!==-1&&li+1===mi; } },
      { text: "Ora is to the left of Nick.", check: a => { const oi=a.indexOf("Ora"),ni=a.indexOf("Nick"); return oi!==-1&&ni!==-1&&oi<ni; } },
    ],
  },
];

const TOTAL_PUZZLES = 6;

export default function SeatingShuffle({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState("ready");
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [slots, setSlots] = useState([null,null,null,null,null]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [shake, setShake] = useState(false);
  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const current = SEATING_PUZZLES[puzzleIdx % SEATING_PUZZLES.length];
  const availablePeople = current.people.filter(p => !slots.includes(p));

  const startGame = () => {
    setPuzzleIdx(0);
    setSlots([null,null,null,null,null]);
    setSelectedPerson(null);
    setScore(0);
    setSolved(0);
    setIsSolved(false);
    setShake(false);
    setGameState("playing");
  };

  const handleBenchClick = (person) => {
    sound.playPop();
    // Toggle off if already selected; otherwise select this person
    setSelectedPerson(prev => prev === person ? null : person);
  };

  const handleSeatClick = (seatIdx) => {
    sound.playPop();
    if (selectedPerson) {
      // Place selectedPerson into this seat; if seat was occupied, evict that person back to bench (becomes new selectedPerson)
      const next = [...slots];
      const displaced = next[seatIdx];
      next[seatIdx] = selectedPerson;
      setSlots(next);
      setSelectedPerson(displaced || null);
    } else if (slots[seatIdx]) {
      // Pick up from seat
      const person = slots[seatIdx];
      const next = [...slots];
      next[seatIdx] = null;
      setSlots(next);
      setSelectedPerson(person);
    }
  };

  const handleCheckArrangement = () => {
    const allFilled = slots.every(s => s !== null);
    if (!allFilled) { sound.playWrong(); setShake(true); setTimeout(() => setShake(false), 300); return; }
    const allCluesPass = current.clues.every(clue => clue.check(slots));
    if (allCluesPass) {
      sound.playCorrect();
      setIsSolved(true);
      const pts = 250, ns = score + pts;
      setScore(ns); setLastPts(pts); setScoreTrigger(t => t + 1); setSolved(s => s + 1);
      if (onSaveScore) onSaveScore("seatingShuffle", ns);
    } else { sound.playWrong(); setShake(true); setTimeout(() => setShake(false), 300); }
  };

  const handleNextPuzzle = () => {
    const next = puzzleIdx + 1;
    if (next >= TOTAL_PUZZLES) {
      setGameState("gameover");
      if (solved + 1 >= 5) sound.playStreak(); else sound.playCorrect();
    } else {
      setPuzzleIdx(next);
      setSlots([null,null,null,null,null]);
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
          <div className="mode-badge-pop" style={{ background:"var(--mint-soft)", color:"var(--mint)" }}>Logic Puzzle · 6 Arrangements</div>
          <h2>Seating Shuffle 🪑</h2>
          <p className="ready-desc">Read the clues carefully and arrange 5 people across 5 chairs in the correct order. All clues must be satisfied!</p>
          <div className="rules-grid">
            <div className="rule-item">🪑 5 chairs, 5 people per puzzle</div>
            <div className="rule-item">💡 4 logical clues per arrangement</div>
            <div className="rule-item">⭐ 250 pts per solved arrangement</div>
            <div className="rule-item">🏆 6 unique puzzles total</div>
          </div>
          <button className="btn-start-mini" style={{ background:"var(--mint)" }} onClick={startGame}><span>Begin Arrangements</span> →</button>
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
            <p>Arrange 5 people in the 5 chairs according to the logical clues!</p>
          </div>

          {selectedPerson && (
            <div className="seating-held-banner">
              👤 Holding: <strong>{selectedPerson}</strong> — click a chair to place, or click another person to swap
            </div>
          )}

          <div className={`chairs-row-wrapper ${shake ? "shake-fx" : ""}`}>
            <div className="chairs-row">
              {slots.map((person, i) => (
                <div
                  key={i}
                  className={`chair-slot ${person ? "chair-occupied" : "chair-empty"} ${selectedPerson ? "chair-target-hint" : ""}`}
                  onClick={() => handleSeatClick(i)}
                >
                  <div className="chair-num">Chair {i+1}</div>
                  <div className="chair-seat-icon">🪑</div>
                  <div className="chair-occupant">{person || <span className="empty-dash">—</span>}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="people-bench-section">
            <div className="bench-lbl">
              {selectedPerson ? `Holding: ${selectedPerson} — click a chair to place` : "Click a person to pick up, then click a chair:"}
            </div>
            <div className="people-pills-row">
              {availablePeople.map(person => (
                <button
                  key={person}
                  className={`btn-person-pill ${selectedPerson === person ? "person-selected" : ""}`}
                  onClick={() => handleBenchClick(person)}
                >
                  👤 {person}
                </button>
              ))}
              {availablePeople.length === 0 && (
                <span style={{ color:"var(--muted)", fontSize:"0.85rem" }}>All placed — click a chair to move someone</span>
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

          {!isSolved ? (
            <button className="btn-verify-seating" onClick={handleCheckArrangement}>Verify Seating Arrangement ➔</button>
          ) : (
            <button className="btn-next-seating animate-pop" onClick={handleNextPuzzle}>
              {puzzleIdx + 1 < TOTAL_PUZZLES ? "Next Puzzle →" : "See Final Score →"}
            </button>
          )}
          {isSolved && <Confetti />}
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === "gameover" && (
        <div className="mini-card gameover-modal">
          {solved >= 5 && <Confetti />}
          <div className="gameover-icon">🪑</div>
          <h2>{solved >= 5 ? "Seating Maestro!" : solved >= 3 ? "Logical Arranger!" : "Keep Practicing!"}</h2>
          <p className="ready-desc">{solved >= 5 ? "Outstanding! You arranged every group flawlessly." : solved >= 3 ? "Great logical thinking across the puzzles!" : "Logic puzzles take practice — try again!"}</p>
          <div className="results-metrics">
            <div className="metric-box"><span className="m-val">{score}</span><span className="m-lbl">Score</span></div>
            <div className="metric-box"><span className="m-val">{solved} / {TOTAL_PUZZLES}</span><span className="m-lbl">Solved</span></div>
          </div>
          <div className="modal-actions">
            <button className="btn-play-again" style={{ background:"var(--mint)" }} onClick={startGame}>Try Again ↺</button>
            <button className="btn-hub" onClick={onBack}>Arcade Hub</button>
          </div>
        </div>
      )}
    </div>
  );
}
