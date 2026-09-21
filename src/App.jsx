import { useState, useEffect, useCallback, useRef } from 'react';
import { ALL_QUESTIONS } from './data/questions';
import { useSound } from './hooks/useSound';
import HomeScreen      from './components/HomeScreen';
import CountdownScreen from './components/CountdownScreen';
import QuizScreen      from './components/QuizScreen';
import ResultsScreen   from './components/ResultsScreen';
import ReviewScreen    from './components/ReviewScreen';
import './App.css';

const DIFFICULTY_TIME = { easy: 20, medium: 15, hard: 10 };
const TARGET_QUESTIONS = 10; // desired max; may be less for small categories
const MAX_LIVES        = 3;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadStats() {
  try { return JSON.parse(localStorage.getItem('brainblitz_stats') || '{}'); }
  catch { return {}; }
}
function saveStats(s) { localStorage.setItem('brainblitz_stats', JSON.stringify(s)); }

export default function App() {
  // ── Config ────────────────────────────────────────────
  const [screen,     setScreen]     = useState('home');
  const [difficulty, setDifficulty] = useState('easy');
  const [category,   setCategory]   = useState('all');

  // ── Quiz state ─────────────────────────────────────────
  const [questions,      setQuestions]      = useState([]);
  const [totalQ,         setTotalQ]         = useState(TARGET_QUESTIONS); // actual count for this round
  const [qIndex,         setQIndex]         = useState(0);
  const [score,          setScore]          = useState(0);
  const [streak,         setStreak]         = useState(0);
  const [bestStreak,     setBestStreak]     = useState(0);
  const [timeLeft,       setTimeLeft]       = useState(20);
  const [feedback,       setFeedback]       = useState(null);
  const [answers,        setAnswers]        = useState([]);

  // ── Fun additions ──────────────────────────────────────
  const [lives,          setLives]          = useState(MAX_LIVES);
  const [powerups,       setPowerups]       = useState({ fifty: true, timeBoost: true, skip: true });
  const [eliminatedOpts, setEliminatedOpts] = useState([]);
  const [lastPts,        setLastPts]        = useState(0);
  const [scoreTrigger,   setScoreTrigger]   = useState(0);
  const [streakToast,    setStreakToast]    = useState('');
  const [shakeOpt,       setShakeOpt]       = useState(-1);

  // ── Persistent stats ───────────────────────────────────
  const [stats, setStats] = useState(loadStats);

  // ── Sound ──────────────────────────────────────────────
  const sound = useSound();

  // ── Refs (mutable, always current — no stale-closure issues) ──
  const timerRef     = useRef(null);
  const feedbackRef  = useRef(null);

  // BUG FIX #1: Sync refs updated immediately (not via useEffect)
  // so finishGame always reads the latest values even before React commits.
  const scoreRef     = useRef(0);
  const bestRef      = useRef(0);
  const livesRef     = useRef(MAX_LIVES);
  const qIndexRef    = useRef(0);
  const totalQRef    = useRef(TARGET_QUESTIONS);
  const diffRef      = useRef('easy');

  // Keep diffRef in sync with difficulty state
  useEffect(() => { diffRef.current = difficulty; }, [difficulty]);

  // ─────────────────────────────────────────────────────
  //  FINISH GAME
  //  Called directly — never inside a state updater.
  // ─────────────────────────────────────────────────────
  const finishGame = useCallback(() => {
    clearInterval(timerRef.current);
    clearTimeout(feedbackRef.current);

    // BUG FIX #1: Use refs (sync) not state (async) for final values
    const finalScore = scoreRef.current;
    const finalBest  = bestRef.current;

    const newStats = {
      highScore:   Math.max(stats.highScore  || 0, finalScore),
      gamesPlayed: (stats.gamesPlayed || 0) + 1,
      bestStreak:  Math.max(stats.bestStreak || 0, finalBest),
    };
    setStats(newStats);
    saveStats(newStats);
    setTimeout(() => setScreen('results'), 300);
  }, [stats]);

  // ─────────────────────────────────────────────────────
  //  ADVANCE QUESTION
  //  BUG FIX #2: Never calls finishGame() inside a setState updater.
  // ─────────────────────────────────────────────────────
  const advanceQuestion = useCallback((forceFinish = false) => {
    setFeedback(null);
    setEliminatedOpts([]);
    setShakeOpt(-1);

    const nextIndex = qIndexRef.current + 1;

    // BUG FIX #2: Decide finish BEFORE calling any setState
    if (forceFinish || nextIndex >= totalQRef.current) {
      finishGame();          // plain call — safe, not inside updater
    } else {
      qIndexRef.current = nextIndex;
      setQIndex(nextIndex);
      setTimeLeft(DIFFICULTY_TIME[diffRef.current]);
    }
  }, [finishGame]);

  // ─────────────────────────────────────────────────────
  //  BUILD QUESTION SET
  //  BUG FIX #3: Use actual pool size — never request more than available
  // ─────────────────────────────────────────────────────
  const buildQuestions = useCallback((cat) => {
    const pool = cat === 'all'
      ? ALL_QUESTIONS
      : ALL_QUESTIONS.filter(q => q.category === cat);
    const shuffled = shuffle(pool);
    // BUG FIX #3: Clamp to available questions (Spatial only has 4, etc.)
    return shuffled.slice(0, Math.min(TARGET_QUESTIONS, shuffled.length));
  }, []);

  // ─────────────────────────────────────────────────────
  //  START GAME
  // ─────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    const qs = buildQuestions(category);
    const total = qs.length;

    // Reset all sync refs
    scoreRef.current    = 0;
    bestRef.current     = 0;
    livesRef.current    = MAX_LIVES;
    qIndexRef.current   = 0;
    totalQRef.current   = total;

    setQuestions(qs);
    setTotalQ(total);
    setQIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setAnswers([]);
    setFeedback(null);
    setLives(MAX_LIVES);
    setPowerups({ fifty: true, timeBoost: true, skip: true });
    setEliminatedOpts([]);
    setLastPts(0);
    setScoreTrigger(0);
    setStreakToast('');
    setShakeOpt(-1);
    setScreen('countdown');
  }, [category, buildQuestions]);

  // ─────────────────────────────────────────────────────
  //  AFTER COUNTDOWN
  // ─────────────────────────────────────────────────────
  const beginQuiz = useCallback(() => {
    setTimeLeft(DIFFICULTY_TIME[difficulty]);
    setScreen('quiz');
  }, [difficulty]);

  // ─────────────────────────────────────────────────────
  //  TIMER — TIMEOUT
  // ─────────────────────────────────────────────────────
  const handleTimeout = useCallback(() => {
    if (feedback) return;
    const q = questions[qIndexRef.current];
    if (!q) return;

    sound.playTimeout();

    // BUG FIX #1: Update ref synchronously before using it
    livesRef.current -= 1;
    const newLives = livesRef.current;
    setLives(newLives);
    if (newLives <= 0) sound.playLifeLost();

    setFeedback({ type: 'timeout', selectedIdx: -1 });
    setStreak(0);
    setAnswers(prev => [...prev, {
      question: q, selectedIdx: -1, correct: false, timedOut: true, pts: 0
    }]);

    feedbackRef.current = setTimeout(() => {
      advanceQuestion(newLives <= 0);
    }, 1800);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback, questions, sound, advanceQuestion]);

  useEffect(() => {
    if (screen !== 'quiz' || feedback) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
        if (t <= 5) sound.playTick();
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, feedback, qIndex, handleTimeout, sound]);

  // ─────────────────────────────────────────────────────
  //  ANSWER
  // ─────────────────────────────────────────────────────
  const handleAnswer = useCallback((selectedIdx) => {
    if (feedback) return;
    clearInterval(timerRef.current);
    clearTimeout(feedbackRef.current);

    const q = questions[qIndexRef.current];
    if (!q) return;

    const isCorrect = selectedIdx === q.answer;

    let pts      = 0;
    let newLives = livesRef.current;

    // BUG FIX #5: Compute newStreak FIRST, then apply multiplier
    let newStreak = isCorrect ? streak + 1 : 0;
    let newBest   = Math.max(bestRef.current, newStreak);

    if (isCorrect) {
      const timeBonus  = Math.ceil(timeLeft / 2);
      const diffMult   = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
      // BUG FIX #5: Use newStreak (after increment) for multiplier
      const streakMult = newStreak >= 5 ? 1.5 : newStreak >= 3 ? 1.25 : 1;
      pts = Math.round((100 + timeBonus * 5) * diffMult * streakMult);
      sound.playCorrect();
      setLastPts(pts);
      setScoreTrigger(t => t + 1);
    } else {
      // BUG FIX #1: Decrement ref synchronously
      livesRef.current -= 1;
      newLives = livesRef.current;
      setLives(newLives);
      setShakeOpt(selectedIdx);
      sound.playWrong();
      if (newLives <= 0) sound.playLifeLost();
    }

    // BUG FIX #1: Update score ref synchronously so finishGame reads correct value
    scoreRef.current += pts;
    bestRef.current   = newBest;

    setScore(scoreRef.current);
    setStreak(newStreak);
    setBestStreak(newBest);
    setFeedback({ type: isCorrect ? 'correct' : 'wrong', selectedIdx });
    setAnswers(prev => [...prev, {
      question: q, selectedIdx, correct: isCorrect, timedOut: false, pts
    }]);

    // Streak toast at milestones
    if (isCorrect && newStreak >= 3 && newStreak % 3 === 0) {
      const labels = { 3: 'On Fire! 🔥', 6: 'Unstoppable! 💥', 9: 'Legendary! 👑', 12: 'GODMODE! 🌟' };
      const msg = labels[newStreak] || `${newStreak}× Streak!`;
      setStreakToast(`🔥 ${msg}`);
      sound.playStreak();
      setTimeout(() => setStreakToast(''), 2200);
    }

    feedbackRef.current = setTimeout(() => {
      advanceQuestion(newLives <= 0);
    }, 1800);
  }, [feedback, questions, streak, timeLeft, difficulty, sound, advanceQuestion]);

  // ─────────────────────────────────────────────────────
  //  POWER-UPS
  // ─────────────────────────────────────────────────────
  const handleFiftyFifty = useCallback(() => {
    if (!powerups.fifty || feedback || !questions[qIndexRef.current]) return;
    const q = questions[qIndexRef.current];
    const wrong = q.options
      .map((_, i) => i)
      .filter(i => i !== q.answer && !eliminatedOpts.includes(i));
    setEliminatedOpts(shuffle(wrong).slice(0, 2));
    setPowerups(p => ({ ...p, fifty: false }));
    sound.playPowerup();
  }, [powerups, feedback, questions, eliminatedOpts, sound]);

  const handleTimeBoost = useCallback(() => {
    if (!powerups.timeBoost || feedback) return;
    setTimeLeft(t => Math.min(t + 8, DIFFICULTY_TIME[difficulty] + 8));
    setPowerups(p => ({ ...p, timeBoost: false }));
    sound.playPowerup();
  }, [powerups, feedback, difficulty, sound]);

  const handleSkip = useCallback(() => {
    if (!powerups.skip || feedback) return;
    clearInterval(timerRef.current);
    clearTimeout(feedbackRef.current);
    const q = questions[qIndexRef.current];
    if (!q) return;
    setAnswers(prev => [...prev, {
      question: q, selectedIdx: -2, correct: false, timedOut: false, pts: 0, skipped: true
    }]);
    setPowerups(p => ({ ...p, skip: false }));
    sound.playPowerup();
    advanceQuestion(false);
  }, [powerups, feedback, questions, sound, advanceQuestion]);

  // ─────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="app">
      {screen === 'home' && (
        <HomeScreen
          difficulty={difficulty} setDifficulty={setDifficulty}
          category={category}    setCategory={setCategory}
          onStart={startGame}    stats={stats}
        />
      )}
      {screen === 'countdown' && (
        <CountdownScreen onDone={beginQuiz} sound={sound} />
      )}
      {screen === 'quiz' && (
        <QuizScreen
          question={questions[qIndex]}
          qIndex={qIndex}
          total={totalQ}
          score={score}
          streak={streak}
          lives={lives}
          maxLives={MAX_LIVES}
          timeLeft={timeLeft}
          maxTime={DIFFICULTY_TIME[difficulty]}
          feedback={feedback}
          eliminatedOpts={eliminatedOpts}
          shakeOpt={shakeOpt}
          powerups={powerups}
          lastPts={lastPts}
          scoreTrigger={scoreTrigger}
          onAnswer={handleAnswer}
          onFiftyFifty={handleFiftyFifty}
          onTimeBoost={handleTimeBoost}
          onSkip={handleSkip}
          onQuit={() => {
            clearInterval(timerRef.current);
            clearTimeout(feedbackRef.current);
            setScreen('home');
          }}
          streakToast={streakToast}
        />
      )}
      {screen === 'results' && (
        <ResultsScreen
          score={score}
          answers={answers}
          bestStreak={bestStreak}
          lives={lives}
          difficulty={difficulty}
          onPlayAgain={startGame}
          onReview={() => setScreen('review')}
        />
      )}
      {screen === 'review' && (
        <ReviewScreen answers={answers} onBack={() => setScreen('results')} />
      )}
    </div>
  );
}
