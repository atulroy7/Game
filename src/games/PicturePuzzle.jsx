import React, { useState, useEffect, useRef, useCallback } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const QUESTIONS_PER_ROUND = 10;

// Crisp, standalone SVG Visual Renderers for each puzzle
function VisualArtwork({ visualType, accent = 'var(--mint)' }) {
  switch (visualType) {
    case 'rebus_understand':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <text x="140" y="55" fontSize="26" fontWeight="900" fill="var(--text)" textAnchor="middle" letterSpacing="4">
            STAND
          </text>
          <line x1="60" y1="75" x2="220" y2="75" stroke={accent} strokeWidth="3" strokeLinecap="round" />
          <text x="140" y="112" fontSize="28" fontWeight="900" fill={accent} textAnchor="middle">
            I
          </text>
        </svg>
      );

    case 'rebus_head_heels':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <text x="140" y="48" fontSize="26" fontWeight="900" fill={accent} textAnchor="middle">
            HEAD
          </text>
          <text x="140" y="80" fontSize="16" fontWeight="800" fill="var(--muted)" textAnchor="middle">
            ─────── OVER ───────
          </text>
          <text x="140" y="116" fontSize="26" fontWeight="900" fill="var(--text)" textAnchor="middle" letterSpacing="3">
            HEELS
          </text>
        </svg>
      );

    case 'rebus_blind_mice':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <g transform="translate(45, 45)">
            <text x="0" y="32" fontSize="30" fontWeight="900" fill="var(--text)">M</text>
            <rect x="30" y="12" width="18" height="24" rx="4" fill="var(--coral-soft)" stroke="var(--coral)" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="39" y="30" fontSize="18" fontWeight="900" fill="var(--coral)" textAnchor="middle">?</text>
            <text x="56" y="32" fontSize="30" fontWeight="900" fill="var(--text)">CE</text>
          </g>
          <text x="140" y="115" fontSize="14" fontWeight="800" fill="var(--muted)" textAnchor="middle">
            × 3 (Repeated three times, missing "I")
          </text>
        </svg>
      );

    case 'rebus_half_time':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <g transform="translate(60, 40)">
            <text x="0" y="45" fontSize="36" fontWeight="900" fill="var(--text)" letterSpacing="2">TI</text>
            <line x1="75" y1="5" x2="75" y2="65" stroke="var(--coral)" strokeWidth="3" strokeDasharray="4 4" />
            <text x="95" y="45" fontSize="36" fontWeight="900" fill="var(--muted)" letterSpacing="2">ME</text>
          </g>
          <text x="140" y="120" fontSize="13" fontWeight="800" fill={accent} textAnchor="middle">
            ✂️ Split exactly down the middle
          </text>
        </svg>
      );

    case 'rebus_reading_between':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <line x1="30" y1="36" x2="250" y2="36" stroke="var(--text)" strokeWidth="3" />
          <text x="140" y="78" fontSize="22" fontWeight="900" fill={accent} textAnchor="middle" letterSpacing="3">
            R E A D I N G
          </text>
          <line x1="30" y1="104" x2="250" y2="104" stroke="var(--text)" strokeWidth="3" />
        </svg>
      );

    case 'rebus_one_in_million':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <g transform="translate(40, 45)">
            <text x="0" y="40" fontSize="34" fontWeight="900" fill="var(--text)">M</text>
            <circle cx="50" cy="28" r="22" fill={accent} />
            <text x="50" y="38" fontSize="26" fontWeight="900" fill="#fff" textAnchor="middle">1</text>
            <text x="85" y="40" fontSize="34" fontWeight="900" fill="var(--text)">LLION</text>
          </g>
        </svg>
      );

    case 'rebus_tricycle':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <text x="140" y="45" fontSize="20" fontWeight="900" fill="var(--text)" textAnchor="middle">CYCLE</text>
          <text x="140" y="78" fontSize="20" fontWeight="900" fill="var(--text)" textAnchor="middle">CYCLE</text>
          <text x="140" y="111" fontSize="20" fontWeight="900" fill="var(--text)" textAnchor="middle">CYCLE</text>
        </svg>
      );

    case 'rebus_mind_matter':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <text x="140" y="52" fontSize="28" fontWeight="900" fill={accent} textAnchor="middle" letterSpacing="4">
            MIND
          </text>
          <line x1="50" y1="72" x2="230" y2="72" stroke="var(--border)" strokeWidth="3" />
          <text x="140" y="112" fontSize="28" fontWeight="900" fill="var(--text)" textAnchor="middle" letterSpacing="4">
            MATTER
          </text>
        </svg>
      );

    case 'equation_fruits':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <text x="20" y="32" fontSize="16" fontWeight="800" fill="var(--text)">🍎 + 🍎 + 🍎 = 30</text>
          <text x="20" y="62" fontSize="16" fontWeight="800" fill="var(--text)">🍎 + 🍌4 + 🍌4 = 18</text>
          <text x="20" y="92" fontSize="16" fontWeight="800" fill="var(--text)">🍌4 − 🥥2 = 2</text>
          <text x="20" y="124" fontSize="18" fontWeight="900" fill={accent}>🥥1 + 🍎 + 🍌3 = ?</text>
        </svg>
      );

    case 'equation_shapes':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <g transform="translate(20, 15)">
            <text x="0" y="24" fontSize="15" fontWeight="800" fill="var(--text)">🔺 + 🔺 + 🔺 = 15</text>
            <text x="0" y="54" fontSize="15" fontWeight="800" fill="var(--text)">🔺 + 🟦 + 🟦 = 21</text>
            <text x="0" y="84" fontSize="15" fontWeight="800" fill="var(--text)">🟦 − 🟢 = 5</text>
            <text x="0" y="114" fontSize="18" fontWeight="900" fill={accent}>🟢 + 🔺 × 🟦 = ?</text>
          </g>
        </svg>
      );

    case 'triangle_count':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <polygon points="140,20 60,120 220,120" stroke={accent} strokeWidth="3" fill="none" />
          <line x1="140" y1="20" x2="140" y2="120" stroke={accent} strokeWidth="2" />
          <line x1="100" y1="70" x2="180" y2="70" stroke={accent} strokeWidth="2" />
          <text x="235" y="75" fontSize="12" fontWeight="800" fill="var(--muted)">Count?</text>
        </svg>
      );

    case 'rebus_touchdown':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <text x="140" y="60" fontSize="30" fontWeight="900" fill="var(--text)" textAnchor="middle" letterSpacing="2">
            TOUCH
          </text>
          <text x="140" y="105" fontSize="24" fontWeight="900" fill={accent} textAnchor="middle">
            ⬇️ (Pointing down)
          </text>
        </svg>
      );

    case 'rebus_green_envy':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <rect x="50" y="35" width="180" height="70" rx="12" fill="#10b981" />
          <text x="140" y="80" fontSize="32" fontWeight="900" fill="#ffffff" textAnchor="middle" letterSpacing="4">
            ENVY
          </text>
        </svg>
      );

    case 'rebus_growing_economy':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <g transform="translate(30, 85)">
            <text x="0" y="0" fontSize="14" fontWeight="900" fill="var(--muted)">ECO</text>
            <text x="45" y="0" fontSize="20" fontWeight="900" fill="var(--text)">NO</text>
            <text x="88" y="0" fontSize="30" fontWeight="900" fill={accent}>MY</text>
            <path d="M150 -10 L180 -35 L200 -25 L230 -60" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" />
            <polygon points="230,-60 215,-55 225,-45" fill={accent} />
          </g>
        </svg>
      );

    case 'rebus_crossroads':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <text x="140" y="55" fontSize="28" fontWeight="900" fill="var(--text)" textAnchor="middle" letterSpacing="3">
            R O A D
          </text>
          <line x1="50" y1="45" x2="230" y2="45" stroke="var(--coral)" strokeWidth="4" />
          <text x="140" y="105" fontSize="28" fontWeight="900" fill="var(--text)" textAnchor="middle" letterSpacing="3">
            R O A D
          </text>
          <line x1="50" y1="95" x2="230" y2="95" stroke="var(--coral)" strokeWidth="4" />
        </svg>
      );

    case 'rebus_sandbox':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <rect x="70" y="30" width="140" height="80" rx="8" fill="var(--surface)" stroke="var(--amber)" strokeWidth="3" />
          <text x="140" y="78" fontSize="28" fontWeight="900" fill="var(--amber)" textAnchor="middle" letterSpacing="2">
            SAND
          </text>
        </svg>
      );

    case 'rebus_scrambled_eggs':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <g transform="translate(60, 45)">
            <text x="10" y="35" fontSize="32" fontWeight="900" fill={accent} transform="rotate(-15 10 35)">G</text>
            <text x="50" y="25" fontSize="32" fontWeight="900" fill="var(--text)" transform="rotate(25 50 25)">E</text>
            <text x="90" y="45" fontSize="32" fontWeight="900" fill="var(--coral)" transform="rotate(-30 90 45)">S</text>
            <text x="125" y="30" fontSize="32" fontWeight="900" fill="var(--amber)" transform="rotate(18 125 30)">G</text>
          </g>
          <text x="140" y="120" fontSize="12" fontWeight="800" fill="var(--muted)" textAnchor="middle">
            (Jumbled food letters)
          </text>
        </svg>
      );

    case 'rebus_breakfast':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <text x="80" y="75" fontSize="28" fontWeight="900" fill="var(--text)">BREAK</text>
          <text x="190" y="75" fontSize="28" fontWeight="900" fill={accent} letterSpacing="3">FAST</text>
          <path d="M145 35 L145 105" stroke="var(--coral)" strokeWidth="3" strokeDasharray="4 4" />
        </svg>
      );

    case 'rebus_neon_lights':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="#0f172a" />
          <text x="140" y="80" fontSize="32" fontWeight="900" fill="#38bdf8" textAnchor="middle" filter="drop-shadow(0 0 8px #38bdf8)">
            LIGHTS
          </text>
          <text x="140" y="115" fontSize="12" fontWeight="800" fill="#94a3b8" textAnchor="middle">
            Atomic #10 glowing tube
          </text>
        </svg>
      );

    case 'rebus_painless':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <text x="140" y="65" fontSize="30" fontWeight="900" fill="var(--coral)" textAnchor="middle" letterSpacing="4">
            PAIN
          </text>
          <text x="140" y="105" fontSize="20" fontWeight="900" fill="var(--muted)" textAnchor="middle">
            - - - (Fading away to zero)
          </text>
        </svg>
      );

    case 'rebus_brainstorm':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <text x="140" y="52" fontSize="28" fontWeight="900" fill={accent} textAnchor="middle" letterSpacing="2">BRAIN</text>
          <text x="140" y="90" fontSize="14" fontWeight="800" fill="var(--muted)" textAnchor="middle">⚡⚡⚡ (Thunder claps)</text>
          <path d="M90 105 Q140 120 190 105" stroke={accent} strokeWidth="2" fill="none" strokeDasharray="4 3"/>
          <text x="140" y="128" fontSize="11" fontWeight="700" fill="var(--muted)" textAnchor="middle">with storm effects</text>
        </svg>
      );

    case 'rebus_firefly':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="#0f172a" />
          <text x="90" y="80" fontSize="32" fontWeight="900" fill="#ef4444" textAnchor="middle">FIRE</text>
          <circle cx="175" cy="65" r="18" fill="#fbbf24" opacity="0.9"/>
          <text x="175" y="72" fontSize="16" textAnchor="middle">🪲</text>
          <text x="140" y="120" fontSize="12" fontWeight="800" fill="#94a3b8" textAnchor="middle">Glowing insect + flame</text>
        </svg>
      );

    case 'rebus_overtime':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <text x="140" y="52" fontSize="16" fontWeight="800" fill="var(--muted)" textAnchor="middle">ABOVE</text>
          <line x1="50" y1="65" x2="230" y2="65" stroke={accent} strokeWidth="3"/>
          <text x="140" y="100" fontSize="30" fontWeight="900" fill="var(--text)" textAnchor="middle" letterSpacing="3">TIME</text>
        </svg>
      );

    case 'rebus_upside_down':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <text x="140" y="55" fontSize="26" fontWeight="900" fill={accent} textAnchor="middle" transform="rotate(180 140 55)">DOWN</text>
          <text x="140" y="105" fontSize="14" fontWeight="800" fill="var(--muted)" textAnchor="middle">↕ Flipped vertically</text>
        </svg>
      );

    case 'rebus_backseat_driver':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <rect x="60" y="40" width="160" height="60" rx="10" fill="var(--surface)" stroke={accent} strokeWidth="2"/>
          <text x="140" y="76" fontSize="13" fontWeight="900" fill="var(--text)" textAnchor="middle">🚗 DRIVER</text>
          <text x="140" y="120" fontSize="13" fontWeight="800" fill={accent} textAnchor="middle">← BACK seat position</text>
        </svg>
      );

    case 'rebus_diamond_ring':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <polygon points="140,25 165,55 140,75 115,55" fill="#38bdf8" opacity="0.8"/>
          <circle cx="140" cy="100" r="22" fill="none" stroke={accent} strokeWidth="4"/>
          <text x="140" y="132" fontSize="11" fontWeight="800" fill="var(--muted)" textAnchor="middle">Gem shape + circle band</text>
        </svg>
      );

    case 'rebus_double_check':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <text x="100" y="80" fontSize="40" fontWeight="900" fill="#10b981" textAnchor="middle">✓</text>
          <text x="175" y="80" fontSize="40" fontWeight="900" fill="#10b981" textAnchor="middle">✓</text>
          <text x="140" y="120" fontSize="12" fontWeight="800" fill="var(--muted)" textAnchor="middle">Two verification marks</text>
        </svg>
      );

    case 'rebus_weather_forecast':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <text x="80" y="70" fontSize="22" fontWeight="900" fill="#94a3b8" textAnchor="middle">⛈️</text>
          <text x="140" y="70" fontSize="22" fontWeight="900" fill={accent} textAnchor="middle">→</text>
          <text x="200" y="70" fontSize="22" textAnchor="middle">☀️</text>
          <text x="140" y="110" fontSize="13" fontWeight="800" fill="var(--muted)" textAnchor="middle">Predicted: CAST ahead</text>
        </svg>
      );

    case 'rebus_flat_broke':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <text x="90" y="75" fontSize="28" fontWeight="900" fill="var(--text)" textAnchor="middle">FLAT</text>
          <text x="190" y="75" fontSize="28" fontWeight="900" fill="var(--coral)" textAnchor="middle">BROKE</text>
          <line x1="50" y1="82" x2="230" y2="82" stroke="var(--coral)" strokeWidth="2" strokeDasharray="4 4"/>
          <text x="140" y="115" fontSize="11" fontWeight="800" fill="var(--muted)" textAnchor="middle">Flat wallet + shattered word</text>
        </svg>
      );

    case 'rebus_shortcut':
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <line x1="40" y1="40" x2="240" y2="40" stroke="var(--border)" strokeWidth="2" strokeDasharray="5 5"/>
          <text x="140" y="37" fill="var(--muted)" fontSize="10" fontWeight="700" textAnchor="middle">LONG ROUTE</text>
          <path d="M40 100 Q140 55 240 100" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round"/>
          <text x="140" y="118" fontSize="11" fontWeight="800" fill={accent} textAnchor="middle">CUT = shorter path</text>
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 280 140" className="picture-puzzle-svg">
          <rect width="280" height="140" rx="16" fill="var(--surface2)" />
          <text x="140" y="75" fontSize="20" fontWeight="900" fill="var(--text)" textAnchor="middle">PICTURE PUZZLE</text>
        </svg>
      );
  }
}

