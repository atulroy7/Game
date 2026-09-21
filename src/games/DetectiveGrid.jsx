import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';
import { TrophyIcon, ArrowRightIcon } from '../components/Icons';

// Suspect database
const SUSPECT_NAMES = [
  'Agent Fox', 'Viper', 'Cipher', 'Shadow', 'Baron Raven',
  'Ghost', 'Echo', 'Titan', 'Dr. Blaze', 'Lynx',
  'Frost', 'Oracle', 'Cobalt', 'Phoenix', 'Mirage', 'Siren'
];

const SECTORS = [
  { id: 'downtown', name: 'Downtown', color: 'var(--coral)', soft: 'var(--coral-soft)' },
  { id: 'waterfront', name: 'Docks', color: 'var(--amber)', soft: 'var(--amber-soft)' },
  { id: 'heights', name: 'Heights', color: 'var(--mint)', soft: 'var(--mint-soft)' },
];

const TRAITS = [
  { id: 'hat', label: 'Fedora Hat' },
  { id: 'glasses', label: 'Dark Glasses' },
  { id: 'trenchcoat', label: 'Trenchcoat' },
];

// Generate a random 3x3 case grid
function generateCase() {
  const shuffledNames = [...SUSPECT_NAMES].sort(() => 0.5 - Math.random()).slice(0, 9);
  
  const grid = [];
  let nameIdx = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const sector = SECTORS[(r + c) % SECTORS.length];
      const trait = TRAITS[(r * 2 + c) % TRAITS.length];
      grid.push({
        id: `suspect-${r}-${c}`,
        row: r, // 0: Top, 1: Mid, 2: Low
        col: c, // 0: Left, 1: Center, 2: Right
        name: shuffledNames[nameIdx++],
        sector: sector.id,
        sectorName: sector.name,
        sectorColor: sector.color,
        sectorSoft: sector.soft,
        trait: trait.id,
        traitLabel: trait.label,
      });
    }
  }

  // Pick culprit
  const culprit = grid[Math.floor(Math.random() * grid.length)];

  // Generate 3 non-contradictory clues that uniquely or nearly uniquely point to the culprit
  const clues = [];

  // Clue 1: Sector clue (eliminate 1 sector that culprit is NOT in, or state culprit sector)
  const nonCulpritSector = SECTORS.find(s => s.id !== culprit.sector);
  if (Math.random() > 0.5) {
    clues.push({
      text: `Witness confirmed culprit is NOT in the ${nonCulpritSector.name} sector.`,
      filter: s => s.sector !== nonCulpritSector.id
    });
  } else {
    clues.push({
      text: `CCTV cameras tracked culprit entering the ${culprit.sectorName} sector.`,
      filter: s => s.sector === culprit.sector
    });
  }

  // Clue 2: Trait clue
  const nonCulpritTrait = TRAITS.find(t => t.id !== culprit.trait);
  if (Math.random() > 0.5) {
    clues.push({
      text: `Forensic report: Culprit was wearing a ${culprit.traitLabel}.`,
      filter: s => s.trait === culprit.trait
    });
  } else {
    clues.push({
      text: `Informant: Suspect was NOT wearing a ${nonCulpritTrait.label}.`,
      filter: s => s.trait !== nonCulpritTrait.id
    });
  }

  // Clue 3: Positional wiretap clue
  const rowNames = ['Northern (Top)', 'Central (Mid)', 'Southern (Bottom)'];
  const colNames = ['West (Left)', 'Central (Mid)', 'East (Right)'];
  if (Math.random() > 0.5) {
    const wrongRow = (culprit.row + 1) % 3;
    clues.push({
      text: `Wiretap: Signal did NOT originate in the ${rowNames[wrongRow]} row.`,
      filter: s => s.row !== wrongRow
    });
  } else {
    const wrongCol = (culprit.col + 1) % 3;
    clues.push({
      text: `Cell tower ping: Culprit is NOT in the ${colNames[wrongCol]} column.`,
      filter: s => s.col !== wrongCol
    });
  }

  return { grid, culprit, clues };
}

