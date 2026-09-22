import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

// Mirror types:
// '/' (slash): (dx: 1, dy: 0) -> (0, -1) [UP], (dx: -1, dy: 0) -> (0, 1) [DOWN], (dx: 0, dy: 1) -> (-1, 0) [LEFT], (dx: 0, dy: -1) -> (1, 0) [RIGHT]
// '\' (backslash): (dx: 1, dy: 0) -> (0, 1) [DOWN], (dx: -1, dy: 0) -> (0, -1) [UP], (dx: 0, dy: 1) -> (1, 0) [RIGHT], (dx: 0, dy: -1) -> (-1, 0) [LEFT]

const LEVELS = [
  {
    id: 1,
    title: 'First Reflection',
    difficulty: 'Easy',
    par: 1,
    emitter: { r: 1, c: 0, dir: { dr: 0, dc: 1 } },
    targets: [{ r: 4, c: 2, id: 't1' }],
    initialGrid: {
      '1,2': { type: 'mirror', angle: '/' },
    },
    fixedTiles: {},
    hint: 'Tap the mirror at (Row 2, Col 3) to angle the laser down into the crystal!',
  },
  {
    id: 2,
    title: 'Zig-Zag Path',
    difficulty: 'Easy',
    par: 2,
    emitter: { r: 0, c: 1, dir: { dr: 1, dc: 0 } },
    targets: [{ r: 4, c: 4, id: 't1' }],
    initialGrid: {
      '2,1': { type: 'mirror', angle: '/' },
      '2,4': { type: 'mirror', angle: '/' },
    },
    fixedTiles: {
      '3,2': { type: 'wall' },
    },
    hint: 'Bounce the beam right at row 3, then down at column 5.',
  },
  {
    id: 3,
    title: 'Dual Crystals',
    difficulty: 'Medium',
    par: 2,
    emitter: { r: 2, c: 0, dir: { dr: 0, dc: 1 } },
    targets: [
      { r: 0, c: 3, id: 't1' },
      { r: 4, c: 3, id: 't2' },
    ],
    initialGrid: {
      '2,3': { type: 'splitter', angle: '/' },
      '2,5': { type: 'mirror', angle: '\\' },
    },
    fixedTiles: {
      '1,1': { type: 'wall' },
      '3,1': { type: 'wall' },
    },
    hint: 'A beam splitter allows light to both pass straight and bend!',
  },
  {
    id: 4,
    title: 'The Cyber Labyrinth',
    difficulty: 'Medium',
    par: 3,
    emitter: { r: 5, c: 1, dir: { dr: -1, dc: 0 } },
    targets: [{ r: 1, c: 4, id: 't1' }],
    initialGrid: {
      '3,1': { type: 'mirror', angle: '/' },
      '3,3': { type: 'mirror', angle: '\\' },
      '1,3': { type: 'mirror', angle: '/' },
    },
    fixedTiles: {
      '4,1': { type: 'wall' },
      '2,3': { type: 'wall' },
    },
    hint: 'Navigate around cyber security firewalls using a U-turn trajectory.',
  },
  {
    id: 5,
    title: 'Perimeter Loop',
    difficulty: 'Medium',
    par: 4,
    emitter: { r: 0, c: 0, dir: { dr: 0, dc: 1 } },
    targets: [{ r: 5, c: 0, id: 't1' }],
    initialGrid: {
      '0,4': { type: 'mirror', angle: '/' },
      '4,4': { type: 'mirror', angle: '\\' },
      '4,0': { type: 'mirror', angle: '/' },
      '2,2': { type: 'mirror', angle: '\\' },
    },
    fixedTiles: {
      '2,0': { type: 'wall' },
      '2,4': { type: 'wall' },
      '1,2': { type: 'wall' },
    },
    hint: 'Loop the laser around the outside perimeter wall.',
  },
  {
    id: 6,
    title: 'Three Matrix Nodes',
    difficulty: 'Hard',
    par: 3,
    emitter: { r: 1, c: 0, dir: { dr: 0, dc: 1 } },
    targets: [
      { r: 1, c: 5, id: 't1' },
      { r: 4, c: 2, id: 't2' },
      { r: 4, c: 4, id: 't3' },
    ],
    initialGrid: {
      '1,2': { type: 'splitter', angle: '\\' },
      '1,4': { type: 'splitter', angle: '\\' },
      '3,2': { type: 'mirror', angle: '/' },
    },
    fixedTiles: {
      '2,3': { type: 'wall' },
    },
    hint: 'Split the beam at column 3 and column 5 to ignite all three targets simultaneously!',
  },
  {
    id: 7,
    title: 'Symmetry Lock',
    difficulty: 'Hard',
    par: 4,
    emitter: { r: 2, c: 0, dir: { dr: 0, dc: 1 } },
    targets: [
      { r: 0, c: 5, id: 't1' },
      { r: 5, c: 5, id: 't2' },
    ],
    initialGrid: {
      '2,2': { type: 'splitter', angle: '/' },
      '0,2': { type: 'mirror', angle: '\\' },
      '4,2': { type: 'mirror', angle: '/' },
      '4,5': { type: 'mirror', angle: '\\' },
    },
    fixedTiles: {
      '1,4': { type: 'wall' },
      '3,4': { type: 'wall' },
    },
    hint: 'Distribute power symmetrically north and south.',
  },
  {
    id: 8,
    title: 'Prism Overload',
    difficulty: 'Expert',
    par: 5,
    emitter: { r: 5, c: 2, dir: { dr: -1, dc: 0 } },
    targets: [
      { r: 0, c: 2, id: 't1' },
      { r: 2, c: 5, id: 't2' },
      { r: 4, c: 0, id: 't3' },
    ],
    initialGrid: {
      '3,2': { type: 'splitter', angle: '/' },
      '3,0': { type: 'mirror', angle: '\\' },
      '1,2': { type: 'splitter', angle: '\\' },
      '1,5': { type: 'mirror', angle: '/' },
      '4,5': { type: 'mirror', angle: '\\' },
    },
    fixedTiles: {
      '2,1': { type: 'wall' },
      '2,3': { type: 'wall' },
    },
    hint: 'Every splitter feeds light in two directions. Chain multiple splits to reach all corners.',
  },
  {
    id: 9,
    title: 'Laser Vault',
    difficulty: 'Expert',
    par: 5,
    emitter: { r: 0, c: 1, dir: { dr: 1, dc: 0 } },
    targets: [
      { r: 3, c: 3, id: 't1' },
      { r: 5, c: 5, id: 't2' },
    ],
    initialGrid: {
      '2,1': { type: 'mirror', angle: '/' },
      '2,4': { type: 'mirror', angle: '\\' },
      '4,4': { type: 'splitter', angle: '/' },
      '4,3': { type: 'mirror', angle: '\\' },
      '5,3': { type: 'mirror', angle: '/' },
    },
    fixedTiles: {
      '1,2': { type: 'wall' },
      '3,2': { type: 'wall' },
      '4,2': { type: 'wall' },
    },
    hint: 'Direct light through the inner sanctum corridor.',
  },
  {
    id: 10,
    title: 'Quantum Singularity',
    difficulty: 'Mastermind',
    par: 6,
    emitter: { r: 0, c: 0, dir: { dr: 0, dc: 1 } },
    targets: [
      { r: 0, c: 5, id: 't1' },
      { r: 5, c: 0, id: 't2' },
      { r: 5, c: 5, id: 't3' },
    ],
    initialGrid: {
      '0,2': { type: 'splitter', angle: '/' },
      '2,2': { type: 'splitter', angle: '\\' },
      '2,0': { type: 'mirror', angle: '/' },
      '4,0': { type: 'mirror', angle: '\\' },
      '4,5': { type: 'mirror', angle: '/' },
      '2,5': { type: 'mirror', angle: '\\' },
    },
    fixedTiles: {
      '1,1': { type: 'wall' },
      '3,3': { type: 'wall' },
      '4,2': { type: 'wall' },
    },
    hint: 'Triangulate the entire 6x6 cyber mainframe grid!',
  },
];

