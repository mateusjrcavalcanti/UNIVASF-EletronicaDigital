import { describe, expect, it } from "vitest";
import { createQuiz, generateQuestion, submitAnswer, type QuizState } from "./quiz";

describe("generateQuestion", () => {
  it("gera uma questão com id único", () => {
    const q1 = generateQuestion();
    const q2 = generateQuestion();
    expect(q1.id).not.toBe(q2.id);
  });

  it("fromBase e toBase são diferentes", () => {
    const q = generateQuestion();
    expect(q.fromBase).not.toBe(q.toBase);
  });

  it("fromBase está nas bases permitidas", () => {
    const q = generateQuestion();
    const allowedBases = [2, 3, 5, 7, 8, 10, 12, 16, 20, 36];
    expect(allowedBases).toContain(q.fromBase);
    expect(allowedBases).toContain(q.toBase);
  });

  it("value é uma string não vazia", () => {
    const q = generateQuestion();
    expect(q.value).toBeTruthy();
    expect(typeof q.value).toBe("string");
  });

  it("correctAnswer é definido", () => {
    const q = generateQuestion();
    expect(q.correctAnswer).toBeTruthy();
    expect(typeof q.correctAnswer).toBe("string");
  });
});

describe("createQuiz", () => {
  it("cria quiz com 10 questões por padrão", () => {
    const quiz = createQuiz();
    expect(quiz.questions).toHaveLength(10);
  });

  it("aceita contagem customizada", () => {
    const quiz = createQuiz(5);
    expect(quiz.questions).toHaveLength(5);
  });

  it("estado inicial está correto", () => {
    const quiz = createQuiz();
    expect(quiz.currentIndex).toBe(0);
    expect(quiz.score).toBe(0);
    expect(quiz.streak).toBe(0);
    expect(quiz.maxStreak).toBe(0);
    expect(quiz.answers).toHaveLength(0);
    expect(quiz.isComplete).toBe(false);
  });
});

describe("submitAnswer", () => {
  it("retorna estado inalterado se quiz já está completo", () => {
    const quiz: QuizState = {
      questions: [],
      currentIndex: 0,
      score: 0,
      streak: 0,
      maxStreak: 0,
      answers: [],
      isComplete: true,
    };
    const result = submitAnswer(quiz, "teste");
    expect(result).toBe(quiz);
  });

  it("avalia resposta correta", () => {
    const quiz = createQuiz(3);
    const question = quiz.questions[0];
    const result = submitAnswer(quiz, question.correctAnswer);

    expect(result.score).toBe(1);
    expect(result.streak).toBe(1);
    expect(result.maxStreak).toBe(1);
    expect(result.answers).toHaveLength(1);
    expect(result.answers[0].correct).toBe(true);
    expect(result.answers[0].userAnswer).toBe(question.correctAnswer.toUpperCase());
    expect(result.currentIndex).toBe(1);
  });

  it("avalia resposta incorreta", () => {
    const quiz = createQuiz(3);
    const result = submitAnswer(quiz, "RESPOSTA_ERRADA");

    expect(result.score).toBe(0);
    expect(result.streak).toBe(0);
    expect(result.maxStreak).toBe(0);
    expect(result.answers).toHaveLength(1);
    expect(result.answers[0].correct).toBe(false);
    expect(result.currentIndex).toBe(1);
  });

  it("reseta streak em erro", () => {
    const quiz = createQuiz(5);
    // Primeira resposta correta
    let state = submitAnswer(quiz, quiz.questions[0].correctAnswer);
    expect(state.streak).toBe(1);

    // Segunda resposta incorreta
    state = submitAnswer(state, "ERRADO");
    expect(state.streak).toBe(0);
    expect(state.score).toBe(1);
  });

  it("acumula streak em respostas corretas consecutivas", () => {
    const quiz = createQuiz(5);
    let state = quiz;
    for (let i = 0; i < 3; i++) {
      state = submitAnswer(state, state.questions[state.currentIndex].correctAnswer);
    }
    expect(state.streak).toBe(3);
    expect(state.maxStreak).toBe(3);
    expect(state.score).toBe(3);
  });

  it("marca como completo após última questão", () => {
    const quiz = createQuiz(2);
    let state = submitAnswer(quiz, quiz.questions[0].correctAnswer);
    expect(state.isComplete).toBe(false);

    state = submitAnswer(state, state.questions[state.currentIndex].correctAnswer);
    expect(state.isComplete).toBe(true);
    expect(state.currentIndex).toBe(2);
  });

  it("faz trim e uppercase na resposta do usuário", () => {
    const quiz = createQuiz(2);
    const answer = quiz.questions[0].correctAnswer.toLowerCase();
    const result = submitAnswer(quiz, `  ${answer}  `);
    expect(result.answers[0].userAnswer).toBe(answer.toUpperCase());
  });

  it("preserva score anterior em erro", () => {
    const quiz = createQuiz(3);
    let state = submitAnswer(quiz, quiz.questions[0].correctAnswer); // score 1
    state = submitAnswer(state, "ERRADO"); // score ainda 1
    expect(state.score).toBe(1);
  });
});