export default function DetectiveGrid({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [timeLeft, setTimeLeft] = useState(50);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [casesSolved, setCasesSolved] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const [currentCase, setCurrentCase] = useState(null);
  const [ruledOutIds, setRuledOutIds] = useState([]);
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [caseAlert, setCaseAlert] = useState('');
  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const timeLeftRef = useRef(50);

  // Load new case
  const loadNextCase = useCallback(() => {
    const newCase = generateCase();
    setCurrentCase(newCase);
    setRuledOutIds([]);
    setSelectedSuspect(null);
    setCaseAlert('');
  }, []);

  // Start game session
  const startGame = () => {
    scoreRef.current = 0;
    streakRef.current = 0;
    timeLeftRef.current = 50;
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCasesSolved(0);
    setTimeLeft(50);
    setGameState('playing');
    loadNextCase();
  };

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState('gameover');
    sound.playTimeout();
    if (onSaveScore) onSaveScore('detectiveGrid', scoreRef.current);
  }, [sound, onSaveScore]);

  // Safe timer loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      const next = timeLeftRef.current - 1;
      if (next <= 0) {
        timeLeftRef.current = 0;
        setTimeLeft(0);
        endGame();
      } else {
        timeLeftRef.current = next;
        setTimeLeft(next);
        if (next <= 5) sound.playTick();
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState, endGame, sound]);

  // Toggle ruling out a suspect
  const handleToggleRuleOut = (e, suspectId) => {
    e.stopPropagation();
    sound.playFlip();
    setRuledOutIds(prev => 
      prev.includes(suspectId) ? prev.filter(id => id !== suspectId) : [...prev, suspectId]
    );
  };

  // Select suspect to apprehend
  const handleSelectSuspect = (suspect) => {
    sound.playFlip();
    setSelectedSuspect(suspect);
  };

  // Attempt arrest
  const handleArrest = () => {
    if (!selectedSuspect || !currentCase || gameState !== 'playing') return;

    if (selectedSuspect.id === currentCase.culprit.id) {
      // SUCCESS!
      sound.playMatch();
      streakRef.current += 1;
      const newStreak = streakRef.current;
      setStreak(newStreak);
      setBestStreak(b => Math.max(b, newStreak));
      setCasesSolved(c => c + 1);

      const pts = 250 + newStreak * 50;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setLastPts(pts);
      setScoreTrigger(t => t + 1);

      // +8s time bonus
      timeLeftRef.current = Math.min(timeLeftRef.current + 8, 60);
      setTimeLeft(timeLeftRef.current);

      setCaseAlert('CASE SOLVED! Prime suspect arrested.');
      setTimeout(() => {
        loadNextCase();
      }, 700);
    } else {
      // FALSE ARREST
      sound.playWrong();
      streakRef.current = 0;
      setStreak(0);

      // -8s time penalty
      timeLeftRef.current = Math.max(timeLeftRef.current - 8, 1);
      setTimeLeft(timeLeftRef.current);

      setCaseAlert(`WRONG SUSPECT! -8s penalty. ${selectedSuspect.name} has an alibi!`);
      // Auto rule out this innocent suspect
      setRuledOutIds(prev => [...new Set([...prev, selectedSuspect.id])]);
      setSelectedSuspect(null);
    }
  };

  return (
    <div className="screen mini-game-screen detective-grid-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />
      {caseAlert.includes('SOLVED') && <Confetti />}

      {/* Navigation Top Bar */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">Detective Grid</div>
        <div className="timer-pill">
          {timeLeft}s
        </div>
      </div>

      {gameState === 'ready' && (
        <div className="ready-screen-card animate-pop">
          <div className="ready-icon-badge" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>
          <h2>Detective Grid</h2>
          <p className="ready-subtitle">
            Inspect witness testimonies, CCTV intercepts, and cell pings to eliminate innocent suspects and apprehend the prime culprit before time expires!
          </p>

          <div className="ready-rules-list">
            <div className="rule-item">
              <span className="rule-dot" style={{ background: 'var(--coral)' }} />
              <span>Read the 3 case dossier clues carefully</span>
            </div>
            <div className="rule-item">
              <span className="rule-dot" style={{ background: 'var(--amber)' }} />
              <span>Click suspect cards to inspect or mark innocents</span>
            </div>
            <div className="rule-item">
              <span className="rule-dot" style={{ background: 'var(--mint)' }} />
              <span>Click Arrest to close the case for bonus time &amp; points</span>
            </div>
          </div>

          <button className="btn-start" onClick={startGame}>
            <span>Open Case File</span>
            <ArrowRightIcon size={16} />
          </button>
        </div>
      )}

      {gameState === 'playing' && currentCase && (
        <div className="detective-play-area">
          {/* HUD Strip */}
          <div className="hud-strip">
            <div className="hud-badge">
              <span className="lbl">Score</span>
              <span className="val">{score}</span>
            </div>
            <div className="hud-badge">
              <span className="lbl">Streak</span>
              <span className="val">{streak}</span>
            </div>
            <div className="hud-badge">
              <span className="lbl">Cases</span>
              <span className="val">{casesSolved}</span>
            </div>
          </div>

          {/* Case Dossier Clues Card */}
          <div className="case-dossier-card">
            <div className="dossier-header">
              <span className="dossier-tag">ACTIVE CASE #{casesSolved + 1}</span>
              <span className="dossier-sub">3 CONFIDENTIAL CLUES</span>
            </div>
            <div className="clues-list">
              {currentCase.clues.map((clue, idx) => (
                <div key={idx} className="clue-row">
                  <span className="clue-num">{idx + 1}</span>
                  <span className="clue-text">{clue.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Alert if any */}
          {caseAlert && (
            <div className={`case-alert-banner animate-pop ${caseAlert.includes('SOLVED') ? 'alert-success' : 'alert-error'}`}>
              {caseAlert}
            </div>
          )}

          {/* 3x3 Suspects Grid */}
          <div className="suspects-grid">
            {currentCase.grid.map((suspect) => {
              const isRuledOut = ruledOutIds.includes(suspect.id);
              const isSelected = selectedSuspect?.id === suspect.id;

              return (
                <div
                  key={suspect.id}
                  className={`suspect-card ${isRuledOut ? 'ruled-out' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectSuspect(suspect)}
                >
                  <div className="suspect-card-top">
                    <span className="sector-tag" style={{ background: suspect.sectorSoft, color: suspect.sectorColor }}>
                      {suspect.sectorName}
                    </span>
                    <button
                      className={`btn-ruleout ${isRuledOut ? 'active' : ''}`}
                      onClick={(e) => handleToggleRuleOut(e, suspect.id)}
                      title={isRuledOut ? 'Unmark Innocent' : 'Mark as Innocent'}
                    >
                      {isRuledOut ? 'Alibi' : 'Clear'}
                    </button>
                  </div>

                  <div className="suspect-avatar-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>

                  <div className="suspect-info">
                    <span className="suspect-name">{suspect.name}</span>
                    <span className="suspect-trait-badge">{suspect.traitLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Dock */}
          <div className="detective-action-dock">
            {selectedSuspect ? (
              <div className="dock-selected-wrap animate-pop">
                <div className="dock-suspect-desc">
                  Target: <strong>{selectedSuspect.name}</strong> ({selectedSuspect.sectorName} • {selectedSuspect.traitLabel})
                </div>
                <button className="btn-arrest-action" onClick={handleArrest}>
                  <span>Arrest Suspect</span>
                  <ArrowRightIcon size={14} />
                </button>
              </div>
            ) : (
              <div className="dock-placeholder">
                Select a suspect profile from the grid to review &amp; arrest
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="gameover-card animate-pop">
          <div className="gameover-title">Shift Over!</div>
          <p className="gameover-desc">Your investigation time ran out. Here are your final case records:</p>

          <div className="gameover-stats-grid">
            <div className="stat-pill">
              <span className="lbl">Final Score</span>
              <span className="val">{score}</span>
            </div>
            <div className="stat-pill">
              <span className="lbl">Cases Solved</span>
              <span className="val">{casesSolved}</span>
            </div>
            <div className="stat-pill">
              <span className="lbl">Best Streak</span>
              <span className="val">{bestStreak}</span>
            </div>
          </div>

          <div className="gameover-actions">
            <button className="btn-retry" onClick={startGame}>
              <span>New Investigation</span>
              <ArrowRightIcon size={14} />
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
