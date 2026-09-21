# 🧠 BrainBlitz – Aptitude & Reasoning Game

A fun, fast-paced aptitude and reasoning quiz game built with **React + Vite**.

![BrainBlitz](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎮 Features

- **5 Question Categories** — Math, Logical Reasoning, Verbal, Number Series, Spatial
- **3 Difficulty Levels** — Easy (20s), Medium (15s), Hard (10s) per question
- **Live Countdown Timer** — animated timer bar turns red when time is low
- **Scoring System** — base points + time bonus × difficulty multiplier
- **Streak Combos** — 🔥 build streaks to earn combo toasts
- **Instant Feedback** — correct/wrong/timeout overlay with explanations
- **Results Screen** — animated score counter, trophy, and performance grade
- **Question Review** — full breakdown of every answer after the game
- **Persistent Stats** — best score, games played & best streak saved to `localStorage`

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗️ Project Structure

```
src/
├── App.jsx                     # Game state, timer, scoring logic
├── App.css                     # Dark mode UI + animations
├── main.jsx                    # React entry point
├── data/
│   └── questions.js            # 32 questions across 5 categories
└── components/
    ├── BgOrbs.jsx              # Animated background orbs
    ├── HomeScreen.jsx          # Difficulty & category picker
    ├── CountdownScreen.jsx     # 3-2-1 countdown
    ├── QuizScreen.jsx          # Timer, options, HUD
    ├── ResultsScreen.jsx       # Score, grade, stats
    └── ReviewScreen.jsx        # Per-question answer review
```

## 📦 Tech Stack

- **React 19** – UI components & hooks
- **Vite 8** – lightning-fast dev server & build tool
- **Vanilla CSS** – custom dark theme, glassmorphism, keyframe animations
- **localStorage** – persistent high score tracking

## 📄 License

MIT
