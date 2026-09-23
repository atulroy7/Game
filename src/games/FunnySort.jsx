import React, { useState, useMemo } from 'react';
import BgOrbs from '../components/BgOrbs';
import Confetti from '../components/Confetti';
import ScorePop from '../components/ScorePop';

const WORD_CHAIN_ROUNDS = [
  { id:'wc-1', tail:'APPLE', chainSoFar:['APPLE'], category:'Nature', hint:'Starts with E', question:'Which word starts with E?', options:['EAGLE','GRAPE','ORBIT','FLAME'], answer:'EAGLE', fact:'APPLE ends in E, so EAGLE starts with E!' },
  { id:'wc-2', tail:'EAGLE', chainSoFar:['APPLE','EAGLE'], category:'Body Parts', hint:'Starts with E', question:'Which body part starts with E?', options:['ELBOW','FINGER','THUMB','ANKLE'], answer:'ELBOW', fact:'EAGLE ends in E, so ELBOW starts with E!' },
  { id:'wc-3', tail:'ELBOW', chainSoFar:['APPLE','EAGLE','ELBOW'], category:'Animals', hint:'Starts with W', question:'Which animal starts with W?', options:['WHALE','TIGER','SHARK','EAGLE'], answer:'WHALE', fact:'ELBOW ends in W, so WHALE starts with W!' },
  { id:'wc-4', tail:'WHALE', chainSoFar:['APPLE','EAGLE','ELBOW','WHALE'], category:'Astronomy', hint:'Starts with E', question:'Which space event starts with E?', options:['ECLIPSE','NEBULA','COMET','ORBIT'], answer:'ECLIPSE', fact:'WHALE ends in E, so ECLIPSE starts with E!' },
  { id:'wc-5', tail:'ECLIPSE', chainSoFar:['APPLE','EAGLE','ELBOW','WHALE','ECLIPSE'], category:'Art Tools', hint:'Starts with E', question:'Which art tool starts with E?', options:['EASEL','CANVAS','BRUSH','PALETTE'], answer:'EASEL', fact:'ECLIPSE ends in E, so EASEL starts with E!' },
  { id:'wc-6', tail:'EASEL', chainSoFar:['APPLE','EAGLE','ELBOW','WHALE','ECLIPSE','EASEL'], category:'Wild Cats', hint:'Starts with L', question:'Which big cat starts with L?', options:['LEOPARD','CHEETAH','JAGUAR','TIGER'], answer:'LEOPARD', fact:'EASEL ends in L, so LEOPARD starts with L!' },
  { id:'wc-7', tail:'LEOPARD', chainSoFar:['APPLE','EAGLE','ELBOW','WHALE','ECLIPSE','EASEL','LEOPARD'], category:'Geography', hint:'Starts with D', question:'Which geographic term starts with D?', options:['DELTA','FOREST','BEACH','VALLEY'], answer:'DELTA', fact:'LEOPARD ends in D, so DELTA starts with D!' },
  { id:'wc-8', tail:'DELTA', chainSoFar:['APPLE','EAGLE','ELBOW','WHALE','ECLIPSE','EASEL','LEOPARD','DELTA'], category:'Final Link!', hint:'Starts with A', question:'The FINAL link starts with A!', options:['AURORA','BRIDGE','CLOUD','TOWER'], answer:'AURORA', fact:'DELTA ends in A, so AURORA starts with A - northern lights! Chain complete!' },
];

function getRank(correct, total) {
  const r = correct / total;
  if (r === 1) return { icon: '🏆', label: 'Chain Master', desc: 'Flawless! Every link forged perfectly.' };
  if (r >= 0.75) return { icon: '⛓️', label: 'Link Weaver', desc: 'Impressive chain-building instincts!' };
  if (r >= 0.5) return { icon: '🔗', label: 'Chain Keeper', desc: 'Solid effort - a few links slipped.' };
  return { icon: '🪦', label: 'Rookie Linker', desc: 'Keep practicing your word associations!' };
}

