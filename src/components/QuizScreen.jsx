import Confetti  from './Confetti';
import ScorePop  from './ScorePop';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const CAT_COLORS = {
  math:    '#7c3aed',
  logical: '#2563eb',
  verbal:  '#059669',
  series:  '#d97706',
  spatial: '#db2777',
};
const CAT_LABELS = {
  math: '➕ Math', logical: '🔗 Logical', verbal: '📖 Verbal',
  series: '🔢 Series', spatial: '🔷 Spatial',
};

// ── Progress dots ──────────────────────────────────────────
function ProgressDots({ total, current }) {
  return (
    <div className="progress-dots">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`dot ${i < current ? 'done' : i === current ? 'active' : ''}`}
        />
      ))}
    </div>
  );
}

// ── Hearts ─────────────────────────────────────────────────
function Hearts({ lives, max }) {
  return (
    <div className="hearts">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`heart ${i < lives ? 'alive' : 'dead'}`}>
          {i < lives ? '❤️' : '🖤'}
        </span>
      ))}
    </div>
  );
}

// ── Power-up button ────────────────────────────────────────
function PowerBtn({ icon, label, available, onClick, title }) {
  return (
    <button
      className={`power-btn ${available ? 'available' : 'used'}`}
      onClick={onClick}
      disabled={!available}
      title={title}
    >
      <span className="power-icon">{icon}</span>
      <span className="power-label">{label}</span>
    </button>
  );
}

// ── Streak badge ───────────────────────────────────────────
function StreakBadge({ streak }) {
  if (streak === 0) return null;
  const multiplier = streak >= 5 ? '×1.5' : streak >= 3 ? '×1.25' : null;
  return (
    <div className={`streak-badge ${streak >= 5 ? 'ultra' : streak >= 3 ? 'hot' : ''}`}>
      🔥 {streak}
      {multiplier && <span className="streak-mult">{multiplier}</span>}
    </div>
  );
}

// ── Main QuizScreen ────────────────────────────────────────
export default function QuizScreen({
  question, qIndex, total, score, streak, lives, maxLives,
  timeLeft, maxTime, feedback, eliminatedOpts, shakeOpt,
  powerups, lastPts, scoreTrigger,
  onAnswer, onFiftyFifty, onTimeBoost, onSkip, onQuit,
  streakToast,
}) {
  if (!question) return null;

  const pct      = (timeLeft / maxTime) * 100;
  const isDanger = pct <= 30;
  const isWarn   = pct <= 50 && pct > 30;
  const catColor = CAT_COLORS[question.category] ?? '#7c3aed';

  function getOptionClass(idx) {
    if (eliminatedOpts.includes(idx)) return 'eliminated';
    if (!feedback) return '';
    if (idx === question.answer) return 'reveal';
    if (feedback.selectedIdx === idx) return `wrong ${shakeOpt === idx ? 'shake' : ''}`;
    return '';
  }

  const isEliminated = (idx) => eliminatedOpts.includes(idx);
  const showConfetti = feedback?.type === 'correct';

  return (
    <div className="screen quiz-screen">

      {/* ── HUD row 1: score + streak + quit ── */}
      <div className="hud">
        <div className="hud-left">
          <div className="hud-score">
            ⭐ <span>{score.toLocaleString()}</span>
            <ScorePop points={lastPts} trigger={scoreTrigger} />
          </div>
          <StreakBadge streak={streak} />
        </div>
        <div className="hud-center">
          <ProgressDots total={total} current={qIndex} />
        </div>
        <div className="hud-right">
          <Hearts lives={lives} max={maxLives} />
          <button className="btn-quit" onClick={onQuit}>✕</button>
        </div>
      </div>

      {/* ── Timer bar ── */}
      <div className="timer-bar-wrap">
        <div
          className={`timer-bar ${isDanger ? 'danger' : isWarn ? 'warn' : ''}`}
          style={{ width: `${pct}%` }}
        />
        <span className={`timer-label ${isDanger ? 'timer-danger' : ''}`}>
          {isDanger && '⚠️ '}{timeLeft}s
        </span>
      </div>

      {/* ── Question body ── */}
      <div className="quiz-body">
        <div className="question-card" key={qIndex}>

          {/* Category + Q number */}
          <div className="q-header">
            <span
              className="q-category-badge"
              style={{ background: `${catColor}25`, color: catColor, borderColor: `${catColor}55` }}
            >
              {CAT_LABELS[question.category]}
            </span>
            <span className="q-num-badge">Q {qIndex + 1} / {total}</span>
          </div>

          {/* Question text */}
          <p className="q-text">{question.question}</p>

          {/* Options */}
          <div className="options-grid">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                className={`option-btn ${getOptionClass(idx)}`}
                onClick={() => !isEliminated(idx) && onAnswer(idx)}
                disabled={!!feedback || isEliminated(idx)}
              >
                <span className="option-letter">{OPTION_LETTERS[idx]}</span>
                <span className="option-text">{isEliminated(idx) ? '—' : opt}</span>
              </button>
            ))}
          </div>

          {/* ── Power-ups ── */}
          <div className="powerups-row">
            <PowerBtn
              icon="🎯" label="50:50"
              available={powerups.fifty}
              onClick={onFiftyFifty}
              title="Remove 2 wrong options"
            />
            <PowerBtn
              icon="⚡" label="+8s"
              available={powerups.timeBoost}
              onClick={onTimeBoost}
              title="Add 8 seconds to the timer"
            />
            <PowerBtn
              icon="⏭️" label="Skip"
              available={powerups.skip}
              onClick={onSkip}
              title="Skip this question without penalty"
            />
          </div>
        </div>

        {/* ── Feedback Overlay ── */}
        {feedback && (
          <div className={`feedback-overlay ${feedback.type}`}>
            <Confetti active={showConfetti} />
            <div className="feedback-icon">
              {feedback.type === 'correct' ? '✅' : feedback.type === 'wrong' ? '❌' : '⏱️'}
            </div>
            <div className="feedback-text">
              {feedback.type === 'correct' ? 'Correct! 🎉' : feedback.type === 'wrong' ? 'Wrong!' : 'Time Up! ⌛'}
            </div>
            {feedback.type === 'correct' && (
              <div className="feedback-pts">+{lastPts} pts</div>
            )}
            <div className="feedback-exp">
              {feedback.type !== 'correct' && (
                <><strong style={{ color: '#f1f5f9' }}>Answer: </strong>
                {question.options[question.answer]}<br /></>
              )}
              <small>{question.explanation}</small>
            </div>
          </div>
        )}
      </div>

      {/* ── Streak toast ── */}
      <div className={`streak-toast ${streakToast ? 'show' : ''}`}>
        {streakToast}
      </div>
    </div>
  );
}
