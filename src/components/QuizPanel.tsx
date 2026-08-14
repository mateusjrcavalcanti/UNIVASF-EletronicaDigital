import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Lightbulb, RotateCcw, Trophy, X } from "lucide-react";
import type { QuizState } from "../lib/quiz";
import { createQuiz, submitAnswer } from "../lib/quiz";
import { getBaseName } from "../lib/converter";
import { celebrateQuizComplete, celebrateQuizCorrect } from "../lib/confetti";
import {
  getCompletionAriaLabel,
  getExplanation,
  getQuestionAriaLabel,
  getQuizIntro,
  getTip,
  type AnswerExplanation,
} from "../lib/quiz-education";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

const QUIZ_SIZE = 10;

export function QuizPanel() {
  const [quiz, setQuiz] = useState<QuizState>(() => createQuiz(QUIZ_SIZE));
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [explanation, setExplanation] = useState<AnswerExplanation | null>(null);
  const [showTip, setShowTip] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = quiz.questions[quiz.currentIndex];
  const tip = currentQuestion ? getTip(currentQuestion) : null;

  // Celebração quando quiz completa
  useEffect(() => {
    if (quiz.isComplete) {
      celebrateQuizComplete();
    }
  }, [quiz.isComplete]);

  const handleSubmit = useCallback(() => {
    if (!input.trim() || !currentQuestion) return;

    const newQuiz = submitAnswer(quiz, input);
    const wasCorrect = newQuiz.score > quiz.score;

    setFeedback(wasCorrect ? "correct" : "wrong");
    setExplanation(getExplanation(currentQuestion, input.trim().toUpperCase(), wasCorrect));

    if (wasCorrect) {
      celebrateQuizCorrect(newQuiz.streak);
    }

    setQuiz(newQuiz);
    setInput("");

    if (!newQuiz.isComplete) {
      setTimeout(() => {
        setFeedback("idle");
        setExplanation(null);
        setShowTip(false);
        inputRef.current?.focus();
      }, 2000);
    }
  }, [input, quiz, currentQuestion]);

  const handleRestart = useCallback(() => {
    setQuiz(createQuiz(QUIZ_SIZE));
    setInput("");
    setFeedback("idle");
    setExplanation(null);
    setShowTip(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSubmit();
    },
    [handleSubmit]
  );

  // ── Tela de conclusão ──────────────────────────────────────────────────────
  if (quiz.isComplete) {
    const accuracy = Math.round((quiz.score / quiz.questions.length) * 100);
    const completionLabel = getCompletionAriaLabel(quiz.score, QUIZ_SIZE, quiz.maxStreak);

    return (
      <div
        className="animate-fade-in rounded-2xl border border-border bg-bg-secondary p-6 text-center"
        role="region"
        aria-label={completionLabel}
      >
        <Trophy className="mx-auto size-12 text-accent" aria-hidden="true" />
        <h2 className="mt-3 text-2xl font-bold">Quiz Completo!</h2>

        {/* Resultado para leitores de tela */}
        <div className="sr-only" role="status" aria-live="polite">
          {completionLabel}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-bg-card p-3">
            <p className="text-2xl font-bold text-accent" aria-label={`${quiz.score} acertos`}>
              {quiz.score}
            </p>
            <p className="text-xs text-text-secondary">Acertos</p>
          </div>
          <div className="rounded-xl bg-bg-card p-3">
            <p className="text-2xl font-bold text-info" aria-label={`${accuracy} por cento de precisão`}>
              {accuracy}%
            </p>
            <p className="text-xs text-text-secondary">Precisão</p>
          </div>
          <div className="rounded-xl bg-bg-card p-3">
            <p className="text-2xl font-bold text-success" aria-label={`Maior sequência: ${quiz.maxStreak}`}>
              {quiz.maxStreak}
            </p>
            <p className="text-xs text-text-secondary">Max Streak</p>
          </div>
        </div>

        {/* Resumo por questão */}
        <div className="mt-5 text-left" role="list" aria-label="Resumo das respostas">
          {quiz.answers.map((a, i) => {
            const q = quiz.questions[i];
            return (
              <div
                key={a.questionId}
                className="flex items-center gap-2 border-b border-border py-2 text-sm"
                role="listitem"
              >
                {a.correct ? (
                  <Check className="size-4 shrink-0 text-success" aria-hidden="true" />
                ) : (
                  <X className="size-4 shrink-0 text-accent" aria-hidden="true" />
                )}
                <span className="font-mono">{q.value}</span>
                <sub className="text-xs text-text-secondary">{q.fromBase}</sub>
                <span className="text-text-secondary">→</span>
                {!a.correct && (
                  <span className="text-accent line-through">{a.userAnswer}</span>
                )}
                <span className="font-mono text-success">{q.correctAnswer}</span>
                <sub className="text-xs text-text-secondary">{q.toBase}</sub>
              </div>
            );
          })}
        </div>

        <Button className="mt-5" onClick={handleRestart} aria-label="Iniciar um novo quiz">
          <RotateCcw className="mr-2 size-4" aria-hidden="true" />
          Novo Quiz
        </Button>
      </div>
    );
  }

  // ── Tela de pergunta ───────────────────────────────────────────────────────
  const questionLabel = currentQuestion
    ? getQuestionAriaLabel(currentQuestion, quiz.currentIndex, QUIZ_SIZE)
    : "";

  return (
    <div
      className="animate-fade-in rounded-2xl border border-border bg-bg-secondary p-5 sm:p-6"
      role="region"
      aria-label={`Quiz de conversão de bases — ${questionLabel}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white"
            aria-label={`Questão ${quiz.currentIndex + 1} de ${QUIZ_SIZE}`}
          >
            {quiz.currentIndex + 1} / {QUIZ_SIZE}
          </span>
          <span className="text-sm text-text-secondary" aria-live="off">
            <span className="sr-only">Pontuação: </span>
            Score: <strong className="text-accent">{quiz.score}</strong>
            {quiz.streak > 1 && (
              <span className="ml-2 text-success" aria-label={`Sequência de ${quiz.streak} acertos`}>
                🔥 {quiz.streak}x
              </span>
            )}
          </span>
        </div>

        {/* Botão de dica */}
        {tip && (
          <button
            type="button"
            onClick={() => setShowTip((s) => !s)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-bg-card hover:text-accent"
            aria-label={showTip ? "Ocultar dica de conversão" : "Mostrar dica de conversão"}
            aria-expanded={showTip}
          >
            <Lightbulb className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Dica</span>
          </button>
        )}
      </div>

      {/* Dica expansível */}
      {showTip && tip && (
        <div
          className="mb-4 rounded-xl border border-info/30 bg-info/5 p-3 text-sm text-text-secondary"
          role="note"
          aria-label="Dica de conversão"
        >
          <p className="font-medium text-info">💡 {tip.short}</p>
          <p className="mt-1 text-xs opacity-80">{tip.detailed}</p>
        </div>
      )}

      {/* Question */}
      <div className="mb-4 text-center">
        <p className="text-lg text-text-secondary" id="quiz-question">
          Converta{" "}
          <code className="rounded bg-bg-card px-2 py-1 font-mono text-accent">
            {currentQuestion?.value}
          </code>
          <sub className="text-xs">{currentQuestion?.fromBase}</sub>
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          para {getBaseName(currentQuestion?.toBase)} (base{" "}
          {currentQuestion?.toBase})
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <label htmlFor="quiz-answer-input" className="sr-only">
          Sua resposta
        </label>
        <input
          ref={inputRef}
          id="quiz-answer-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="Digite a resposta..."
          aria-label={questionLabel}
          aria-describedby="quiz-question"
          aria-invalid={feedback === "wrong"}
          className={cn(
            "flex-1 rounded-xl border border-border bg-bg-input px-4 py-3 font-mono text-lg focus:outline-none focus:ring-2",
            feedback === "correct" && "border-success focus:ring-success",
            feedback === "wrong" && "border-accent focus:ring-accent",
            feedback === "idle" && "focus:ring-accent"
          )}
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
        <Button
          onClick={handleSubmit}
          disabled={!input.trim()}
          aria-label={input.trim() ? "Enviar resposta" : "Digite uma resposta para enviar"}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Feedback + Explicação */}
      <div aria-live="polite" role="status">
        {feedback === "correct" && explanation && (
          <div className="mt-4 rounded-xl border border-success/30 bg-success/5 p-3">
            <p className="flex items-center gap-2 text-sm font-medium text-success">
              <Check className="size-4" aria-hidden="true" />
              Correto! 🎉
            </p>
            <div className="mt-2 space-y-1 text-sm text-text-secondary">
              <p className="font-medium text-text-primary">{explanation.method}</p>
              {explanation.steps.map((step, i) => (
                <p key={i} className="text-xs">
                  {step}
                </p>
              ))}
              {explanation.note && (
                <p className="mt-1 text-xs italic text-text-secondary">{explanation.note}</p>
              )}
            </div>
          </div>
        )}

        {feedback === "wrong" && explanation && (
          <div className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-3">
            <p className="flex items-center gap-2 text-sm font-medium text-accent">
              <X className="size-4" aria-hidden="true" />
              Resposta correta:{" "}
              <code className="rounded bg-bg-card px-1 font-mono">
                {currentQuestion?.correctAnswer}
              </code>
            </p>
            <div className="mt-2 space-y-1 text-sm text-text-secondary">
              <p className="font-medium text-text-primary">{explanation.method}</p>
              {explanation.steps.map((step, i) => (
                <p key={i} className="text-xs">
                  {step}
                </p>
              ))}
              {explanation.note && (
                <p className="mt-1 text-xs italic text-accent">{explanation.note}</p>
              )}
            </div>
          </div>
        )}

        {feedback === "idle" && quiz.currentIndex === 0 && (
          <p className="mt-3 text-center text-xs text-text-secondary">
            {getQuizIntro()}
          </p>
        )}
      </div>
    </div>
  );
}