export default function WordChain({ sound, onBack, onSaveScore }) {
  const [gameState, setGameState] = useState('ready');
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [history, setHistory] = useState([]);
  const [lastPts, setLastPts] = useState(0);
  const [scoreTrigger, setScoreTrigger] = useState(0);

  const currentRound = WORD_CHAIN_ROUNDS[roundIdx];

  const shuffledOptions = useMemo(() => {
    if (!currentRound) return [];
    const opts = [...currentRound.options];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [roundIdx]);

  const startGame = () => {
    setRoundIdx(0); setScore(0); setCorrect(0);
    setSelectedOpt(null); setHistory([]); setGameState('playing');
  };

  const handleSelect = (opt) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(opt);
    const isCorrect = opt === currentRound.answer;
    setHistory(prev => [...prev, { tail: currentRound.tail, chosen: opt, isCorrect, answer: currentRound.answer }]);
    if (isCorrect) {
      sound.playCorrect();
      const pts = 150, ns = score + pts;
      setScore(ns); setLastPts(pts); setScoreTrigger(t => t + 1); setCorrect(c => c + 1);
      if (onSaveScore) onSaveScore('funnySort', ns);
    } else { sound.playWrong(); }
  };

  const handleNext = () => {
    if (roundIdx + 1 >= WORD_CHAIN_ROUNDS.length) {
      setGameState('gameover');
      if (correct >= 6) sound.playStreak(); else sound.playCorrect();
    } else { setRoundIdx(i => i + 1); setSelectedOpt(null); }
  };

  const rank = getRank(correct, WORD_CHAIN_ROUNDS.length);

  return (
    <div className="screen mini-game-screen wc-screen">
      <BgOrbs />
      <ScorePop points={lastPts} trigger={scoreTrigger} />
      <div className="game-nav-bar">
        <button className="btn-back" onClick={onBack}>&larr; Hub</button>
        <div className="mini-game-title">⛓️ Word Chain</div>
        <div className="hud-badge-compact">Link {Math.min(roundIdx + 1, 8)} / 8</div>
      </div>

      {gameState === 'ready' && (
        <div className="mini-card ready-modal">
          <div className="mode-badge-pop" style={{ background:'var(--mint-soft)', color:'var(--mint)' }}>Word Association Chain &middot; 8 Links</div>
          <h2>Word Chain ⛓️</h2>
          <p className="ready-desc">Each word must <strong>start with the last letter</strong> of the previous word. Pick the correct link to extend the chain!</p>
          <div className="rules-grid">
            <div className="rule-item">⛓️ Each answer links to last letter</div>
            <div className="rule-item">💡 Category hints guide each round</div>
            <div className="rule-item">⭐ 150 pts per correct link</div>
            <div className="rule-item">🏆 8 rounds &mdash; chain them all!</div>
          </div>
          <button className="btn-start-mini" style={{ background:'var(--mint)' }} onClick={startGame}><span>Start the Chain</span> &rarr;</button>
        </div>
      )}

      {gameState === 'playing' && currentRound && (
        <div className="wc-play-area">
          <div className="hud-strip">
            <div className="hud-badge"><span className="lbl">Score</span><span className="val">{score}</span></div>
            <div className="hud-badge"><span className="lbl">Category</span><span className="val" style={{ fontSize:'0.75rem' }}>{currentRound.category}</span></div>
          </div>
          <div className="wc-chain-bar">
            {currentRound.chainSoFar.map((word, i) => (
              <React.Fragment key={i}>
                <div className={'wc-chain-link ' + (i === currentRound.chainSoFar.length - 1 ? 'chain-link-active' : 'chain-link-done')}>{word}</div>
                {i < currentRound.chainSoFar.length - 1 && <div className="wc-chain-connector">&rarr;</div>}
              </React.Fragment>
            ))}
            <div className="wc-chain-connector">&rarr;</div>
            <div className="wc-chain-link chain-link-unknown">?</div>
          </div>
          <div className="wc-question-card">
            <div className="wc-hint-badge">💡 {currentRound.hint}</div>
            <p className="wc-question-text">{currentRound.question}</p>
          </div>
          <div className="wc-options-grid">
            {shuffledOptions.map((opt, i) => {
              const isSelected = selectedOpt === opt, isCorrect = opt === currentRound.answer;
              let cls = 'btn-wc-opt';
              if (selectedOpt !== null) {
                if (isSelected && isCorrect) cls += ' wc-correct';
                else if (isSelected && !isCorrect) cls += ' wc-wrong';
                else if (!isSelected && isCorrect) cls += ' wc-revealed';
              }
              return (
                <button key={i} className={cls} onClick={() => handleSelect(opt)} disabled={selectedOpt !== null}>
                  <span className="wc-opt-letter">{['A','B','C','D'][i]}</span>
                  <span className="wc-opt-word">{opt}</span>
                </button>
              );
            })}
          </div>
          {selectedOpt !== null && (
            <div className="wc-breakdown animate-pop">
              <div className={'wc-result-tag ' + (selectedOpt === currentRound.answer ? 'res-correct' : 'res-wrong')}>
                {selectedOpt === currentRound.answer ? '🔗 Link Forged!' : '💔 Chain Broken!'}
              </div>
              <p className="wc-fact">{currentRound.fact}</p>
              <button className="btn-wc-next" onClick={handleNext}>
                {roundIdx + 1 < WORD_CHAIN_ROUNDS.length ? ('Next Link (' + (roundIdx + 2) + '/8) →') : 'See Final Score →'}
              </button>
            </div>
          )}
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="mini-card gameover-modal">
          {correct >= 6 && <Confetti />}
          <div className="gameover-icon">{rank.icon}</div>
          <h2>{rank.label}</h2>
          <p className="ready-desc">{rank.desc}</p>
          <div className="results-metrics">
            <div className="metric-box"><span className="m-val">{score}</span><span className="m-lbl">Score</span></div>
            <div className="metric-box"><span className="m-val">{correct} / 8</span><span className="m-lbl">Links Correct</span></div>
          </div>
          <div className="wc-history-list">
            {history.map((h, i) => (
              <div key={i} className={'wc-history-item ' + (h.isCorrect ? 'hist-ok' : 'hist-miss')}>
                <span className="hist-num">#{i+1}</span>
                <span className="hist-tail">{h.tail} &rarr;</span>
                <span className="hist-chosen">{h.chosen}</span>
                <span className="hist-status">{h.isCorrect ? '✓' : ('✗ (' + h.answer + ')')}</span>
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button className="btn-play-again" style={{ background:'var(--mint)' }} onClick={startGame}>New Chain ↺</button>
            <button className="btn-hub" onClick={onBack}>Arcade Hub</button>
          </div>
        </div>
      )}
    </div>
  );
}
