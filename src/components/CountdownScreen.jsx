import { useState, useEffect } from 'react';
import BgOrbs from './BgOrbs';

export default function CountdownScreen({ onDone, sound }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) { onDone(); return; }
    sound?.playTick();
    const t = setTimeout(() => setCount(c => c - 1), 900);
    return () => clearTimeout(t);
  }, [count, onDone, sound]);

  const labels = { 3: '3', 2: '2', 1: '1', 0: '🚀' };

  return (
    <div className="screen countdown-screen">
      <BgOrbs />
      <div className="countdown-wrap">
        <p className="countdown-label">Get Ready!</p>
        <div className="countdown-num" key={count}>
          {labels[count] ?? count}
        </div>
        <p className="countdown-sub">
          {count === 0 ? 'GO!' : count === 1 ? 'Steady...' : count === 2 ? 'Set...' : 'Ready?'}
        </p>
      </div>
    </div>
  );
}
