import type { Base } from "./converter";
import { convert } from "./converter";

export interface QuizQuestion {
  id: string;
  value: string;
  fromBase: Base;
  toBase: Base;
  correctAnswer: string;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  streak: number;
  maxStreak: number;
  answers: { questionId: string; userAnswer: string; correct: boolean; timeMs: number }[];
  isComplete: boolean;
}

const BASES: Base[] = [2, 3, 5, 7, 8, 10, 12, 16, 20, 36];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomValue(base: Base, maxDigits: number): string {
  const length = randomInt(1, maxDigits);
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, base);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[randomInt(0, chars.length - 1)];
  }
  // Avoid leading zeros for non-fractional numbers
  if (result.startsWith("0") && result.length > 1) {
    result = chars[randomInt(1, chars.length - 1)] + result.slice(1);
  }
  return result;
}

export function generateQuestion(): QuizQuestion {
  const fromBase = BASES[randomInt(0, BASES.length - 1)];
  let toBase = BASES[randomInt(0, BASES.length - 1)];
  while (toBase === fromBase) {
    toBase = BASES[randomInt(0, BASES.length - 1)];
  }

  const maxDigits = fromBase <= 2 ? 6 : fromBase <= 8 ? 4 : 3;
  const value = generateRandomValue(fromBase, maxDigits);
  const converted = convert(value, fromBase, toBase);

  return {
    id: `q-${Date.now()}-${randomInt(1000, 9999)}`,
    value,
    fromBase,
    toBase,
    correctAnswer: converted.value,
  };
}

export function createQuiz(questionCount: number = 10): QuizState {
  return {
    questions: Array.from({ length: questionCount }, generateQuestion),
    currentIndex: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    answers: [],
    isComplete: false,
  };
}

export function submitAnswer(
  state: QuizState,
  userAnswer: string
): QuizState {
  if (state.isComplete) return state;

  const question = state.questions[state.currentIndex];
  const normalizedUser = userAnswer.trim().toUpperCase();
  const normalizedCorrect = question.correctAnswer.trim().toUpperCase();
  const correct = normalizedUser === normalizedCorrect;

  const newStreak = correct ? state.streak + 1 : 0;
  const newMaxStreak = Math.max(state.maxStreak, newStreak);

  return {
    ...state,
    score: correct ? state.score + 1 : state.score,
    streak: newStreak,
    maxStreak: newMaxStreak,
    answers: [
      ...state.answers,
      {
        questionId: question.id,
        userAnswer: normalizedUser,
        correct,
        timeMs: 0,
      },
    ],
    currentIndex: state.currentIndex + 1,
    isComplete: state.currentIndex + 1 >= state.questions.length,
  };
}
