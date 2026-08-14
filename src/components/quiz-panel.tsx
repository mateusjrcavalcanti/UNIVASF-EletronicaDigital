"use client"

import confetti from "canvas-confetti"
import { Check, Flame, Lightbulb, RefreshCw, Target, Trophy, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  COMMON_BASES,
  baseLabel,
  convert,
  fromDecimal,
  isValid,
  polynomialExpansion,
} from "@/lib/base-conversion"
import { cn } from "@/lib/utils"

interface Question {
  value: string
  fromBase: number
  toBase: number
  answer: string
}

const QUESTIONS_PER_ROUND = 10

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateQuestion(): Question {
  const bases = COMMON_BASES
  let fromBase = randomFrom(bases)
  let toBase = randomFrom(bases)
  while (toBase === fromBase) toBase = randomFrom(bases)
  const decimal = BigInt(Math.floor(Math.random() * 255) + 1)
  return {
    value: fromDecimal(decimal, fromBase),
    fromBase,
    toBase,
    answer: fromDecimal(decimal, toBase),
  }
}

export function QuizPanel() {
  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState("")
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle")
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setQuestion(generateQuestion())
  }, [])

  const next = useCallback(() => {
    setQuestion(generateQuestion())
    setAnswer("")
    setStatus("idle")
    setProgress((p) => (p + 1) % QUESTIONS_PER_ROUND)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const check = useCallback(() => {
    if (!question || status !== "idle") return
    const clean = answer.trim().toUpperCase().replace(/^0+(?=.)/, "")
    const target = question.answer.replace(/^0+(?=.)/, "")
    if (clean === target && answer.trim() !== "") {
      setStatus("correct")
      setScore((s) => s + 10 + streak * 2)
      setStreak((s) => {
        const ns = s + 1
        setBestStreak((b) => Math.max(b, ns))
        return ns
      })
      confetti({
        particleCount: 60,
        spread: 55,
        startVelocity: 35,
        origin: { y: 0.6 },
        colors: ["#5ee08a", "#8affb0", "#c8f7d4"],
        disableForReducedMotion: true,
      })
    } else {
      setStatus("wrong")
      setStreak(0)
    }
  }, [question, answer, status, streak])

  const restart = useCallback(() => {
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setProgress(0)
    next()
  }, [next])

  const valid = question ? isValid(answer, question.toBase) || answer.trim() === "" : true

  const explanation = useMemo(() => {
    if (!question) return null
    return polynomialExpansion(question.value, question.fromBase)
  }, [question])

  if (!question) return null

  return (
    <div className="flex flex-col gap-5">
      {/* Placar */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Trophy className="size-4" />} label="Pontos" value={score} />
        <StatCard icon={<Flame className="size-4" />} label="Sequência" value={streak} accent />
        <StatCard icon={<Target className="size-4" />} label="Recorde" value={bestStreak} />
      </div>

      {/* Progresso da rodada */}
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(progress / QUESTIONS_PER_ROUND) * 100}%` }}
          />
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {progress}/{QUESTIONS_PER_ROUND}
        </span>
      </div>

      {/* Pergunta */}
      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Converta de {baseLabel(question.fromBase)} para {baseLabel(question.toBase)}
          </p>
          <p className="font-mono text-5xl font-semibold text-foreground">
            {question.value}
            <sub className="text-2xl text-muted-foreground">{question.fromBase}</sub>
          </p>
          <div className="flex gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <span className="rounded-md bg-muted px-2 py-0.5">base {question.fromBase}</span>
            <span className="rounded-md bg-primary/15 px-2 py-0.5 text-primary">
              → base {question.toBase}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={answer}
            disabled={status !== "idle"}
            aria-label="Sua resposta"
            aria-invalid={!valid}
            placeholder="Sua resposta"
            onChange={(e) => setAnswer(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                status === "idle" ? check() : next()
              }
            }}
            className={cn(
              "w-full rounded-xl border bg-background px-4 py-3 text-center font-mono text-2xl text-foreground outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-70",
              status === "correct" && "border-primary",
              status === "wrong" && "border-destructive/60",
              status === "idle" && "border-border focus-visible:border-primary",
            )}
          />

          {status === "idle" ? (
            <Button size="lg" className="w-full" onClick={check} disabled={answer.trim() === ""}>
              Confirmar
            </Button>
          ) : (
            <Button size="lg" variant="outline" className="w-full" onClick={next}>
              Próxima pergunta
            </Button>
          )}
        </div>

        {/* Feedback */}
        {status === "correct" && (
          <p className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 py-2 text-sm font-medium text-primary">
            <Check className="size-4" aria-hidden="true" />
            Correto! +{10 + (streak - 1) * 2} pontos
          </p>
        )}
        {status === "wrong" && (
          <div className="flex flex-col gap-3 rounded-lg bg-muted/60 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-destructive">
              <X className="size-4" aria-hidden="true" />
              Resposta correta:{" "}
              <span className="font-mono text-foreground">
                {question.answer}
                <sub>{question.toBase}</sub>
              </span>
            </p>
            {explanation && (
              <div className="flex flex-col gap-1.5 border-t border-border pt-3">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Lightbulb className="size-3.5 text-primary" aria-hidden="true" />
                  Como resolver
                </p>
                <p className="font-mono text-sm text-muted-foreground">
                  {question.value}
                  <sub>{question.fromBase}</sub> ={" "}
                  {explanation.map((s, i) => (
                    <span key={i}>
                      {s.digit}×{question.fromBase}
                      <sup>{s.power}</sup>
                      {i < explanation.length - 1 ? " + " : ""}
                    </span>
                  ))}{" "}
                  ={" "}
                  <span className="text-foreground">
                    {convert(question.value, question.fromBase, 10)}
                    <sub>10</sub>
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={restart}>
          <RefreshCw aria-hidden="true" />
          Reiniciar quiz
        </Button>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3">
      <span className={cn("flex items-center gap-1", accent ? "text-primary" : "text-muted-foreground")}>
        {icon}
      </span>
      <span className="font-mono text-xl font-semibold text-foreground">{value}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  )
}
