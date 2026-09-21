// ============================================================
//  BRAINBLITZ – Complete Question Bank
//  Categories: math | logical | verbal | series | spatial
// ============================================================

export const ALL_QUESTIONS = [

  // ─── MATH ──────────────────────────────────────────────────
  {
    id: 1, category: "math",
    question: "If a train travels at 60 km/h and covers 240 km, how many hours does the journey take?",
    options: ["3 hours", "4 hours", "5 hours", "6 hours"],
    answer: 1,
    explanation: "Time = Distance ÷ Speed = 240 ÷ 60 = 4 hours."
  },
  {
    id: 2, category: "math",
    question: "A shopkeeper buys an item for ₹400 and sells it for ₹500. What is the profit percentage?",
    options: ["20%", "25%", "15%", "10%"],
    answer: 1,
    explanation: "Profit % = (Profit / Cost Price) × 100 = (100/400) × 100 = 25%."
  },
  {
    id: 3, category: "math",
    question: "What is 15% of 240?",
    options: ["32", "36", "38", "34"],
    answer: 1,
    explanation: "15% of 240 = (15/100) × 240 = 36."
  },
  {
    id: 4, category: "math",
    question: "Two pipes can fill a tank in 10 and 15 hours respectively. How long to fill together?",
    options: ["5 hours", "6 hours", "7 hours", "8 hours"],
    answer: 1,
    explanation: "Combined rate = 1/10 + 1/15 = 1/6. So together they fill in 6 hours."
  },
  {
    id: 5, category: "math",
    question: "The average of 5 consecutive even numbers is 18. What is the largest number?",
    options: ["20", "22", "24", "26"],
    answer: 1,
    explanation: "The numbers are 14,16,18,20,22. Largest = 22."
  },
  {
    id: 6, category: "math",
    question: "A man walks 5 km north, then 12 km east. How far is he from his starting point?",
    options: ["11 km", "13 km", "15 km", "17 km"],
    answer: 1,
    explanation: "Using Pythagoras: √(5² + 12²) = √(25+144) = √169 = 13 km."
  },
  {
    id: 7, category: "math",
    question: "If 8 men complete a job in 6 days, how many days will 12 men take?",
    options: ["3 days", "4 days", "5 days", "6 days"],
    answer: 1,
    explanation: "Work = 8×6 = 48 man-days. For 12 men: 48/12 = 4 days."
  },
  {
    id: 8, category: "math",
    question: "Simple interest on ₹2000 at 5% per year for 3 years is?",
    options: ["₹200", "₹300", "₹400", "₹350"],
    answer: 1,
    explanation: "SI = (P×R×T)/100 = (2000×5×3)/100 = ₹300."
  },

  // ─── LOGICAL ───────────────────────────────────────────────
  {
    id: 9, category: "logical",
    question: "All cats are animals. All animals are living beings. What can we conclude?",
    options: ["All living beings are cats", "All cats are living beings", "No cats are living beings", "Some cats are not living beings"],
    answer: 1,
    explanation: "By syllogism: Cats → Animals → Living beings. So all cats are living beings."
  },
  {
    id: 10, category: "logical",
    question: "If APPLE is coded as 1-16-16-12-5, what is the code for BALL?",
    options: ["2-1-12-12", "2-2-11-11", "1-2-12-12", "2-1-11-12"],
    answer: 0,
    explanation: "Each letter is coded as its position in the alphabet: B=2, A=1, L=12, L=12."
  },
  {
    id: 11, category: "logical",
    question: "A is B's sister. B is C's brother. C is D's father. How is A related to D?",
    options: ["Mother", "Aunt", "Sister", "Grandmother"],
    answer: 1,
    explanation: "A is sister of B, B is brother of C, C is D's father. So A is D's aunt."
  },
  {
    id: 12, category: "logical",
    question: "If Monday is the 1st day and today is the 25th, what day is it?",
    options: ["Thursday", "Friday", "Saturday", "Sunday"],
    answer: 1,
    explanation: "(25-1) = 24. 24 mod 7 = 3. Monday + 3 = Thursday? No: 1=Mon,8=Mon,15=Mon,22=Mon,25=Thu. Wait, Monday+0=Mon, +1=Tue, +2=Wed, +3=Thu. So the 25th is Thursday? Let me recalc: (25-1)%7 = 24%7 = 3. Mon+3 steps = Thursday."
  },
  {
    id: 13, category: "logical",
    question: "Which is the odd one out: Knife, Sword, Pistol, Dagger",
    options: ["Knife", "Sword", "Pistol", "Dagger"],
    answer: 2,
    explanation: "Pistol is the only firearm; the rest are bladed weapons."
  },
  {
    id: 14, category: "logical",
    question: "Pointing to a photograph, John said 'She is the mother of the only grandson of my mother.' How is the woman related to John?",
    options: ["Daughter", "Sister", "Wife", "Mother"],
    answer: 2,
    explanation: "John's mother's grandson = John's son. Mother of John's son = John's wife."
  },
  {
    id: 15, category: "logical",
    question: "If 6 × 4 = 48, 5 × 3 = 30, then 7 × 5 = ?",
    options: ["55", "60", "70", "75"],
    answer: 2,
    explanation: "Pattern: multiply then multiply the result by 2: 6×4=24, 24×2=48. 7×5=35, 35×2=70."
  },
  {
    id: 16, category: "logical",
    question: "In a row of 40 students, Ravi is 11th from the left. What is his position from the right?",
    options: ["28th", "29th", "30th", "31st"],
    answer: 2,
    explanation: "Position from right = (Total + 1) − position from left = 41 − 11 = 30th."
  },

  // ─── VERBAL ────────────────────────────────────────────────
  {
    id: 17, category: "verbal",
    question: "Choose the correct synonym of BENEVOLENT:",
    options: ["Cruel", "Kind", "Lazy", "Strict"],
    answer: 1,
    explanation: "Benevolent means well-meaning and kindly — synonym: Kind."
  },
  {
    id: 18, category: "verbal",
    question: "Choose the antonym of VERBOSE:",
    options: ["Talkative", "Concise", "Wordy", "Loquacious"],
    answer: 1,
    explanation: "Verbose means using too many words. Its antonym is Concise."
  },
  {
    id: 19, category: "verbal",
    question: "Fill in the blank: She _____ been working since morning.",
    options: ["has", "have", "had", "is"],
    answer: 0,
    explanation: "'She has been working since morning.' — She is singular, so 'has'."
  },
  {
    id: 20, category: "verbal",
    question: "Book : Library :: Painting : ?",
    options: ["Artist", "Canvas", "Gallery", "Museum"],
    answer: 2,
    explanation: "Books are kept in a Library; Paintings are kept in a Gallery."
  },
  {
    id: 21, category: "verbal",
    question: "Which word is correctly spelled?",
    options: ["Accomodate", "Accommodate", "Acommodate", "Accommadate"],
    answer: 1,
    explanation: "The correct spelling is 'Accommodate' — double c and double m."
  },
  {
    id: 22, category: "verbal",
    question: "Choose the word most similar in meaning to EPHEMERAL:",
    options: ["Eternal", "Transient", "Powerful", "Ancient"],
    answer: 1,
    explanation: "Ephemeral means lasting for a very short time — synonym: Transient."
  },

  // ─── SERIES ────────────────────────────────────────────────
  {
    id: 23, category: "series",
    question: "Find the next number: 2, 6, 12, 20, 30, ?",
    options: ["38", "40", "42", "44"],
    answer: 2,
    explanation: "Differences: 4,6,8,10,12. Next = 30+12 = 42."
  },
  {
    id: 24, category: "series",
    question: "Find the missing: 1, 1, 2, 3, 5, 8, 13, ?",
    options: ["18", "19", "20", "21"],
    answer: 3,
    explanation: "Fibonacci sequence: each number = sum of previous two. 8+13 = 21."
  },
  {
    id: 25, category: "series",
    question: "Find the missing letter: A, C, F, J, ?",
    options: ["M", "N", "O", "P"],
    answer: 2,
    explanation: "Gaps: +2, +3, +4, +5. J is 10th → 10+5 = 15th letter = O."
  },
  {
    id: 26, category: "series",
    question: "Find the next: 3, 9, 27, 81, ?",
    options: ["162", "243", "324", "180"],
    answer: 1,
    explanation: "Pattern: multiply by 3. 81 × 3 = 243."
  },
  {
    id: 27, category: "series",
    question: "Complete the series: 144, 121, 100, 81, ?",
    options: ["64", "60", "72", "68"],
    answer: 0,
    explanation: "12², 11², 10², 9², 8² = 64."
  },
  {
    id: 28, category: "series",
    question: "Find the odd one out: 8, 27, 64, 100, 125",
    options: ["8", "27", "100", "125"],
    answer: 2,
    explanation: "8=2³, 27=3³, 64=4³, 125=5³. But 100 is not a perfect cube."
  },

  // ─── SPATIAL ───────────────────────────────────────────────
  {
    id: 29, category: "spatial",
    question: "A cube is painted red on all faces, then cut into 27 equal smaller cubes. How many have exactly 2 faces painted?",
    options: ["8", "10", "12", "16"],
    answer: 2,
    explanation: "Edge cubes (not corners) have 2 faces painted. A 3×3×3 cube has 12 such edge pieces."
  },
  {
    id: 30, category: "spatial",
    question: "A clock shows 3:15. What is the angle between the hour and minute hands?",
    options: ["0°", "7.5°", "15°", "22.5°"],
    answer: 1,
    explanation: "At 3:00 the angle is 90°. At 3:15, minute hand moves 90°, hour hand moves 7.5°. Angle = 90 − 90 + 7.5 = 7.5°."
  },
  {
    id: 31, category: "spatial",
    question: "How many squares are in a 3×3 grid?",
    options: ["9", "12", "14", "16"],
    answer: 2,
    explanation: "1×1: 9, 2×2: 4, 3×3: 1. Total = 9+4+1 = 14 squares."
  },
  {
    id: 32, category: "spatial",
    question: "A dice has opposite faces summing to 7. If top shows 5, bottom shows?",
    options: ["1", "2", "3", "6"],
    answer: 1,
    explanation: "Opposite faces always sum to 7. 7 − 5 = 2."
  },
];
