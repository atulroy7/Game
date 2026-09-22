import React, { useState } from 'react';
import BgOrbs from './BgOrbs';
import GameCardVisual from './GameCardVisual';
import {
  BrandLogoIcon,
  SunIcon,
  MoonIcon,
  TrophyIcon,
  ArrowRightIcon,
} from './Icons';

const HUB_FILTERS = [
  { key: 'all',     label: 'All Games (13)' },
  { key: 'math',    label: 'Math & Series' },
  { key: 'logic',   label: 'Logic & Deduction' },
  { key: 'spatial', label: 'Spatial & Visual' },
  { key: 'speed',   label: 'Speed & Reflex' },
];

const GAMES_LIST = [
  {
    id: 'numberNinja',
    title: 'Number Ninja',
    category: 'math',
    tag: 'Series & Patterns',
    desc: 'Slash the missing number in arithmetic, geometric, and alternating series before the blade cools down!',
    accent: 'var(--coral)',
    soft: 'var(--coral-soft)',
  },
  {
    id: 'logicLock',
    title: 'Logic Lock 🔐',
    category: 'logic',
    tag: 'Deduction Vault',
    desc: 'Mastermind-style cipher vault. Analyze positional clues to deduce the secret 3-digit combination and crack the lock!',
    accent: 'var(--amber)',
    soft: 'var(--amber-soft)',
  },
  {
    id: 'missingPiece',
    title: 'Missing Piece 🧩',
    category: 'spatial',
    tag: 'Raven Matrix',
    desc: 'Analyze 3×3 matrix pattern rules across rows and columns to pinpoint the missing 9th geometric tile.',
    accent: 'var(--mint)',
    soft: 'var(--mint-soft)',
  },
  {
    id: 'speedMath',
    title: 'Speed Math ⚡',
    category: 'math',
    tag: 'Mental Calculation',
    desc: 'Rapid-fire mental calculation sprint! Solve percentage shortcuts, ratio splits, and speed arithmetic under time pressure.',
    accent: 'var(--amber)',
    soft: 'var(--amber-soft)',
  },
  {
    id: 'codeBreaker',
    title: 'Code Breaker 🔎',
    category: 'logic',
    tag: 'Cipher Deduction',
    desc: 'Crack encrypted alphanumeric transmissions using letter shifts, reverse mirrors, and alphabet order analysis.',
    accent: 'var(--violet)',
    soft: 'var(--violet-soft)',
  },
  {
    id: 'brainMaze',
    title: 'Brain Maze 🌀',
    category: 'spatial',
    tag: 'Direction Sense',
    desc: 'Test your spatial compass and vector tracking! Calculate bearings, displacement, and angular orientation in your mind.',
    accent: 'var(--coral)',
    soft: 'var(--coral-soft)',
  },
  {
    id: 'seatingShuffle',
    title: 'Seating Shuffle 🪑',
    category: 'logic',
    tag: 'Logical Deduction',
    desc: 'Arrange character avatars into chairs following linear relation clues, adjacency constraints, and spatial rules.',
    accent: 'var(--mint)',
    soft: 'var(--mint-soft)',
  },
  {
    id: 'oddOneOut',
    title: 'Odd One Out 🎯',
    category: 'spatial',
    tag: 'Classification',
    desc: 'Spot the subtle outlier! Identify which item does not belong based on taxonomic, mathematical, and geometric rules.',
    accent: 'var(--coral)',
    soft: 'var(--coral-soft)',
  },
  {
    id: 'detectiveMystery',
    title: 'Detective Mystery 🕵️',
    category: 'logic',
    tag: 'Blood Relations',
    desc: 'Step into the shoes of a detective! Untangle family tree relations, testimony alibis, and logical mystery riddles.',
    accent: 'var(--amber)',
    soft: 'var(--amber-soft)',
  },
  {
    id: 'countdown60',
    title: 'Countdown 60 ⏱️',
    category: 'speed',
    tag: 'Time Management',
    desc: 'A 60-second high-intensity decision gauntlet of rapid aptitude and logic questions with time bonuses and streak multipliers.',
    accent: 'var(--coral)',
    soft: 'var(--coral-soft)',
  },
  {
    id: 'equationEscape',
    title: 'Equation Escape 🔢',
    category: 'math',
    tag: 'Arithmetic Balance',
    desc: 'Construct an arithmetic equation from given number tiles and operators that balances to unlock the target escape value.',
    accent: 'var(--mint)',
    soft: 'var(--mint-soft)',
  },
  {
    id: 'memoryMatch',
    title: 'Memory Match 🧠',
    category: 'spatial',
    tag: 'Visual Focus',
    desc: 'Clean 3D animal pair matching with combo streaks, move efficiency counters, and a 3-star rating system.',
    accent: 'var(--orange)',
    soft: 'var(--orange-soft)',
  },
  {
    id: 'chronoBeat',
    title: 'Chrono Beat ⏱️',
    category: 'speed',
    tag: 'Blind Clock',
    desc: 'Can your brain measure seconds without looking? The counter blinds after 1.2s — tap stop at the exact millisecond!',
    accent: 'var(--amber)',
    soft: 'var(--amber-soft)',
  },
];

