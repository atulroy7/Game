const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const CAT_COLORS = {
  math:    '#7c3aed',
  logical: '#2563eb',
  verbal:  '#059669',
  series:  '#d97706',
  spatial: '#db2777',
};

const CAT_LABELS = {
  math: 'Math', logical: 'Logical', verbal: 'Verbal',
  series: 'Series', spatial: 'Spatial',
};

export default function QuizScreen({
  question, qIndex, total, score, streak, timeLeft, maxTime,
  feedback, onAnswer, onQuit, streakToast,
}) {
  if (!question) return null;

  const pct = (timeLeft / maxTime) * 100;
  const isDanger = pct <= 30;
  const catColor = CAT_COLORS[question.category] ?? '#7c3aed';

  function getOptionClass(idx) {
    if (!feedback) return '';
    if (idx === question.answer) return 'reveal';
    if (feedback.selectedIdx === idx) return 'wrong';
    return '';
  }

  return (
    <div className="screen quiz-screen">

      {/* ── HUD ── */}
      <div className="hud">
        <div className="hud-left">
          <div className="hud-score">⭐ <span>{score}</span></div>
          <div className={`hud-streak ${streak >= 3 ? 'hot' : ''}`}>
            🔥 <span>{streak}</span>
          </div>
        </div>
        <div className="hud-center">{qIndex + 1} / {total}</div>
        <div className="hud-right">
          <button className="btn-quit" onClick={onQuit}>✕ Quit</button>
        </div>
      </div>

      {/* ── Timer bar ── */}
      <div className="timer-bar-wrap">
        <div
          className={`timer-bar ${isDanger ? 'danger' : ''}`}
          style={{ width: `${pct}%` }}
        />
        <span className="timer-label">{timeLeft}s</span>
      </div>

      {/* ── Question ── */}
      <div className="quiz-body">
        <div className="question-card" key={qIndex}>

          {/* Category badge */}
          <span
            className="q-category-badge"
            style={{ background: `${catColor}30`, color: catColor, borderColor: `${catColor}60` }}
          >
            {CAT_LABELS[question.category]}
          </span>

          {/* Question text */}
          <p className="q-text">{question.question}</p>

          {/* Options */}
          <div className="options-grid">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                className={`option-btn ${getOptionClass(idx)}`}
                onClick={() => onAnswer(idx)}
                disabled={!!feedback}
              >
                <span className="option-letter">{OPTION_LETTERS[idx]}</span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* ── Feedback Overlay ── */}
        {feedback && (
          <div className={`feedback-overlay ${feedback.type}`}>
            <div className="feedback-icon">
              {feedback.type === 'correct' ? '✅' : feedback.type === 'wrong' ? '❌' : '⏱️'}
            </div>
            <div className="feedback-text">
              {feedback.type === 'correct' ? 'Correct!' : feedback.type === 'wrong' ? 'Wrong!' : 'Time Up!'}
            </div>
            {feedback.type !== 'correct' && (
              <div className="feedback-exp">
                <strong>Answer:</strong> {question.options[question.answer]}
                <br /><small>{question.explanation}</small>
              </div>
            )}
            {feedback.type === 'correct' && (
              <div className="feedback-exp"><small>{question.explanation}</small></div>
            )}
          </div>
        )}
      </div>

      {/* ── Streak Toast ── */}
      <div className={`streak-toast ${streakToast ? 'show' : ''}`}>
        {streakToast}
      </div>
    </div>
  );
}
