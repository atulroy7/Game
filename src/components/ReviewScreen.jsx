const LETTERS = ['A', 'B', 'C', 'D'];

export default function ReviewScreen({ answers, onBack }) {
  return (
    <div className="screen review-screen">
      <div className="review-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h2>📋 Question Review</h2>
      </div>

      <div className="review-list">
        {answers.map((ans, i) => {
          const isSkipped = ans.skipped;
          let statusType  = ans.timedOut ? 'timeout' : isSkipped ? 'skipped' : ans.correct ? 'correct' : 'wrong';
          let statusLabel = ans.timedOut ? '⏱️ Timed Out' : isSkipped ? '⏭️ Skipped' : ans.correct ? '✅ Correct' : '❌ Wrong';

          return (
            <div key={i} className={`review-item ${statusType}-item`}>
              <div className="review-item-header">
                <span className="review-qnum">Q{i + 1} · {ans.question.category.toUpperCase()}</span>
                <span className={`review-status ${statusType}`}>{statusLabel}</span>
              </div>
              <p className="review-q">{ans.question.question}</p>

              <div className="review-answers">
                {ans.selectedIdx >= 0 && !isSkipped && (
                  <div className="review-ans-row">
                    <span className="lbl">Your Answer:</span>
                    <span className={`val ${ans.correct ? 'green' : 'red'}`}>
                      {LETTERS[ans.selectedIdx]}. {ans.question.options[ans.selectedIdx]}
                    </span>
                  </div>
                )}
                {!ans.correct && !isSkipped && (
                  <div className="review-ans-row">
                    <span className="lbl">Correct:</span>
                    <span className="val green">
                      {LETTERS[ans.question.answer]}. {ans.question.options[ans.question.answer]}
                    </span>
                  </div>
                )}
                {isSkipped && (
                  <div className="review-ans-row">
                    <span className="lbl">Correct:</span>
                    <span className="val green">
                      {LETTERS[ans.question.answer]}. {ans.question.options[ans.question.answer]}
                    </span>
                  </div>
                )}
                {ans.correct && (
                  <div className="review-ans-row">
                    <span className="lbl">Points:</span>
                    <span className="val green">+{ans.pts} pts ✨</span>
                  </div>
                )}
              </div>

              <p className="review-exp">💡 {ans.question.explanation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
