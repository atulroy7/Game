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
const TOTAL_QUESTIONS = 10;
const MAX_LIVES       = 3;

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
  const [questions,       setQuestions]       = useState([]);
  const [qIndex,          setQIndex]          = useState(0);
  const [score,           setScore]           = useState(0);
  const [streak,          setStreak]          = useState(0);
  const [bestStreak,      setBestStreak]      = useState(0);
  const [timeLeft,        setTimeLeft]        = useState(20);
  const [feedback,        setFeedback]        = useState(null);
  const [answers,         setAnswers]         = useState([]);

  // ── Fun additions ──────────────────────────────────────
  const [lives,           setLives]           = useState(MAX_LIVES);
  const [powerups,        setPowerups]        = useState({ fifty: true, timeBoost: true, skip: true });
  const [eliminatedOpts,  setEliminatedOpts]  = useState([]);   // indexes removed by 50:50
  const [lastPts,         setLastPts]         = useState(0);    // for ScorePop
  const [scoreTrigger,    setScoreTrigger]    = useState(0);    // increments to trigger ScorePop
  const [streakToast,     setStreakToast]     = useState('');
  const [shakeOpt,        setShakeOpt]        = useState(-1);   // wrong option to shake

  // ── Stats ──────────────────────────────────────────────
  const [stats, setStats] = useState(loadStats);

  // ── Sound ──────────────────────────────────────────────
  const sound = useSound();

  // ── Refs ───────────────────────────────────────────────
  const timerRef    = useRef(null);
  const feedbackRef = useRef(null);
  const livesRef    = useRef(lives);      // keep a mutable copy to read inside closures
  useEffect(() => { livesRef.current = lives; }, [lives]);

  const scoreRef = useRef(score);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const bestStreakRef = useRef(bestStreak);
  useEffect(() => { bestStreakRef.current = bestStreak; }, [bestStreak]);

  // ─────────────────────────────────────────────────────
  //  Build question set
  // ─────────────────────────────────────────────────────
  const buildQuestions = useCallback((cat) => {
    const pool = cat === 'all' ? ALL_QUESTIONS : ALL_QUESTIONS.filter(q => q.category === cat);
    return shuffle(pool).slice(0, TOTAL_QUESTIONS);
  }, []);

  // ─────────────────────────────────────────────────────
  //  START GAME
  // ─────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    const qs = buildQuestions(category);
    setQuestions(qs);
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
  //  FINISH GAME
  // ─────────────────────────────────────────────────────
  const finishGame = useCallback(() => {
    clearInterval(timerRef.current);
    clearTimeout(feedbackRef.current);
    const finalScore  = scoreRef.current;
    const finalBest   = bestStreakRef.current;
    const newStats = {
      highScore:   Math.max(stats.highScore   || 0, finalScore),
      gamesPlayed: (stats.gamesPlayed || 0) + 1,
      bestStreak:  Math.max(stats.bestStreak  || 0, finalBest),
    };
    setStats(newStats);
    saveStats(newStats);
    setTimeout(() => setScreen('results'), 300);
  }, [stats]);

  // ─────────────────────────────────────────────────────
  //  ADVANCE QUESTION
  // ─────────────────────────────────────────────────────
  const advanceQuestion = useCallback((forceFinish = false) => {
    setFeedback(null);
    setEliminatedOpts([]);
    setShakeOpt(-1);

    setQIndex(i => {
      const next = i + 1;
      if (forceFinish || next >= TOTAL_QUESTIONS) {
        finishGame();
        return i;
      }
      setTimeLeft(DIFFICULTY_TIME[difficulty]);
      return next;
    });
  }, [difficulty, finishGame]);

  // ─────────────────────────────────────────────────────
  //  TIMER
  // ─────────────────────────────────────────────────────
  const handleTimeout = useCallback(() => {
    if (feedback) return;
    const q = questions[qIndex];
    sound.playTimeout();

    const newLives = livesRef.current - 1;
    setLives(newLives);
    if (newLives <= 0) sound.playLifeLost();

    setFeedback({ type: 'timeout', selectedIdx: -1 });
    setStreak(0);
    setAnswers(prev => [...prev, { question: q, selectedIdx: -1, correct: false, timedOut: true, pts: 0 }]);

    feedbackRef.current = setTimeout(() => {
      advanceQuestion(newLives <= 0);
    }, 1800);
  }, [feedback, questions, qIndex, sound, advanceQuestion]);

  useEffect(() => {
    if (screen !== 'quiz' || feedback) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
        // Danger tick sound when ≤ 5s
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

    const q = questions[qIndex];
    const isCorrect = selectedIdx === q.answer;

    let pts       = 0;
    let newStreak = streak;
    let newBest   = bestStreak;
    let newLives  = livesRef.current;

    if (isCorrect) {
      const timeBonus = Math.ceil(timeLeft / 2);
      const diffMult  = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
      const streakMult = newStreak >= 5 ? 1.5 : newStreak >= 3 ? 1.25 : 1;
      pts = Math.round((100 + timeBonus * 5) * diffMult * streakMult);
      newStreak = streak + 1;
      if (newStreak > newBest) newBest = newStreak;
      sound.playCorrect();
      setLastPts(pts);
      setScoreTrigger(t => t + 1);
    } else {
      newStreak = 0;
      newLives  = livesRef.current - 1;
      setLives(newLives);
      setShakeOpt(selectedIdx);
      sound.playWrong();
      if (newLives <= 0) sound.playLifeLost();
    }

    setScore(s => s + pts);
    setStreak(newStreak);
    setBestStreak(newBest);
    setFeedback({ type: isCorrect ? 'correct' : 'wrong', selectedIdx });
    setAnswers(prev => [...prev, { question: q, selectedIdx, correct: isCorrect, timedOut: false, pts }]);

    // Streak toast & sound at milestones
    if (isCorrect && newStreak >= 3 && newStreak % 3 === 0) {
      const labels = { 3:'On Fire! 🔥', 6:'Unstoppable! 💥', 9:'Legendary! 👑', 12:'GODMODE! 🌟' };
      const msg = labels[newStreak] || `${newStreak}× Streak!`;
      setStreakToast(`🔥 ${msg}`);
      sound.playStreak();
      setTimeout(() => setStreakToast(''), 2200);
    }

    feedbackRef.current = setTimeout(() => {
      advanceQuestion(newLives <= 0);
    }, 1800);
  }, [feedback, questions, qIndex, streak, bestStreak, timeLeft, difficulty, sound, advanceQuestion]);

  // ─────────────────────────────────────────────────────
  //  POWER-UPS
  // ─────────────────────────────────────────────────────
  const handleFiftyFifty = useCallback(() => {
    if (!powerups.fifty || feedback || !questions[qIndex]) return;
    const q = questions[qIndex];
    const wrongIndexes = q.options
      .map((_, i) => i)
      .filter(i => i !== q.answer && !eliminatedOpts.includes(i));
    const toRemove = shuffle(wrongIndexes).slice(0, 2);
    setEliminatedOpts(toRemove);
    setPowerups(p => ({ ...p, fifty: false }));
    sound.playPowerup();
  }, [powerups, feedback, questions, qIndex, eliminatedOpts, sound]);

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
    const q = questions[qIndex];
    setAnswers(prev => [...prev, { question: q, selectedIdx: -2, correct: false, timedOut: false, pts: 0, skipped: true }]);
    setPowerups(p => ({ ...p, skip: false }));
    sound.playPowerup();
    advanceQuestion(false);
  }, [powerups, feedback, questions, qIndex, sound, advanceQuestion]);

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
          total={TOTAL_QUESTIONS}
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