const PICTURE_PUZZLE_BANK = [
  {
    id: 'pp-1',
    visualType: 'rebus_understand',
    title: 'The Stance Over Letter',
    category: '🔤 Wordplay Rebus',
    prompt: 'Examine the visual arrangement carefully. The word "STAND" is positioned directly over the letter "I".',
    question: 'What famous English phrase or word is visually depicted?',
    options: ['I Understand', 'Stand Beside Me', 'One Night Stand', 'Stand Alone'],
    answer: 'I Understand',
    breakdown: 'Literally: "STAND" is OVER the letter "I", which translates phonetically & logically to "I UNDER STAND" -> "I Understand"!',
  },
  {
    id: 'pp-2',
    visualType: 'rebus_head_heels',
    title: 'The Anatomy Inversion',
    category: '🔤 Wordplay Rebus',
    prompt: 'Notice the vertical arrangement of the two body part words.',
    question: 'Which popular romantic or excited idiom is depicted here?',
    options: ['Head Over Heels', 'Heel to Toe', 'Two Left Feet', 'Over My Dead Body'],
    answer: 'Head Over Heels',
    breakdown: '"HEAD" is placed OVER "HEELS", depicting the idiom "Head over heels" (deeply in love or ecstatic)!',
  },
  {
    id: 'pp-3',
    visualType: 'rebus_blind_mice',
    title: 'The Missing Vowel Mystery',
    category: '🐭 Visual Cryptic',
    prompt: 'The word "MICE" has lost its letter "I", leaving "M_CE", repeated 3 times.',
    question: 'What nursery rhyme riddle does this symbolize?',
    options: ['Three Blind Mice', 'Cat and Mouse', 'Quiet as a Mouse', 'Mickey Mouse'],
    answer: 'Three Blind Mice',
    breakdown: 'They are 3 mice with NO "I"s (no eyes) — literally "Three Blind Mice"!',
  },
  {
    id: 'pp-4',
    visualType: 'rebus_half_time',
    title: 'The Chrono Division',
    category: '⏱️ Sports & Time',
    prompt: 'The word "TIME" has been sliced right in half by scissors.',
    question: 'Which common sports intermission or period is depicted?',
    options: ['Half Time', 'Time Out', 'Overtime', 'Break Time'],
    answer: 'Half Time',
    breakdown: 'The word TIME is cut in half — "Half Time"!',
  },
  {
    id: 'pp-5',
    visualType: 'rebus_reading_between',
    title: 'The Bordered Prose',
    category: '📖 Idioms',
    prompt: 'The word "READING" is placed snugly between two thick parallel horizontal lines.',
    question: 'What literary or detective idiom does this represent?',
    options: ['Reading Between the Lines', 'Line of Sight', 'Read My Lips', 'Bottom Line'],
    answer: 'Reading Between the Lines',
    breakdown: 'The text "READING" is physically placed BETWEEN two LINES = "Reading between the lines"!',
  },
  {
    id: 'pp-6',
    visualType: 'rebus_one_in_million',
    title: 'The Numeric Core',
    category: '💎 Rarities',
    prompt: 'A bold digit "1" is inserted directly inside the letters of "MILLION" (M - 1 - LLION).',
    question: 'What idiom signifies a truly rare and extraordinary person or occurrence?',
    options: ['One in a Million', 'Million Dollar Baby', 'First in Line', 'Ten to One'],
    answer: 'One in a Million',
    breakdown: 'The digit "1" is literally INSIDE the word "MILLION" = "One in a million"!',
  },
  {
    id: 'pp-7',
    visualType: 'rebus_tricycle',
    title: 'The Triple Repetition',
    category: '🚲 Vehicles',
    prompt: 'The word "CYCLE" appears stacked exactly 3 times.',
    question: 'What three-wheeled mode of transport is visually coded?',
    options: ['Tricycle', 'Bicycle', 'Motorcycle', 'Unicycle'],
    answer: 'Tricycle',
    breakdown: 'Three (Tri) cycles = Tricycle!',
  },
  {
    id: 'pp-8',
    visualType: 'rebus_mind_matter',
    title: 'The Willpower Division',
    category: '🧠 Philosophy',
    prompt: 'The word "MIND" is printed directly above a horizontal divider over "MATTER".',
    question: 'What famous phrase expressing willpower over physical pain or fatigue is shown?',
    options: ['Mind Over Matter', 'Matters of the Mind', 'State of Mind', 'Never Mind'],
    answer: 'Mind Over Matter',
    breakdown: '"MIND" placed over "MATTER" directly translates to the adage "Mind over matter"!',
  },
  {
    id: 'pp-9',
    visualType: 'equation_fruits',
    title: 'The Fruit Equation Trap',
    category: '🔢 Visual Math',
    prompt: 'Carefully look at the counts: 3 Apples = 30 (Apple = 10). Apple(10) + 4 Bananas + 4 Bananas = 18 (4-banana bunch = 4, so 1 banana = 1). 4 Bananas - 2 Coconut halves = 2 (Coconut half = 1). What is: 1 Coconut half + 1 Apple + 3 Bananas?',
    question: 'Calculate the final visual value (1 Coconut + 1 Apple + 3 Bananas):',
    options: ['14', '15', '16', '13'],
    answer: '14',
    breakdown: 'Apple = 10. 1 Banana = 1 (bunch of 3 = 3). 1 Coconut half = 1. Therefore: 1 + 10 + 3 = 14!',
  },
  {
    id: 'pp-10',
    visualType: 'equation_shapes',
    title: 'The Order of Operations Shapes',
    category: '🔢 Visual Math',
    prompt: 'Three Triangles sum to 15 (🔺 = 5). 🔺(5) + 🟦 + 🟦 = 21 (🟦 = 8). 🟦(8) - 🟢 = 5 (🟢 = 3). Remember PEMDAS for: 🟢 + 🔺 × 🟦',
    question: 'What is the evaluated result of 🟢 + 🔺 × 🟦 ?',
    options: ['43', '64', '35', '48'],
    answer: '43',
    breakdown: '🔺 = 5, 🟦 = 8, 🟢 = 3. Using multiplication first: 3 + (5 × 8) = 3 + 40 = 43! (Beware adding 3 + 5 first, which gives 64).',
  },
  {
    id: 'pp-11',
    visualType: 'triangle_count',
    title: 'The Triangle Subdivision',
    category: '📐 Geometric Count',
    prompt: 'Count all triangles formed in this subdivided structure: 1 large outer triangle, a central vertical bisector, and a horizontal bar dividing the upper and lower halves.',
    question: 'How many total triangles exist in this diagram?',
    options: ['6', '4', '8', '5'],
    answer: '6',
    breakdown: 'Small top-left (1), small top-right (2), combined top triangle (3), left half full height (4), right half full height (5), and the total outer large triangle (6). Exactly 6 triangles!',
  },
  {
    id: 'pp-12',
    visualType: 'rebus_touchdown',
    title: 'The Downward Motion',
    category: '🏈 Sports',
    prompt: 'The word "TOUCH" is paired with a prominent arrow pointing straight downward.',
    question: 'Which iconic six-point score in American Football is depicted?',
    options: ['Touchdown', 'Drop Kick', 'Touch and Go', 'Fumble'],
    answer: 'Touchdown',
    breakdown: 'Word "TOUCH" + arrow pointing "DOWN" = Touchdown!',
  },
  {
    id: 'pp-13',
    visualType: 'rebus_green_envy',
    title: 'The Chromatic Jealousy',
    category: '🎨 Colors & Idioms',
    prompt: 'The word "ENVY" is painted in bright green text inside an emerald badge.',
    question: 'What expression depicts extreme jealousy or covetousness?',
    options: ['Green with Envy', 'Green Thumb', 'Jealous Heart', 'In the Green'],
    answer: 'Green with Envy',
    breakdown: 'The word ENVY rendered in GREEN = "Green with envy"!',
  },
  {
    id: 'pp-14',
    visualType: 'rebus_growing_economy',
    title: 'The Ascending Scale',
    category: '📈 Business',
    prompt: 'The letters of "ECONOMY" start tiny and expand in font size as an arrow trends upward.',
    question: 'What financial or national milestone is visually represented?',
    options: ['Growing Economy', 'Economic Inflation', 'Stock Crash', 'Tax Rise'],
    answer: 'Growing Economy',
    breakdown: 'The letters physically grow larger with an ascending trendline = "Growing economy"!',
  },
  {
    id: 'pp-15',
    visualType: 'rebus_crossroads',
    title: 'The Intersecting Trajectories',
    category: '🛣️ Roads & Choices',
    prompt: 'Two instances of the word "ROAD" are shown crossed out with thick red bars.',
    question: 'What critical decision point or junction does this represent?',
    options: ['Crossroads', 'Dead End', 'Roadblock', 'Double Highway'],
    answer: 'Crossroads',
    breakdown: 'Crossed roads = Crossroads (a pivotal decision point in life)!',
  },
  {
    id: 'pp-16',
    visualType: 'rebus_sandbox',
    title: 'The Contained Grain',
    category: '🏖️ Play & Tech',
    prompt: 'The word "SAND" is encased inside a neat rectangular boundary frame.',
    question: 'What childhood play area (or developer testing environment) is shown?',
    answer: 'Sandbox',
    options: ['Sandbox', 'Sandcastle', 'Quicksand', 'Sandbar'],
    breakdown: 'The word "SAND" inside a "BOX" = Sandbox!',
  },
  {
    id: 'pp-17',
    visualType: 'rebus_scrambled_eggs',
    title: 'The Tumbled Breakfast',
    category: '🍳 Culinary',
    prompt: 'The letters of the word "EGGS" are shaken, tilted, and jumbled across the frame.',
    question: 'Which popular skillet breakfast dish is pictured?',
    options: ['Scrambled Eggs', 'Boiled Eggs', 'Sunny Side Up', 'Egg Salad'],
    answer: 'Scrambled Eggs',
    breakdown: 'The letters of EGGS are physically scrambled = "Scrambled eggs"!',
  },
  {
    id: 'pp-18',
    visualType: 'rebus_breakfast',
    title: 'The Dashed Partition',
    category: '🥞 Morning Meals',
    prompt: 'The word "BREAK" sits immediately before a fast-moving "FAST".',
    question: 'What morning meal takes its name from breaking the overnight fasting period?',
    options: ['Breakfast', 'Brunch', 'Intermittent Fast', 'Fast Food'],
    answer: 'Breakfast',
    breakdown: 'BREAK + FAST = Breakfast (breaking the fast)!',
  },
  {
    id: 'pp-19',
    visualType: 'rebus_neon_lights',
    title: 'The Noble Gas Luminescence',
    category: '💡 Signs & Science',
    prompt: 'The word "LIGHTS" glows with an electric cyan halo, referencing Element #10 on the periodic table.',
    question: 'What vibrant urban sign fixture is depicted?',
    options: ['Neon Lights', 'LED Bulbs', 'Street Lamps', 'Fluorescent Tube'],
    answer: 'Neon Lights',
    breakdown: 'Element #10 (Neon) illuminating the word LIGHTS = Neon Lights!',
  },
  {
    id: 'pp-20',
    visualType: 'rebus_painless',
    title: 'The Vanishing Hurt',
    category: '🩹 Medical & Wellbeing',
    prompt: 'The word "PAIN" is followed by three subtractions (less and less until zero).',
    question: 'What adjective describes a medical procedure or experience free of discomfort?',
    options: ['Painless', 'Painful', 'Painkiller', 'Numbness'],
    answer: 'Painless',
    breakdown: 'PAIN with LESS = Painless!',
  },
  {
    id: 'pp-21',
    visualType: 'rebus_brainstorm',
    title: 'The Electric Mind',
    category: '🌩️ Weather & Mind',
    prompt: 'The word "BRAIN" appears at the top with lightning bolts and storm clouds erupting from it.',
    question: 'What creative group-thinking session is visually depicted?',
    options: ['Brainstorm', 'Mind Melt', 'Brain Freeze', 'Shock Therapy'],
    answer: 'Brainstorm',
    breakdown: 'BRAIN + STORM (lightning/thunder) = Brainstorm — a session to generate creative ideas!',
  },
  {
    id: 'pp-22',
    visualType: 'rebus_firefly',
    title: 'The Glowing Insect',
    category: '🪲 Nature',
    prompt: 'The word "FIRE" is on the left side, and a glowing beetle-like insect floats on the right side, lit up like a lantern.',
    question: 'What luminous summertime insect is shown?',
    options: ['Firefly', 'Glowworm', 'Dragonfly', 'Fireant'],
    answer: 'Firefly',
    breakdown: 'FIRE + FLY (glowing flying insect) = Firefly — the bioluminescent beetle!',
  },
  {
    id: 'pp-23',
    visualType: 'rebus_overtime',
    title: 'The Extra Period',
    category: '⏰ Sports & Work',
    prompt: 'The word "TIME" sits below a horizontal divider. Above the line reads "ABOVE" indicating position.',
    question: 'What extended period in sports or extra work hours is shown?',
    options: ['Overtime', 'Extra Time', 'Half Time', 'Deadline'],
    answer: 'Overtime',
    breakdown: 'OVER (above the line) + TIME (below) = Overtime — working beyond scheduled hours!',
  },
  {
    id: 'pp-24',
    visualType: 'rebus_upside_down',
    title: 'The Inverted Word',
    category: '🔃 Orientation',
    prompt: 'The word "DOWN" is printed upside-down (rotated 180°), with a vertical flip indicator arrow.',
    question: 'What directional phrase describes this inverted state?',
    options: ['Upside Down', 'Turned Around', 'Inside Out', 'Back to Front'],
    answer: 'Upside Down',
    breakdown: 'The word DOWN is flipped UPSIDE = Upside Down!',
  },
  {
    id: 'pp-25',
    visualType: 'rebus_backseat_driver',
    title: 'The Car Controller',
    category: '🚗 Driving Idioms',
    prompt: 'A car symbol sits front-center labeled DRIVER, and the word BACK points to the rear seat position of the car.',
    question: 'What term describes someone who annoyingly gives directions from the rear?',
    options: ['Backseat Driver', 'Road Rage', 'Auto Pilot', 'Passenger Control'],
    answer: 'Backseat Driver',
    breakdown: 'BACK (seat position) + DRIVER (in a car) = Backseat driver — someone giving unsolicited instructions!',
  },
  {
    id: 'pp-26',
    visualType: 'rebus_diamond_ring',
    title: 'The Gem Band',
    category: '💍 Jewelry',
    prompt: 'A sharp diamond polygon shape sits above a circular ring band outline.',
    question: 'What classic piece of jewelry is shown?',
    options: ['Diamond Ring', 'Engagement Ring', 'Crystal Crown', 'Ruby Bracelet'],
    answer: 'Diamond Ring',
    breakdown: 'DIAMOND (gem shape) + RING (circular band) = Diamond Ring!',
  },
  {
    id: 'pp-27',
    visualType: 'rebus_double_check',
    title: 'The Dual Verification',
    category: '✅ Verification',
    prompt: 'Two identical large green checkmarks appear side by side.',
    question: 'What phrase meaning to verify something twice is shown?',
    options: ['Double Check', 'Two Ticks', 'Verified Twice', 'Checkmate'],
    answer: 'Double Check',
    breakdown: 'DOUBLE (two) + CHECK (✓✓ marks) = Double Check — to verify twice for certainty!',
  },
  {
    id: 'pp-28',
    visualType: 'rebus_weather_forecast',
    title: 'The Prediction Board',
    category: '🌤️ Meteorology',
    prompt: 'A storm cloud transitions via arrow to a sunshine emoji, with the word CAST indicated below.',
    question: 'What meteorological prediction service is depicted?',
    options: ['Weather Forecast', 'Storm Warning', 'Climate Report', 'Sun Prediction'],
    answer: 'Weather Forecast',
    breakdown: 'WEATHER (storm → sun conditions) + FORE-CAST (predicted ahead) = Weather Forecast!',
  },
  {
    id: 'pp-29',
    visualType: 'rebus_flat_broke',
    title: 'The Empty Wallet',
    category: '💸 Money Idioms',
    prompt: 'The word "FLAT" is placed next to the cracked, shattered word "BROKE" on a dashed line.',
    question: 'What idiom means completely out of money?',
    options: ['Flat Broke', 'Stone Cold', 'Coin Toss', 'Empty Purse'],
    answer: 'Flat Broke',
    breakdown: 'FLAT (completely, as in flat out) + BROKE (no money) = Flat Broke — completely penniless!',
  },
  {
    id: 'pp-30',
    visualType: 'rebus_shortcut',
    title: 'The Diagonal Path',
    category: '🛣️ Efficiency',
    prompt: 'A long dashed route goes straight across at the top, but a curved arc swoops diagonally as a shorter path below — labeled CUT.',
    question: 'What term for a faster alternative route is shown?',
    options: ['Shortcut', 'Bypass', 'Quick Path', 'Sprint Route'],
    answer: 'Shortcut',
    breakdown: 'SHORT (smaller curved path) + CUT (direct slice through distance) = Shortcut!',
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

function getVisualRank(solved, total) {
  const ratio = solved / total;
  if (ratio === 1.0) return { title: 'Visual Virtuoso', badge: '🦅', desc: 'Flawless visual decoding across all 10 puzzles!' };
  if (ratio >= 0.8) return { title: 'Rebus Mastermind', badge: '🎨', desc: 'Exceptional optical and lateral reasoning!' };
  if (ratio >= 0.6) return { title: 'Eagle-Eyed Sleuth', badge: '👁️', desc: 'Sharp perception and strong wordplay decoding!' };
  if (ratio >= 0.4) return { title: 'Apprentice Observer', badge: '🔎', desc: 'Good visual instincts, keep training your eyes!' };
  return { title: 'Visual Novice', badge: '🖼️', desc: 'Look beyond the surface lines and try again!' };
}

export default function PicturePuzzle({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready');
  const [puzzles, setPuzzles] = useState(() => shuffleArray(PICTURE_PUZZLE_BANK).slice(0, QUESTIONS_PER_ROUND));
  const [pIdx, setPIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [history, setHistory] = useState([]);

  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const currentP = puzzles[pIdx] || puzzles[0];

  const shuffledOptions = React.useMemo(() => {
    if (!currentP) return [];
    return shuffleArray(currentP.options);
  }, [currentP]);

  const handleSelect = (opt) => {
    if (selectedOpt !== null || gameState !== 'playing') return;
    setSelectedOpt(opt);

    const isCorrect = opt === currentP.answer;
    setHistory(prev => [
      ...prev,
      {
        title: currentP.title,
        category: currentP.category,
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
      if (onSaveScore) onSaveScore('picturePuzzle', newScore);
    } else {
      sound.playWrong();
    }
  };

  const handleNextPuzzle = () => {
    if (pIdx + 1 < puzzles.length) {
      setPIdx(i => i + 1);
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
    const newPuzzles = shuffleArray(PICTURE_PUZZLE_BANK).slice(0, QUESTIONS_PER_ROUND);
    setPuzzles(newPuzzles);
    setScore(0);
    setSolved(0);
    setPIdx(0);
    setSelectedOpt(null);
    setHistory([]);
    setGameState('playing');
  };

  const rank = getVisualRank(solved, puzzles.length);

  return (
    <div className="screen mini-game-screen picture-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />

      {/* Nav Bar */}
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>← Hub</button>
        <div className="mini-game-title">🖼️ Picture Puzzle</div>
        <div className="hud-badge-compact">Solved: {solved}/{puzzles.length}</div>
      </div>

      {/* Ready Screen */}
      {gameState === 'ready' && (
        <div className="mini-card ready-modal animate-pop">
          <div className="mode-badge-pop" style={{ background: 'var(--mint-soft)', color: 'var(--mint)' }}>
            Rebus &amp; Visual Logic · 10 Puzzles
          </div>
          <h2>Picture Puzzle</h2>
          <p className="ready-desc">
            Decode clever visual wordplay, optical equations, geometric counts, and iconic rebus pictograms!
          </p>
          <div className="rules-grid">
            <div className="rule-item">🎨 10 Visual Enigma puzzles per session</div>
            <div className="rule-item">🔤 Rebus wordplay and positional idioms</div>
            <div className="rule-item">🔢 Visual symbolic equations &amp; count riddles</div>
            <div className="rule-item">🏆 200 pts per solved puzzle (Max 2000 pts)</div>
          </div>
          <button className="btn-start-mini" style={{ background: 'var(--mint)' }} onClick={startGame}>
            <span>Start Picture Gauntlet (10 Puzzles)</span> →
          </button>
        </div>
      )}

      {/* Playing Screen */}
      {gameState === 'playing' && currentP && (
        <div className="picture-play-area">
          {/* Progress Strip */}
          <div className="picture-dots-strip" role="status" aria-label="Picture Puzzle Progress">
            {puzzles.map((p, i) => {
              const h = history[i];
              const isCurrent = i === pIdx;
              let dotClass = 'dot-pending';
              let dotContent = i + 1;
              if (h) {
                dotClass = h.isCorrect ? 'dot-solved' : 'dot-wrong';
                dotContent = h.isCorrect ? '✓' : '✗';
              } else if (isCurrent) {
                dotClass = 'dot-current-picture';
              }
              return (
                <div key={i} className={`case-dot ${dotClass}`} title={p.title}>
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
              <span className="lbl">Puzzle</span>
              <span className="val">{pIdx + 1} of {puzzles.length}</span>
            </div>
            <div className="hud-badge" style={{ borderColor: 'var(--mint)' }}>
              <span className="val" style={{ fontSize: '0.75rem', color: 'var(--mint)' }}>{currentP.category}</span>
            </div>
          </div>

          {/* Picture Card */}
          <div className="picture-card animate-pop">
            <div className="picture-card-header">
              <span className="picture-stamp">VISUAL EVIDENCE</span>
              <h3 className="picture-card-title">{currentP.title}</h3>
            </div>

            {/* Visual Canvas Artwork */}
            <div className="picture-canvas-wrap">
              <VisualArtwork visualType={currentP.visualType} accent="var(--mint)" />
            </div>

            <p className="picture-prompt-text">{currentP.prompt}</p>

            <div className="picture-target-question">
              <strong>Question:</strong> {currentP.question}
            </div>
          </div>

          {/* Options Grid */}
          <div className="picture-options-grid">
            {shuffledOptions.map((opt, idx) => {
              const isSelected = selectedOpt === opt;
              const isCorrect = opt === currentP.answer;
              let stateClass = '';
              if (selectedOpt !== null) {
                if (isSelected) stateClass = isCorrect ? 'pic-opt-correct' : 'pic-opt-wrong';
                else if (isCorrect) stateClass = 'pic-opt-revealed';
              }

              return (
                <button
                  key={idx}
                  className={`btn-picture-opt ${stateClass}`}
                  onClick={() => handleSelect(opt)}
                  disabled={selectedOpt !== null}
                >
                  <span className="opt-letter-tag">{['A', 'B', 'C', 'D'][idx]}</span>
                  <span className="picture-opt-text">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Breakdown Reveal */}
          {selectedOpt !== null && (
            <div className="picture-breakdown-card animate-pop">
              <div className="breakdown-title" style={{ color: selectedOpt === currentP.answer ? 'var(--mint)' : 'var(--coral)' }}>
                {selectedOpt === currentP.answer ? '✅ Visual Code Solved!' : '❌ Incorrect Interpretation'}
              </div>
              <p className="breakdown-text">{currentP.breakdown}</p>
              <button className="btn-next-picture" onClick={handleNextPuzzle}>
                {pIdx + 1 < puzzles.length ? `Next Picture Puzzle (${pIdx + 2}/10) ➔` : 'Final Picture Dossier Report ➔'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Completed Screen */}
      {gameState === 'completed' && (
        <div className="detective-results-modal animate-pop" style={{ borderColor: 'var(--mint)' }}>
          <div className="dossier-stamp" style={{ background: 'var(--mint-soft)', color: 'var(--mint)', alignSelf: 'center', fontSize: '0.8rem', padding: '4px 14px' }}>
            VISUAL REBUS DOSSIER COMPLETED · 10 PUZZLES
          </div>

          <div className="det-rank-badge-wrap">
            <span className="det-rank-icon">{rank.badge}</span>
            <h2 className="det-rank-title">{rank.title}</h2>
            <p className="det-rank-desc">{rank.desc}</p>
          </div>

          {/* Stats Grid */}
          <div className="det-results-metrics">
            <div className="det-metric-box">
              <span className="lbl">Solved</span>
              <span className="val" style={{ color: 'var(--mint)' }}>{solved} / {puzzles.length}</span>
            </div>
            <div className="det-metric-box">
              <span className="lbl">Accuracy</span>
              <span className="val">{Math.round((solved / puzzles.length) * 100)}%</span>
            </div>
            <div className="det-metric-box">
              <span className="lbl">Score</span>
              <span className="val" style={{ color: 'var(--mint)' }}>{score}</span>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="det-summary-panel">
            <h4 className="det-summary-heading">Visual Puzzle Log</h4>
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
                    {item.isCorrect ? '✅ Solved' : '❌ Missed'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="det-results-actions">
            <button className="btn-det-action" style={{ background: 'var(--mint)', color: '#fff' }} onClick={startGame}>
              <span>New Picture Gauntlet</span> 🔄
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
