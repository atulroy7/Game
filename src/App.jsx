import { useState, useEffect, useCallback, useRef } from 'react';
import { ALL_QUESTIONS } from './data/questions';
import HomeScreen from './components/HomeScreen';
import CountdownScreen from './components/CountdownScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import ReviewScreen from './components/ReviewScreen';
import './App.css';

const DIFFICULTY_TIME = { easy: 20, medium: 15, hard: 10 };
const TOTAL_QUESTIONS  = 10;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem('brainblitz_stats') || '{}');
  } catch { return {}; }
}

function saveStats(stats) {
  localStorage.setItem('brainblitz_stats', JSON.stringify(stats));
}

export default function App() {
  // ── Game config ────────────────────────────────────────
  const [screen,     setScreen]     = useState('home');   // home|countdown|quiz|results|review
  const [difficulty, setDifficulty] = useState('easy');
  const [category,   setCategory]   = useState('all');

  // ── Quiz state ─────────────────────────────────────────
  const [questions,    setQuestions]    = useState([]);
  const [qIndex,       setQIndex]       = useState(0);
  const [score,        setScore]        = useState(0);
  const [streak,       setStreak]       = useState(0);
  const [bestStreak,   setBestStreak]   = useState(0);
  const [timeLeft,     setTimeLeft]     = useState(20);
  const [feedback,     setFeedback]     = useState(null);  // null | { type, selectedIdx }
  const [answers,      setAnswers]      = useState([]);    // history for review
  const [streakToast,  setStreakToast]  = useState('');

  // ── Stats ──────────────────────────────────────────────
  const [stats, setStats] = useState(loadStats);

  // ── Refs ───────────────────────────────────────────────
  const timerRef    = useRef(null);
  const feedbackRef = useRef(null);

  // ─────────────────────────────────────────────────────
  //  Helpers
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
  //  TIMER
  // ─────────────────────────────────────────────────────
  const handleTimeout = useCallback(() => {
    if (feedback) return;
    const q = questions[qIndex];
    setFeedback({ type: 'timeout', selectedIdx: -1 });
    setStreak(0);
    setAnswers(prev => [...prev, {
      question: q, selectedIdx: -1, correct: false, timedOut: true
    }]);
    feedbackRef.current = setTimeout(() => advanceQuestion(), 1800);
  }, [feedback, questions, qIndex]);

  useEffect(() => {
    if (screen !== 'quiz' || feedback) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, feedback, qIndex, handleTimeout]);

  // ─────────────────────────────────────────────────────
  //  ANSWER
  // ─────────────────────────────────────────────────────
  const handleAnswer = useCallback((selectedIdx) => {
    if (feedback) return;
    clearInterval(timerRef.current);
    clearTimeout(feedbackRef.current);

    const q = questions[qIndex];
    const isCorrect = selectedIdx === q.answer;

    let pts = 0;
    let newStreak = streak;
    let newBest   = bestStreak;

    if (isCorrect) {
      const timeBonus = Math.ceil(timeLeft / 2);
      const diffMult  = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
      pts = Math.round((100 + timeBonus * 5) * diffMult);
      newStreak = streak + 1;
      if (newStreak > newBest) newBest = newStreak;
    } else {
      newStreak = 0;
    }

    setScore(s => s + pts);
    setStreak(newStreak);
    setBestStreak(newBest);
    setFeedback({ type: isCorrect ? 'correct' : 'wrong', selectedIdx });
    setAnswers(prev => [...prev, {
      question: q, selectedIdx, correct: isCorrect, timedOut: false, pts
    }]);

    // Streak toast
    if (isCorrect && newStreak >= 3 && newStreak % 3 === 0) {
      setStreakToast(`🔥 ${newStreak}× Streak! +Bonus!`);
      setTimeout(() => setStreakToast(''), 2000);
    }

    feedbackRef.current = setTimeout(() => advanceQuestion(), 1800);
  }, [feedback, questions, qIndex, streak, bestStreak, timeLeft, difficulty]);

  // ─────────────────────────────────────────────────────
  //  ADVANCE
  // ─────────────────────────────────────────────────────
  function advanceQuestion() {
    setFeedback(null);
    setQIndex(i => {
      const next = i + 1;
      if (next >= TOTAL_QUESTIONS) {
        finishGame();
        return i;
      }
      setTimeLeft(DIFFICULTY_TIME[difficulty]);
      return next;
    });
  }

  // ─────────────────────────────────────────────────────
  //  FINISH
  // ─────────────────────────────────────────────────────
  function finishGame() {
    setAnswers(prev => {
      // update highscore
      const newStats = {
        highScore: Math.max(stats.highScore || 0, score),
        gamesPlayed: (stats.gamesPlayed || 0) + 1,
        bestStreak: Math.max(stats.bestStreak || 0, bestStreak),
      };
      setStats(newStats);
      saveStats(newStats);
      return prev;
    });
    setTimeout(() => setScreen('results'), 200);
  }

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
        <CountdownScreen onDone={beginQuiz} />
      )}
      {screen === 'quiz' && (
        <QuizScreen
          question={questions[qIndex]}
          qIndex={qIndex}
          total={TOTAL_QUESTIONS}
          score={score}
          streak={streak}
          timeLeft={timeLeft}
          maxTime={DIFFICULTY_TIME[difficulty]}
          feedback={feedback}
          onAnswer={handleAnswer}
          onQuit={() => { clearInterval(timerRef.current); clearTimeout(feedbackRef.current); setScreen('home'); }}
          streakToast={streakToast}
        />
      )}
      {screen === 'results' && (
        <ResultsScreen
          score={score}
          answers={answers}
          bestStreak={bestStreak}
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