export default function HomeScreen({
  onSelectGame,
  stats,
  theme,
  onToggleTheme,
  palette,
  onSelectPalette,
}) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredGames = activeFilter === 'all'
    ? GAMES_LIST
    : GAMES_LIST.filter(g => g.category === activeFilter);

  return (
    <div className="screen full-home-screen">
      <BgOrbs />
      <div className="full-home-container">

        {/* Top Header Row (Full Width) */}
        <header className="full-home-header">
          <div className="header-brand-wrap">
            <BrandLogoIcon size={38} className="brand-logo-svg" />
            <div>
              <h1 className="brand-heading">Brain<span>Blitz</span></h1>
              <p className="brand-tagline">13 Interactive Aptitude &amp; Cognitive Reasoning Games</p>
            </div>
          </div>

          <div className="header-right-tools">
            {/* Aggregate Stats */}
            <div className="header-stat-badge">
              <span className="h-num">{stats.gamesPlayed ?? 0}</span>
              <span className="h-lbl">Rounds Played</span>
            </div>

            {/* Palette Switcher */}
            <div className="palette-pill-selector" role="group" aria-label="Color Palette">
              <button
                className={`btn-palette-pill ${palette === 'crisp' ? 'active' : ''}`}
                onClick={() => onSelectPalette('crisp')}
                title="Crisp Minimal (Pearl & Vibrant Accents)"
              >
                <span className="palette-dot dot-crisp" />
                Crisp
              </button>
              <button
                className={`btn-palette-pill ${palette === 'matcha' ? 'active' : ''}`}
                onClick={() => onSelectPalette('matcha')}
                title="Botanical Sage (Calm Japanese Minimal)"
              >
                <span className="palette-dot dot-sage" />
                Sage
              </button>
              <button
                className={`btn-palette-pill ${palette === 'sand' ? 'active' : ''}`}
                onClick={() => onSelectPalette('sand')}
                title="Warm Sandstone (Desert Minimal)"
              >
                <span className="palette-dot dot-sand" />
                Sand
              </button>
            </div>

            {/* Theme Toggle */}
            <button className="btn-theme-toggle" onClick={onToggleTheme} title="Toggle Dark/Light Mode">
              {theme === 'dark' ? (
                <>
                  <SunIcon size={15} />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <MoonIcon size={15} />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Category Filter Bar */}
        <div className="hub-filter-bar">
          {HUB_FILTERS.map(f => (
            <button
              key={f.key}
              className={`btn-hub-filter ${activeFilter === f.key ? 'filter-active' : ''}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Modern Full-Screen Cards Grid */}
        <div className="full-cards-grid">
          {filteredGames.map((game, index) => {
            const bestScore = stats[`${game.id}High`] || 0;

            return (
              <div
                key={game.id}
                className="full-game-card modern-game-card"
                style={{
                  '--card-accent': game.accent,
                  '--card-soft': game.soft,
                  '--i': index,
                }}
              >
                {/* Visual Header Image Banner */}
                <div className="card-visual-wrapper">
                  <GameCardVisual gameId={game.id} accent={game.accent} soft={game.soft} />
                  <div className="card-banner-badges">
                    <span className="game-card-tag" style={{ background: 'var(--surface)', color: game.accent }}>
                      {game.tag}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="card-title-row">
                    <span className="card-accent-dot" style={{ background: game.accent }} />
                    <h3 className="game-card-title">{game.title}</h3>
                  </div>
                  <p className="game-card-desc">{game.desc}</p>
                </div>

                <div className="card-footer-row">
                  <div className="card-best-badge">
                    <div className="b-lbl-wrap">
                      <TrophyIcon size={12} className="trophy-icon" />
                      <span className="b-lbl">Best Score</span>
                    </div>
                    <span className="b-val">{bestScore} pts</span>
                  </div>

                  <div className="card-action-wrap">
                    <button
                      className="btn-card-launch"
                      onClick={() => onSelectGame(game.id)}
                    >
                      <span>Play</span>
                      <ArrowRightIcon size={13} className="launch-arrow-icon" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
