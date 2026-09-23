import React, { useState, useEffect, useRef, useMemo } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

export const THEMES = {
  cosmic: {
    id: 'cosmic',
    name: '🌌 Cosmic Odyssey',
    badge: 'Cosmic & Physics',
    desc: 'Warp through celestial bodies, thermodynamics, and high-energy physics!',
    startWord: 'AURORA',
    rounds: [
      {
        id: 'c-1',
        tail: 'AURORA',
        linkLetters: 'A',
        twistType: 'decoys',
        twistLabel: '🎯 Clue Decoy',
        twistDesc: 'All 4 options start with A — read carefully!',
        category: 'Solar System',
        question: 'Which rocky celestial body orbits between Mars and Jupiter?',
        options: ['ASTEROID', 'ASTRONAUT', 'ATMOSPHERE', 'APOLLO'],
        answer: 'ASTEROID',
        timeLimit: 12,
        fact: 'AURORA ends in A → ASTEROID orbits in the asteroid belt between Mars and Jupiter!'
      },
      {
        id: 'c-2',
        tail: 'ASTEROID',
        linkLetters: 'ID',
        twistType: 'double',
        twistLabel: '🔄 2-Letter Fusion',
        twistDesc: 'Must start with the last TWO letters (ID)!',
        category: 'Literature & Art',
        question: 'Which word means a brief, charming scene of peaceful rural life?',
        options: ['IDYLL', 'IDOL', 'IDENTITY', 'IDEAL'],
        answer: 'IDYLL',
        timeLimit: 12,
        fact: 'ASTEROID ends in ID → IDYLL starts with ID (a picturesque pastoral poem)!'
      },
      {
        id: 'c-3',
        tail: 'IDYLL',
        linkLetters: 'L',
        twistType: 'banned',
        bannedChar: 'O',
        twistLabel: "🚫 Curse: No letter 'O'",
        twistDesc: "Starts with L, but CANNOT contain the letter 'O'!",
        category: 'Optics & Physics',
        question: 'Which SI unit measures the total perceived power of visible light emitted?',
        options: ['LUMEN', 'LUMINOUS', 'LANTERN', 'LASER'],
        answer: 'LUMEN',
        timeLimit: 12,
        fact: 'IDYLL ends in L → LUMEN measures light output and avoids the cursed letter O!'
      },
      {
        id: 'c-4',
        tail: 'LUMEN',
        linkLetters: 'EN',
        twistType: 'double',
        twistLabel: '🔄 2-Letter Fusion',
        twistDesc: 'Must start with the last TWO letters (EN)!',
        category: 'Thermodynamics',
        question: 'Which law of physics dictates the relentless increase of disorder in the universe?',
        options: ['ENTROPY', 'ENERGY', 'ENIGMA', 'ENGINE'],
        answer: 'ENTROPY',
        timeLimit: 12,
        fact: 'LUMEN ends in EN → ENTROPY represents inevitable universal thermodynamic decay!'
      },
      {
        id: 'c-5',
        tail: 'ENTROPY',
        linkLetters: 'Y',
        twistType: 'blitz',
        twistLabel: '⚡ Blitz Link (7s!)',
        twistDesc: 'Fast 7-second fuse! Rapid reflexes earn +100 bonus speed pts!',
        category: 'Biology',
        question: "What is the yellow, nutrient-rich core of an egg?",
        options: ['YOLK', 'YEAST', 'YACHT', 'YEARN'],
        answer: 'YOLK',
        timeLimit: 7,
        fact: 'ENTROPY ends in Y → YOLK fuels embryonic development. Rapid reaction forged!'
      },
      {
        id: 'c-6',
        tail: 'YOLK',
        linkLetters: 'K',
        twistType: 'length',
        minLen: 7,
        twistLabel: '📏 Length Trap (7+ Letters)',
        twistDesc: 'Starts with K and MUST be at least 7 letters long!',
        category: 'Mechanics',
        question: 'Which form of energy is possessed by an object due to its motion?',
        options: ['KINETIC', 'KITE', 'KNOT', 'KRAKEN'],
        answer: 'KINETIC',
        timeLimit: 12,
        fact: 'YOLK ends in K → KINETIC energy (½mv²) has 7 letters and clears the rule!'
      },
      {
        id: 'c-7',
        tail: 'KINETIC',
        linkLetters: 'IC',
        twistType: 'double',
        twistLabel: '🔄 2-Letter Fusion',
        twistDesc: 'Must start with the last TWO letters (IC)!',
        category: 'Earth Science',
        question: 'What massive floating body of freshwater ice calved from a glacier?',
        options: ['ICEBERG', 'ICON', 'ICICLE', 'IGLOO'],
        answer: 'ICEBERG',
        timeLimit: 12,
        fact: 'KINETIC ends in IC → ICEBERG conceals 90% of its bulk beneath the ocean surface!'
      },
      {
        id: 'c-8',
        tail: 'ICEBERG',
        linkLetters: 'G',
        twistType: 'banned',
        bannedChar: 'E',
        twistLabel: "🚫 Curse: No letter 'E'",
        twistDesc: "Starts with G, but CANNOT contain the letter 'E'!",
        category: 'Cosmology',
        question: 'Which fundamental attractive force holds stars and solar systems together?',
        options: ['GRAVITY', 'GALAXY', 'GEODESIC', 'GLACIER'],
        answer: 'GRAVITY',
        timeLimit: 12,
        fact: 'ICEBERG ends in G → GRAVITY bends spacetime and dodges the banned letter E!'
      },
      {
        id: 'c-9',
        tail: 'GRAVITY',
        linkLetters: 'TY',
        twistType: 'double',
        twistLabel: '🔄 2-Letter Fusion',
        twistDesc: 'Must start with the last TWO letters (TY)!',
        category: 'Meteorology',
        question: 'What mature tropical cyclone develops in the northwestern Pacific?',
        options: ['TYPHOON', 'TORNADO', 'TSUNAMI', 'TYRANT'],
        answer: 'TYPHOON',
        timeLimit: 12,
        fact: 'GRAVITY ends in TY → TYPHOON generates gargantuan storm surges and spiral winds!'
      },
      {
        id: 'c-10',
        tail: 'TYPHOON',
        linkLetters: 'ON',
        twistType: 'omega',
        minLen: 7,
        twistLabel: '👑 The Omega Link',
        twistDesc: 'Starts with ON AND must be 7+ letters long!',
        category: 'Epic Finale',
        question: 'Which word signifies a fierce, destructive, and overwhelming assault?',
        options: ['ONSLAUGHT', 'ONSET', 'ONYX', 'OUTBURST'],
        answer: 'ONSLAUGHT',
        timeLimit: 12,
        fact: 'TYPHOON ends in ON → ONSLAUGHT (9 letters) completes the Cosmic Chain in triumph!'
      }
    ]
  },
  mythic: {
    id: 'mythic',
    name: '🐉 Mythic & Arcane',
    badge: 'Monsters & Lore',
    desc: 'Unravel ancient mazes, legendary beasts, alchemy, and mythical riddles!',
    startWord: 'DRAGON',
    rounds: [
      {
        id: 'm-1',
        tail: 'DRAGON',
        linkLetters: 'ON',
        twistType: 'double',
        twistLabel: '🔄 2-Letter Fusion',
        twistDesc: 'Must start with the last TWO letters (ON)!',
        category: 'Gems & Minerals',
        question: 'Which deep-black banded chalcedony gemstone was prized in ancient Roman signets?',
        options: ['ONYX', 'ONLINE', 'ONSET', 'ONSLAUGHT'],
        answer: 'ONYX',
        timeLimit: 12,
        fact: 'DRAGON ends in ON → ONYX is the dark talisman of ancient royalty!'
      },
      {
        id: 'm-2',
        tail: 'ONYX',
        linkLetters: 'X',
        twistType: 'blitz',
        twistLabel: '⚡ The X-Factor Blitz (7s!)',
        twistDesc: 'Rare X terminal link! 7 seconds to find the musical instrument!',
        category: 'Music & Instruments',
        question: 'Which percussion instrument features tuned wooden bars struck by mallets?',
        options: ['XYLOPHONE', 'XENON', 'XYLEM', 'XEROX'],
        answer: 'XYLOPHONE',
        timeLimit: 7,
        fact: 'ONYX ends in X → XYLOPHONE derives from Greek words for wood (xylon) and sound (phone)!'
      },
      {
        id: 'm-3',
        tail: 'XYLOPHONE',
        linkLetters: 'NE',
        twistType: 'double',
        twistLabel: '🔄 2-Letter Fusion',
        twistDesc: 'Must start with the last TWO letters (NE)!',
        category: 'Deep Space',
        question: 'What vast interstellar cloud of dust and glowing ionized gas births new stars?',
        options: ['NEBULA', 'NEUTRON', 'NEPTUNE', 'NEEDLE'],
        answer: 'NEBULA',
        timeLimit: 12,
        fact: 'XYLOPHONE ends in NE → NEBULA is the cosmic nursery of celestial ignition!'
      },
      {
        id: 'm-4',
        tail: 'NEBULA',
        linkLetters: 'LA',
        twistType: 'double',
        twistLabel: '🔄 2-Letter Fusion',
        twistDesc: 'Must start with the last TWO letters (LA)!',
        category: 'Greek Mythology',
        question: 'What intricate subterranean maze was built by Daedalus to imprison the Minotaur?',
        options: ['LABYRINTH', 'LAGOON', 'LANTERN', 'LADDER'],
        answer: 'LABYRINTH',
        timeLimit: 12,
        fact: 'NEBULA ends in LA → LABYRINTH housed the legendary half-man half-bull monster!'
      },
      {
        id: 'm-5',
        tail: 'LABYRINTH',
        linkLetters: 'TH',
        twistType: 'decoys',
        twistLabel: '🎯 Clue Decoy',
        twistDesc: 'All 4 options start with TH — pick the acoustic phenomenon!',
        category: 'Acoustics',
        question: 'What explosive shockwave sound is generated by rapidly expanding heated air during lightning?',
        options: ['THUNDER', 'THICKET', 'THERMAL', 'THROTTLE'],
        answer: 'THUNDER',
        timeLimit: 12,
        fact: 'LABYRINTH ends in TH → THUNDER travels at roughly 343 meters per second!'
      },
      {
        id: 'm-6',
        tail: 'THUNDER',
        linkLetters: 'ER',
        twistType: 'banned',
        bannedChar: 'A',
        twistLabel: "🚫 Curse: No letter 'A'",
        twistDesc: "Starts with ER, but CANNOT contain the letter 'A'!",
        category: 'Vulcanology',
        question: 'Which violent geological explosion flings molten rock, pumice, and ash into the sky?',
        options: ['ERUPTION', 'ERASER', 'EROSION', 'ERRAND'],
        answer: 'ERUPTION',
        timeLimit: 12,
        fact: 'THUNDER ends in ER → ERUPTION blasts forth while steering clear of forbidden letter A!'
      },
      {
        id: 'm-7',
        tail: 'ERUPTION',
        linkLetters: 'N',
        twistType: 'length',
        minLen: 8,
        twistLabel: '📏 Length Trap (8+ Letters)',
        twistDesc: 'Starts with N and MUST be at least 8 letters long!',
        category: 'Fine Arts',
        question: 'What dreamy musical composition is evocative of or inspired by the nighttime stillness?',
        options: ['NOCTURNE', 'NIGHT', 'NOVA', 'NEBULA'],
        answer: 'NOCTURNE',
        timeLimit: 12,
        fact: 'ERUPTION ends in N → NOCTURNE (8 letters) made famous by Frédéric Chopin!'
      },
      {
        id: 'm-8',
        tail: 'NOCTURNE',
        linkLetters: 'E',
        twistType: 'banned',
        bannedChar: 'I',
        twistLabel: "🚫 Curse: No letter 'I'",
        twistDesc: "Starts with E, but CANNOT contain the letter 'I'!",
        category: 'Apex Predators',
        question: 'Which majestic raptor has binocular eyesight, hooked beaks, and wingspans up to 8 feet?',
        options: ['EAGLE', 'EGRET', 'ELBOW', 'EMU'],
        answer: 'EAGLE',
        timeLimit: 12,
        fact: 'NOCTURNE ends in E → EAGLE hunts with 4-8 times sharper vision than humans, no letter I!'
      },
      {
        id: 'm-9',
        tail: 'EAGLE',
        linkLetters: 'LE',
        twistType: 'double',
        twistLabel: '🔄 2-Letter Fusion',
        twistDesc: 'Must start with the last TWO letters (LE)!',
        category: 'Big Cats',
        question: 'Which spotted feline predator is legendary for carrying prey twice its weight up into trees?',
        options: ['LEOPARD', 'LEMUR', 'LEGEND', 'LEECH'],
        answer: 'LEOPARD',
        timeLimit: 12,
        fact: 'EAGLE ends in LE → LEOPARD possesses rosetted camouflage and immense climbing strength!'
      },
      {
        id: 'm-10',
        tail: 'LEOPARD',
        linkLetters: 'D',
        twistType: 'omega',
        minLen: 8,
        twistLabel: '👑 The Omega Link',
        twistDesc: 'Starts with D AND must be 8+ letters long!',
        category: 'Paleontology',
        question: 'Which ancient reptiles dominated terrestrial ecosystems during the Triassic, Jurassic, and Cretaceous?',
        options: ['DINOSAUR', 'DODO', 'DEER', 'DRAGON'],
        answer: 'DINOSAUR',
        timeLimit: 12,
        fact: 'LEOPARD ends in D → DINOSAUR (8 letters) seals the Mythic Chain in legendary fashion!'
      }
    ]
  }
};

