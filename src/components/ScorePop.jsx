import { useState, useEffect, useRef } from 'react';

// BUG FIX #4: Use a ref to always read the latest `points` value
// without making it a useEffect dependency (which would re-fire on every render).
export default function ScorePop({ points, trigger }) {
  const [pops, setPops] = useState([]);
  const pointsRef = useRef(points);

  // Keep ref current without re-triggering the effect
  useEffect(() => { pointsRef.current = points; });

  useEffect(() => {
    if (!trigger) return;
    const latestPts = pointsRef.current;
    if (!latestPts) return;

    const id = Date.now();
    setPops(prev => [...prev, { id, pts: latestPts }]);
    const t = setTimeout(() => setPops(prev => prev.filter(p => p.id !== id)), 1000);
    return () => clearTimeout(t);
  }, [trigger]); // only re-runs when trigger changes (i.e. on each correct answer)

  return (
    <div className="score-pop-container" aria-live="polite">
      {pops.map(pop => (
        <div key={pop.id} className="score-pop">
          +{pop.pts}
        </div>
      ))}
    </div>
  );
}
