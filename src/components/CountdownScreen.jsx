import { useState, useEffect } from 'react';
import BgOrbs from './BgOrbs';

export default function CountdownScreen({ onDone }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) { onDone(); return; }
    const t = setTimeout(() => setCount(c => c - 1), 900);
    return () => clearTimeout(t);
  }, [count, onDone]);

  return (
    <div className="screen countdown-screen">
      <BgOrbs />
      <div className="countdown-wrap">
        <p className="countdown-label">Get Ready!</p>
        <div className="countdown-num" key={count}>
          {count === 0 ? '🚀' : count}
        </div>
        <p className="countdown-sub">Questions are loading…</p>
      </div>
    </div>
  );
}
