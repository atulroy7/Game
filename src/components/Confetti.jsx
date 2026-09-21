import { useEffect, useState } from 'react';

const COLORS = ['#7c3aed','#a855f7','#f59e0b','#10b981','#3b82f6','#f97316','#ec4899','#06b6d4'];
const SHAPES = ['square', 'circle', 'triangle'];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

export default function Confetti({ active }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) { setParticles([]); return; }

    const ps = Array.from({ length: 52 }, (_, i) => ({
      id: i,
      x: randomBetween(10, 90),           // % from left
      y: randomBetween(20, 60),           // % from top (start)
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      size: randomBetween(7, 14),
      dx: randomBetween(-80, 80),         // horizontal drift px
      dy: randomBetween(-120, -40),       // upward launch px
      delay: randomBetween(0, 0.25),
      rotate: randomBetween(0, 720),
      duration: randomBetween(0.7, 1.2),
    }));
    setParticles(ps);
  }, [active]);

  if (!active || !particles.length) return null;

  return (
    <div className="confetti-container" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className={`confetti-particle confetti-${p.shape}`}
          style={{
            left: `${p.x}%`,
            top:  `${p.y}%`,
            width:  p.shape === 'triangle' ? 0 : p.size,
            height: p.shape === 'triangle' ? 0 : p.size,
            background: p.shape !== 'triangle' ? p.color : 'transparent',
            borderLeft:  p.shape === 'triangle' ? `${p.size/2}px solid transparent` : undefined,
            borderRight: p.shape === 'triangle' ? `${p.size/2}px solid transparent` : undefined,
            borderBottom:p.shape === 'triangle' ? `${p.size}px solid ${p.color}` : undefined,
            borderRadius: p.shape === 'circle' ? '50%' : undefined,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
            '--rotate': `${p.rotate}deg`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