function getRank(correct, total, score) {
  const r = correct / total;
  if (r === 1) return { icon: '👑', label: 'Grand Chainmaster', desc: 'Flawless execution! Every twist conquered with laser precision.' };
  if (r >= 0.8) return { icon: '⚡', label: 'Chain Alchemist', desc: 'Incredible mastery of double fusions and curse dodges!' };
  if (r >= 0.6) return { icon: '⛓️', label: 'Link Forger', desc: 'Strong performance! You handled the twists with great resilience.' };
  if (r >= 0.4) return { icon: '🔗', label: 'Chain Apprentice', desc: 'Good effort - watch out for cursed letters and length traps!' };
  return { icon: '💔', label: 'Broken Links', desc: 'Practice your prefix spotting and read the clues carefully!' };
}

export default function WordChain({ sound, onBack, onSaveScore }) {
  const [selectedThemeKey, setSelectedThemeKey] = useState('cosmic');
  const [gameState, setGameState] = useState('ready');
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [history, setHistory] = useState([]);
  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);
  const [timeLeft, setTimeLeft] = useState(12);

  const themeData = THEMES[selectedThemeKey] || THEMES.cosmic;
  const currentRound = themeData.rounds[roundIdx];

  // Dynamic chain completed so far
  const chainWords = useMemo(() => {
    const list = [themeData.startWord];
    for (let i = 0; i < roundIdx; i++) {
      const h = history[i];
      if (h) {
        list.push(h.chosen || h.answer);
      }
    }
    return list;
  }, [themeData, roundIdx, history]);

  // Shuffled options
  const shuffledOptions = useMemo(() => {
    if (!currentRound) return [];
    const opts = [...currentRound.options];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [roundIdx, selectedThemeKey]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing' || selectedOpt !== null || timedOut) return;

    setTimeLeft(currentRound ? currentRound.timeLimit : 12);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeOut();
          return 0;
        }
        if (prev <= 4) {
          try { sound.playTick(); } catch(e) {}
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [roundIdx, gameState, selectedOpt, timedOut]);

  const handleTimeOut = () => {
    setTimedOut(true);
    try { sound.playTimeout(); } catch(e) {}
    setStreak(0);
    setHistory(prev => [
      ...prev,
      {
        tail: currentRound.tail,
        chosen: '⏱️ TIME EXPIRED',
        isCorrect: false,
        answer: currentRound.answer,
        twistLabel: currentRound.twistLabel
      }
    ]);
  };

  const startGame = (themeKey) => {
    const key = themeKey || selectedThemeKey;
    setSelectedThemeKey(key);
    setRoundIdx(0);
    setScore(0);
    setCorrect(0);
    setStreak(0);
    setSelectedOpt(null);
    setTimedOut(false);
    setHistory([]);
    setGameState('playing');
  };

  const handleSelect = (opt) => {
    if (selectedOpt !== null || timedOut) return;
    setSelectedOpt(opt);
    const isCorrect = opt === currentRound.answer;

    if (isCorrect) {
      try { sound.playCorrect(); } catch(e) {}
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak === 3 || newStreak === 5 || newStreak === 8) {
        try { sound.playStreak(); } catch(e) {}
      }

      // Points: 150 base + speed bonus + streak multiplier + blitz bonus
      const speedBonus = timeLeft * 10;
      const blitzBonus = currentRound.twistType === 'blitz' ? 100 : 0;
      const multiplier = newStreak >= 4 ? 2.5 : (newStreak >= 3 ? 2.0 : (newStreak >= 2 ? 1.5 : 1.0));
      const roundScore = Math.round((150 + speedBonus + blitzBonus) * multiplier);

      const ns = score + roundScore;
      setScore(ns);
      setLastPts(roundScore);
      setScoreTrigger(t => t + 1);
      setCorrect(c => c + 1);
      if (onSaveScore) onSaveScore('funnySort', ns);
    } else {
      try { sound.playWrong(); } catch(e) {}
      setStreak(0);
    }

    setHistory(prev => [
      ...prev,
      {
        tail: currentRound.tail,
        chosen: opt,
        isCorrect,
        answer: currentRound.answer,
        twistLabel: currentRound.twistLabel
      }
    ]);
  };

  const handleNext = () => {
    if (roundIdx + 1 >= themeData.rounds.length) {
      setGameState('gameover');
      if (correct >= 7) {
        try { sound.playStreak(); } catch(e) {}
      } else {
        try { sound.playCorrect(); } catch(e) {}
      }
    } else {
      setRoundIdx(i => i + 1);
      setSelectedOpt(null);
      setTimedOut(false);
    }
  };

  const rank = getRank(correct, themeData.rounds.length, score);
  const maxTimer = currentRound ? currentRound.timeLimit : 12;
  const timerRatio = Math.max(0, Math.min(1, timeLeft / maxTimer));

  return (
    <div className="screen mini-game-screen wc-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>&larr; Hub</button>
        <div className="mini-game-title">⛓️ Word Chain: Twisted</div>
        <div className="hud-badge-compact">Link {Math.min(roundIdx + 1, 10)} / 10</div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal" style={{ maxWidth: '640px' }}>
          <div className="mode-badge-pop" style={{ background: 'var(--mint-soft)', color: 'var(--mint)' }}>
            Twisted Word Association &middot; 10 Links
          </div>
          <h2>Word Chain: Twisted ⛓️</h2>
          <p className="ready-desc">
            Build an unbreakable chain where each link connects to the previous word.
            Watch out for <strong>Twist Modifiers</strong>: 2-letter fusions, banned letter curses, decoy traps, and blitz fuses!
          </p>

          <div className="wc-twist-legend">
            <div className="twist-legend-item">
              <span className="tw-icon">🔄</span>
              <div>
                <strong>2-Letter Fusion</strong>
                <p>Must start with the previous word's last TWO letters!</p>
              </div>
            </div>
            <div className="twist-legend-item">
              <span className="tw-icon">🚫</span>
              <div>
                <strong>Banned Letter Curse</strong>
                <p>The correct link CANNOT contain a forbidden letter!</p>
              </div>
            </div>
            <div className="twist-legend-item">
              <span className="tw-icon">⚡</span>
              <div>
                <strong>Blitz Fuse (7s)</strong>
                <p>Rapid timer with +100 bonus speed points!</p>
              </div>
            </div>
            <div className="twist-legend-item">
              <span className="tw-icon">📏</span>
              <div>
                <strong>Length Trap</strong>
                <p>Must satisfy a minimum letter count to forge!</p>
              </div>
            </div>
          </div>

          <div className="wc-theme-picker">
            <span className="picker-lbl">Choose Your Chain Realm:</span>
            <div className="theme-btn-group">
              {Object.values(THEMES).map(t => (
                <button
                  key={t.id}
                  className={'btn-theme-select ' + (selectedThemeKey === t.id ? 'theme-active' : '')}
                  onClick={() => setSelectedThemeKey(t.id)}
                >
                  <div className="t-name">{t.name}</div>
                  <div className="t-desc">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-start-mini"
            style={{ background: 'var(--mint)', marginTop: '16px' }}
            onClick={() => startGame(selectedThemeKey)}
          >
            <span>Forge the Chain ({themeData.name})</span> &rarr;
          </button>
        </div>
      )}

      {gameState === 'playing' && currentRound && (
        <div className="wc-play-area">
          <div className="hud-strip">
            <div className="hud-badge">
              <span className="lbl">Score</span>
              <span className="val">{score}</span>
            </div>
            <div className="hud-badge">
              <span className="lbl">Streak</span>
              <span className="val">
                {streak > 0 ? `🔥 ${streak}x` : '0x'}
              </span>
            </div>
            <div className="hud-badge">
              <span className="lbl">Category</span>
              <span className="val" style={{ fontSize: '0.75rem' }}>{currentRound.category}</span>
            </div>
            <div className={'hud-badge wc-timer-badge ' + (timeLeft <= 4 ? 'timer-danger' : '')}>
              <span className="lbl">Timer</span>
              <span className="val">{timeLeft}s</span>
            </div>
          </div>

          {/* Countdown progress bar */}
          <div className="wc-timer-bar-wrap">
            <div
              className={'wc-timer-bar-fill ' + (timeLeft <= 4 ? 'fill-danger' : '')}
              style={{ width: `${timerRatio * 100}%` }}
            />
          </div>

          {/* Chain Bar */}
          <div className="wc-chain-bar">
            {chainWords.map((word, i) => (
              <React.Fragment key={i}>
                <div className={'wc-chain-link ' + (i === chainWords.length - 1 ? 'chain-link-active' : 'chain-link-done')}>
                  {word}
                </div>
                {i < chainWords.length - 1 && <div className="wc-chain-connector">&rarr;</div>}
              </React.Fragment>
            ))}
            <div className="wc-chain-connector">&rarr;</div>
            <div className="wc-chain-link chain-link-unknown">
              <span className="unknown-prefix">{currentRound.linkLetters}</span>...
            </div>
          </div>

          {/* Active Twist Banner */}
          <div className={'wc-twist-banner twist-' + currentRound.twistType}>
            <div className="twist-badge-tag">{currentRound.twistLabel}</div>
            <div className="twist-badge-desc">{currentRound.twistDesc}</div>
          </div>

          {/* Question Card */}
          <div className="wc-question-card">
            <p className="wc-question-text">{currentRound.question}</p>
          </div>

          {/* Options Grid */}
          <div className="wc-options-grid">
            {shuffledOptions.map((opt, i) => {
              const isSelected = selectedOpt === opt;
              const isCorrect = opt === currentRound.answer;
              let cls = 'btn-wc-opt';
              if (selectedOpt !== null || timedOut) {
                if (isSelected && isCorrect) cls += ' wc-correct';
                else if (isSelected && !isCorrect) cls += ' wc-wrong';
                else if (!isSelected && isCorrect) cls += ' wc-revealed';
              }
              return (
                <button
                  key={i}
                  className={cls}
                  onClick={() => handleSelect(opt)}
                  disabled={selectedOpt !== null || timedOut}
                >
                  <span className="wc-opt-letter">{['A', 'B', 'C', 'D'][i]}</span>
                  <div className="wc-opt-content">
                    <span className="wc-opt-word">{opt}</span>
                    <span className="wc-opt-len">({opt.length} letters)</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Outcome & Breakdown */}
          {(selectedOpt !== null || timedOut) && (
            <div className="wc-breakdown animate-pop">
              <div className={'wc-result-tag ' + (selectedOpt === currentRound.answer ? 'res-correct' : 'res-wrong')}>
                {selectedOpt === currentRound.answer
                  ? `🔗 Link Forged! (+${lastPts} pts)`
                  : timedOut
                  ? '⏱️ Time Expired! Chain Snapped!'
                  : '💔 Broken Link! Decoy Trap!'}
              </div>
              <p className="wc-fact">{currentRound.fact}</p>
              <button className="btn-wc-next" onClick={handleNext}>
                {roundIdx + 1 < themeData.rounds.length
                  ? `Next Link (${roundIdx + 2}/10) →`
                  : 'See Final Results →'}
              </button>
            </div>
          )}
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal" style={{ maxWidth: '600px' }}>
          {correct >= 7 && <Confetti />}
          <div className="gameover-icon">{rank.icon}</div>
          <h2>{rank.label}</h2>
          <p className="ready-desc">{rank.desc}</p>

          <div className="results-metrics">
            <div className="metric-box">
              <span className="m-val">{score}</span>
              <span className="m-lbl">Total Score</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{correct} / 10</span>
              <span className="m-lbl">Links Forged</span>
            </div>
            <div className="metric-box">
              <span className="m-val">{Math.round((correct / 10) * 100)}%</span>
              <span className="m-lbl">Integrity</span>
            </div>
          </div>

          <div className="wc-history-list">
            {history.map((h, i) => (
              <div key={i} className={'wc-history-item ' + (h.isCorrect ? 'hist-ok' : 'hist-miss')}>
                <span className="hist-num">#{i + 1}</span>
                <span className="hist-twist">{h.twistLabel}</span>
                <span className="hist-tail">{h.tail} &rarr;</span>
                <span className="hist-chosen">{h.chosen}</span>
                <span className="hist-status">{h.isCorrect ? '✓' : `✗ (${h.answer})`}</span>
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button
              className="btn-play-again"
              style={{ background: 'var(--mint)' }}
              onClick={() => startGame(selectedThemeKey === 'cosmic' ? 'mythic' : 'cosmic')}
            >
              Try {selectedThemeKey === 'cosmic' ? 'Mythic' : 'Cosmic'} Realm ↺
            </button>
            <button className="btn-play-again" style={{ background: 'var(--surface2)', color: 'var(--text)' }} onClick={() => startGame(selectedThemeKey)}>
              Replay Same Realm ↺
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