const GRID_SIZE = 6;

export default function LaserPrism({ sound, onBack, onSaveScore }) {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [gridState, setGridState] = useState({});
  const [moveCount, setMoveCount] = useState(0);
  const [moveHistory, setMoveHistory] = useState([]);
  const [isLevelSolved, setIsLevelSolved] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [starsMap, setStarsMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('laserprism_stars') || '{}');
    } catch {
      return {};
    }
  });

  const [totalScore, setTotalScore] = useState(0);
  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const level = LEVELS[currentLevelIdx];

  // Initialize level
  const initLevel = useCallback((lvlIdx) => {
    const lvl = LEVELS[lvlIdx];
    const initial = {};
    Object.keys(lvl.initialGrid).forEach((k) => {
      initial[k] = { ...lvl.initialGrid[k] };
    });
    setGridState(initial);
    setMoveCount(0);
    setMoveHistory([]);
    setIsLevelSolved(false);
    setShowHint(false);
  }, []);

  useEffect(() => {
    initLevel(currentLevelIdx);
  }, [currentLevelIdx, initLevel]);

  // Ray-tracing engine
  const { laserSegments, litTargetIds } = useMemo(() => {
    const segments = [];
    const litTargets = new Set();
    const visitedRayState = new Set();

    // Queue of rays: { r, c, dr, dc }
    // Start ray at emitter position
    const startRay = {
      r: level.emitter.r,
      c: level.emitter.c,
      dr: level.emitter.dir.dr,
      dc: level.emitter.dir.dc,
    };

    const rayQueue = [startRay];

    while (rayQueue.length > 0) {
      const ray = rayQueue.shift();
      let currR = ray.r;
      let currC = ray.c;
      let currDr = ray.dr;
      let currDc = ray.dc;

      // Trace line step by step
      let steps = 0;
      while (steps < 40) {
        steps++;
        const nextR = currR + currDr;
        const nextC = currC + currDc;

        // Check if next step is outside grid bounds
        if (nextR < 0 || nextR >= GRID_SIZE || nextC < 0 || nextC >= GRID_SIZE) {
          // Ray leaves grid
          segments.push({
            r1: currR,
            c1: currC,
            r2: nextR,
            c2: nextC,
            clipped: true,
          });
          break;
        }

        const tileKey = `${nextR},${nextC}`;
        const fixed = level.fixedTiles[tileKey];
        const dynamic = gridState[tileKey];

        // Segment from curr to next center
        segments.push({
          r1: currR,
          c1: currC,
          r2: nextR,
          c2: nextC,
          clipped: false,
        });

        // Check target crystal hit
        level.targets.forEach((t) => {
          if (t.r === nextR && t.c === nextC) {
            litTargets.add(t.id);
          }
        });

        // Check wall collision
        if (fixed && fixed.type === 'wall') {
          // Beam stops on wall
          break;
        }

        // Check interactive mirror or splitter
        if (dynamic) {
          const raySig = `${nextR},${nextC},${currDr},${currDc}`;
          if (visitedRayState.has(raySig)) {
            // Cycle detected
            break;
          }
          visitedRayState.add(raySig);

          const { type, angle } = dynamic;

          if (type === 'mirror') {
            let nextDr = 0;
            let nextDc = 0;

            if (angle === '/') {
              nextDr = -currDc;
              nextDc = -currDr;
            } else if (angle === '\\') {
              nextDr = currDc;
              nextDc = currDr;
            }

            currR = nextR;
            currC = nextC;
            currDr = nextDr;
            currDc = nextDc;
            continue;
          } else if (type === 'splitter') {
            // Splitter: 1 branch reflects, 1 branch continues straight
            let reflectDr = 0;
            let reflectDc = 0;

            if (angle === '/') {
              reflectDr = -currDc;
              reflectDc = -currDr;
            } else {
              reflectDr = currDc;
              reflectDc = currDr;
            }

            // Spawn reflected branch into queue
            rayQueue.push({
              r: nextR,
              c: nextC,
              dr: reflectDr,
              dc: reflectDc,
            });

            // Continue straight
            currR = nextR;
            currC = nextC;
            continue;
          }
        }

        // Empty tile or target: beam keeps traveling
        currR = nextR;
        currC = nextC;
      }
    }

    return { laserSegments: segments, litTargetIds: litTargets };
  }, [level, gridState]);

  // Check victory condition
  useEffect(() => {
    if (isLevelSolved) return;

    const allLit = level.targets.every((t) => litTargetIds.has(t.id));
    if (allLit) {
      setIsLevelSolved(true);
      sound.playCorrect();

      // Calculate star rating & score
      const diff = Math.max(0, moveCount - level.par);
      const earnedStars = diff === 0 ? 3 : diff <= 2 ? 2 : 1;
      const pts = earnedStars === 3 ? 300 : earnedStars === 2 ? 200 : 120;

      setLastPts(pts);
      setScoreTrigger((t) => t + 1);
      setTotalScore((s) => s + pts);

      const newStars = { ...starsMap, [level.id]: Math.max(starsMap[level.id] || 0, earnedStars) };
      setStarsMap(newStars);
      localStorage.setItem('laserprism_stars', JSON.stringify(newStars));

      if (onSaveScore) {
        onSaveScore('laserPrism', totalScore + pts);
      }
    }
  }, [litTargetIds, level, isLevelSolved, moveCount, sound, onSaveScore, totalScore, starsMap]);

  // Rotate tile on click
  const handleTileClick = (r, c) => {
    if (isLevelSolved) return;
    const tileKey = `${r},${c}`;
    const tile = gridState[tileKey];
    if (!tile) return; // not an interactive tile

    sound.playPop();

    setMoveHistory((prev) => [...prev, { ...gridState }]);
    setMoveCount((m) => m + 1);

    const nextAngle = tile.angle === '/' ? '\\' : '/';
    setGridState((prev) => ({
      ...prev,
      [tileKey]: {
        ...tile,
        angle: nextAngle,
      },
    }));
  };

  const handleUndo = () => {
    if (moveHistory.length === 0 || isLevelSolved) return;
    const prevGrid = moveHistory[moveHistory.length - 1];
    setGridState(prevGrid);
    setMoveHistory((prev) => prev.slice(0, -1));
    setMoveCount((m) => Math.max(0, m - 1));
    sound.playPop();
  };

  const handleReset = () => {
    initLevel(currentLevelIdx);
    sound.playPop();
  };

  const handleNextLevel = () => {
    if (currentLevelIdx < LEVELS.length - 1) {
      setCurrentLevelIdx((i) => i + 1);
    } else {
      setShowLevelSelect(true);
    }
  };

  // Convert row, col to percentage coordinates for SVG
  const cellCoord = (r, c) => {
    const cellSize = 100 / GRID_SIZE;
    return {
      x: (c + 0.5) * cellSize,
      y: (r + 0.5) * cellSize,
    };
  };

  return (
    <div className="screen mini-game-screen laser-prism-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Top Navigation */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">⚡ Laser Prism</div>
        <div className="laser-level-badge" onClick={() => setShowLevelSelect(true)}>
          Level {level.id}/{LEVELS.length} ▾
        </div>
      </div>

      <div className="laser-main-container">
        {/* Top Game Controls & HUD */}
        <div className="laser-hud-row">
          <div className="laser-hud-box">
            <span className="lbl">Moves</span>
            <span className="val">{moveCount} <small>/ Par {level.par}</small></span>
          </div>

          <div className="laser-hud-box">
            <span className="lbl">Crystals Lit</span>
            <span className="val highlight">
              {litTargetIds.size} / {level.targets.length} 💎
            </span>
          </div>

          <div className="laser-hud-box">
            <span className="lbl">Score</span>
            <span className="val">{totalScore}</span>
          </div>
        </div>

        {/* Level Title & Subtext */}
        <div className="laser-stage-info">
          <div className="stage-title-wrap">
            <h3 className="stage-title">{level.title}</h3>
            <span className="stage-diff-pill">{level.difficulty}</span>
          </div>
          <p className="stage-instruction">
            Tap optical mirrors &amp; splitters to align the laser beam with all energy crystals!
          </p>
        </div>

        {/* The 6x6 Cyber Laser Board */}
        <div className="laser-board-wrapper">
          <div className="laser-grid-board">
            {/* SVG Laser Path Overlay */}
            <svg className="laser-svg-canvas" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Laser Beam Segments */}
              {laserSegments.map((seg, idx) => {
                const p1 = cellCoord(seg.r1, seg.c1);
                const p2 = cellCoord(seg.r2, seg.c2);
                return (
                  <g key={`seg-${idx}`}>
                    {/* Outer Glow */}
                    <line
                      x1={`${p1.x}%`}
                      y1={`${p1.y}%`}
                      x2={`${p2.x}%`}
                      y2={`${p2.y}%`}
                      stroke="var(--coral)"
                      strokeWidth="2.8"
                      strokeOpacity="0.45"
                      strokeLinecap="round"
                    />
                    {/* Core Laser Beam */}
                    <line
                      x1={`${p1.x}%`}
                      y1={`${p1.y}%`}
                      x2={`${p2.x}%`}
                      y2={`${p2.y}%`}
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      filter="url(#laser-glow)"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Grid Cells */}
            {Array.from({ length: GRID_SIZE }).map((_, r) =>
              Array.from({ length: GRID_SIZE }).map((_, c) => {
                const key = `${r},${c}`;
                const isEmitter = level.emitter.r === r && level.emitter.c === c;
                const target = level.targets.find((t) => t.r === r && t.c === c);
                const isLit = target && litTargetIds.has(target.id);
                const wall = level.fixedTiles[key];
                const dynamic = gridState[key];

                return (
                  <div
                    key={key}
                    className={`laser-cell ${dynamic ? 'clickable-cell' : ''} ${wall ? 'wall-cell' : ''}`}
                    onClick={() => handleTileClick(r, c)}
                    role={dynamic ? 'button' : undefined}
                    tabIndex={dynamic ? 0 : undefined}
                  >
                    {/* Emitter */}
                    {isEmitter && (
                      <div className="cell-emitter" title="Laser Emitter">
                        <div className="emitter-pulse" />
                        <span className="emitter-icon">⚡</span>
                      </div>
                    )}

                    {/* Target Crystal */}
                    {target && (
                      <div className={`cell-target ${isLit ? 'target-lit' : ''}`}>
                        <div className="target-crystal-core" />
                        <span className="target-icon">💎</span>
                      </div>
                    )}

                    {/* Cyber Wall Blocker */}
                    {wall && wall.type === 'wall' && (
                      <div className="cell-wall">
                        <div className="wall-hatch" />
                      </div>
                    )}

                    {/* Mirror */}
                    {dynamic && dynamic.type === 'mirror' && (
                      <div className={`cell-mirror mirror-${dynamic.angle === '/' ? 'slash' : 'backslash'}`}>
                        <div className="mirror-glass" />
                        <div className="mirror-frame" />
                        <span className="mirror-turn-hint">↻</span>
                      </div>
                    )}

                    {/* Beam Splitter */}
                    {dynamic && dynamic.type === 'splitter' && (
                      <div className={`cell-splitter splitter-${dynamic.angle === '/' ? 'slash' : 'backslash'}`}>
                        <div className="splitter-prism" />
                        <span className="splitter-label">½</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="laser-toolbar">
          <button className="btn-laser-tool" onClick={handleUndo} disabled={moveHistory.length === 0 || isLevelSolved}>
            <span>↩</span> Undo
          </button>
          <button className="btn-laser-tool" onClick={handleReset} disabled={isLevelSolved}>
            <span>↺</span> Reset
          </button>
          <button className="btn-laser-tool" onClick={() => setShowHint((h) => !h)}>
            <span>💡</span> Hint
          </button>
          <button className="btn-laser-tool" onClick={() => setShowLevelSelect(true)}>
            <span>🗺️</span> Levels
          </button>
        </div>

        {/* Hint Box */}
        {showHint && (
          <div className="laser-hint-card animate-pop">
            <strong>Hint:</strong> {level.hint}
          </div>
        )}
      </div>

      {/* Level Complete Modal */}
      {isLevelSolved && (
        <div className="laser-modal-backdrop">
          <Confetti />
          <div className="mini-card victory-modal animate-pop">
            <div className="victory-icon">⚡💎⚡</div>
            <h2>Matrix Synchronized!</h2>
            <p className="victory-sub">All quantum energy crystals illuminated.</p>

            <div className="victory-stars">
              {[1, 2, 3].map((star) => {
                const earned = starsMap[level.id] || 3;
                return (
                  <span key={star} className={`v-star ${star <= earned ? 'active' : ''}`}>
                    ★
                  </span>
                );
              })}
            </div>

            <div className="results-metrics">
              <div className="metric-box">
                <span className="m-val">{moveCount}</span>
                <span className="m-lbl">Moves Taken (Par: {level.par})</span>
              </div>
              <div className="metric-box">
                <span className="m-val">+{lastPts}</span>
                <span className="m-lbl">Points Awarded</span>
              </div>
            </div>

            <div className="modal-actions">
              {currentLevelIdx < LEVELS.length - 1 ? (
                <button className="btn-play-again" style={{ background: 'var(--coral)' }} onClick={handleNextLevel}>
                  Next Level →
                </button>
              ) : (
                <button className="btn-play-again" style={{ background: 'var(--mint)' }} onClick={() => setShowLevelSelect(true)}>
                  All Levels Mastered! 🏆
                </button>
              )}
              <button className="btn-hub" onClick={onBack}>
                Arcade Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Selector Drawer/Modal */}
      {showLevelSelect && (
        <div className="laser-modal-backdrop" onClick={() => setShowLevelSelect(false)}>
          <div className="mini-card level-select-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Select Optical Sector</h3>
              <button className="btn-close-modal" onClick={() => setShowLevelSelect(false)}>✕</button>
            </div>
            <div className="levels-select-grid">
              {LEVELS.map((lvl, idx) => {
                const stars = starsMap[lvl.id] || 0;
                const isCurrent = idx === currentLevelIdx;
                return (
                  <button
                    key={lvl.id}
                    className={`level-pill-card ${isCurrent ? 'current' : ''} ${stars > 0 ? 'completed' : ''}`}
                    onClick={() => {
                      setCurrentLevelIdx(idx);
                      setShowLevelSelect(false);
                    }}
                  >
                    <div className="l-num">{lvl.id}</div>
                    <div className="l-title">{lvl.title}</div>
                    <div className="l-stars">
                      {stars > 0 ? '★'.repeat(stars) : '☆☆☆'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
