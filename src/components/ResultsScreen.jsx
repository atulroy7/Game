import { useEffect, useRef, useState } from 'react';
import BgOrbs from './BgOrbs';

function getGrade(score, total = 10) {
  const pct = (score / (total * 300)) * 100;
  if (pct >= 90) return { label: '🏆 Genius!', color: '#f59e0b' };
  if (pct >= 75) return { label: '🌟 Excellent!', color: '#a855f7' };
  if (pct >= 55) return { label: '👍 Good Job!', color: '#3b82f6' };
  if (pct >= 35) return { label: '📚 Keep Practicing!', color: '#10b981' };
  return { label: '💪 Try Again!', color: '#ef4444' };
}

function getTrophy(score, total = 10) {
  const pct = (score / (total * 300)) * 100;
  if (pct >= 90) return '🏆';
  if (pct >= 70) return '🥇';
  if (pct >= 50) return '🥈';
  if (pct >= 30) return '🥉';
  return '🎮';
}

// Animated counter
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 40);
    const interval = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(interval); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(interval);
  }, [value]);
  return <>{display}</>;
}

export default function ResultsScreen({ score, answers, bestStreak, difficulty, onPlayAgain, onReview }) {
  const correct  = answers.filter(a => a.correct).length;
  const timedOut = answers.filter(a => a.timedOut).length;
  const wrong    = answers.filter(a => !a.correct && !a.timedOut).length;
  const grade    = getGrade(score);
  const trophy   = getTrophy(score);

  return (
    <div className="screen results-screen">
      <BgOrbs />
      <div className="results-wrap">

        <div className="results-trophy">{trophy}</div>
        <h2 className="results-title">Game Over!</h2>

        <div className="results-score-big">
          <AnimatedNumber value={score} />
        </div>
        <p className="results-label">Total Score</p>

        <div className="results-stats">
          <div className="res-stat">
            <span className="res-icon">✅</span>
            <span>{correct}</span>
            <label>Correct</label>
          </div>
          <div className="res-stat">
            <span className="res-icon">❌</span>
            <span>{wrong}</span>
            <label>Wrong</label>
          </div>
          <div className="res-stat">
            <span className="res-icon">⏱️</span>
            <span>{timedOut}</span>
            <label>Timed Out</label>
          </div>
          <div className="res-stat">
            <span className="res-icon">🔥</span>
            <span>{bestStreak}</span>
            <label>Best Streak</label>
          </div>
        </div>

        <div className="results-grade" style={{ color: grade.color, borderColor: grade.color + '80', background: grade.color + '20' }}>
          {grade.label}
        </div>

        <div className="results-btns">
          <button className="btn-secondary" onClick={onReview}>📋 Review</button>
          <button className="btn-start" onClick={onPlayAgain}>Play Again →</button>
        </div>

      </div>
    </div>
  );
}
