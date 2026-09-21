import { useState, useEffect } from 'react';

// Floating "+150" score pop that animates upward and fades out
export default function ScorePop({ points, trigger }) {
  const [pops, setPops] = useState([]);

  useEffect(() => {
    if (!trigger || !points) return;
    const id = Date.now();
    setPops(prev => [...prev, { id, points }]);
    setTimeout(() => setPops(prev => prev.filter(p => p.id !== id)), 1000);
  }, [trigger]);

  return (
    <div className="score-pop-container" aria-live="polite">
      {pops.map(pop => (
        <div key={pop.id} className="score-pop">
          +{pop.points}
        </div>
      ))}
    </div>
  );
}
