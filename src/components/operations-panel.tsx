"use client"

import { Cpu } from "lucide-react"
import { useMemo, useState } from "react"
import { BaseSelector } from "@/components/base-selector"
import { CopyButton } from "@/components/copy-button"
import { cn } from "@/lib/utils"
import {
  OPERATIONS,
  type OperationType,
  baseLabel,
  computeOperation,
  fromDecimal,
  groupBits,
  isValid,
  toDecimal,
} from "@/lib/base-conversion"

interface OperandState {
  value: string
  base: number
}

const WIDTHS = [8, 16] as const

export function OperationsPanel() {
  const [a, setA] = useState<OperandState>({ value: "1010", base: 2 })
  const [b, setB] = useState<OperandState>({ value: "0110", base: 2 })
  const [op, setOp] = useState<OperationType>("add")
  const [resultBase, setResultBase] = useState(2)
  const [width, setWidth] = useState<number>(8)

  const validA = isValid(a.value, a.base)
  const validB = isValid(b.value, b.base)
  const valid = validA && validB

  const decA = validA ? toDecimal(a.value, a.base) : 0n
  const decB = validB ? toDecimal(b.value, b.base) : 0n

  const result = useMemo(
    () => (valid ? computeOperation(decA, decB, op, width) : null),
    [valid, decA, decB, op, width],
  )

  const opInfo = OPERATIONS.find((o) => o.id === op)!

  return (
    <div className="flex flex-col gap-5">
      {/* Operandos e operador */}
      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(220px,0.55fr)_minmax(0,1fr)]">
        <OperandCard label="Operando A" operand={a} valid={validA} onChange={setA} />

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Operação
          </span>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-2">
            {OPERATIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                aria-pressed={op === o.id}
                onClick={() => setOp(o.id)}
                className={cn(
                  "flex min-w-0 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-sm font-medium transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                  op === o.id
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-accent",
                )}
              >
                <span className="font-mono">{o.symbol}</span>
                <span className="truncate">{o.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-1 rounded-lg bg-muted p-1">
            {WIDTHS.map((w) => (
              <button
                key={w}
                type="button"
                aria-pressed={width === w}
                onClick={() => setWidth(w)}
                className={cn(
                  "flex-1 rounded-md px-2.5 py-1 font-mono text-xs font-medium transition-colors",
                  width === w
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {w} bits
              </button>
            ))}
          </div>
        </div>

        <OperandCard label="Operando B" operand={b} valid={validB} onChange={setB} />
      </div>

      {/* Resultado */}
      <section
        aria-label="Resultado da operação"
        className="grid overflow-hidden rounded-2xl border border-primary/25 bg-card lg:grid-cols-[minmax(220px,1fr)_minmax(0,3fr)]"
      >
        <div className="flex min-w-0 flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Cpu className="size-4 text-primary" aria-hidden="true" />
            <span className="font-mono">
              {valid ? decA.toString() : "A"} {opInfo.symbol} {valid ? decB.toString() : "B"}
            </span>
          </div>
          <BaseSelectorInline value={resultBase} onChange={setResultBase} />
        </div>

        <output
          aria-live="polite"
          className="block break-all font-mono text-4xl font-semibold text-primary sm:text-5xl"
        >
          {result ? fromDecimal(result.value, resultBase) : "—"}
        </output>
        <span className="text-xs font-medium uppercase tracking-wide text-foreground/70">
          {baseLabel(resultBase)} · base {resultBase}
        </span>

        {result && (
          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Binário ({width} bits)
              </span>
              <span className="font-mono text-sm text-foreground">
                {groupBits(fromDecimal(result.value, 2).replace("-", "").padStart(width, "0").slice(-width), 4)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Flag active={result.carry} label="Carry" />
              <Flag active={result.borrow} label="Borrow" />
              <Flag active={result.overflow} label="Overflow" danger />
            </div>
            <CopyButton
              text={fromDecimal(result.value, resultBase)}
              label="Copiar resultado"
              variant="outline"
            />
          </div>
        )}
        </div>

        {/* Passo a passo: ocupa 3/4 do card em telas largas */}
        <div className="border-t border-border lg:border-l lg:border-t-0">
          <header className="flex w-full items-center px-5 py-4 text-left sm:px-6">
            <span className="text-sm font-semibold text-foreground">Explicação passo a passo</span>
          </header>
          <div className="border-t border-border px-5 py-4 text-sm sm:px-6">
              {!valid ? (
                <p className="text-muted-foreground">Informe operandos válidos.</p>
              ) : (
                <ol className="flex flex-col gap-3 font-mono text-muted-foreground">
                  <li>
                    A = {a.value}
                    <sub>{a.base}</sub> = <span className="text-foreground">{decA.toString()}</span>
                    <sub>10</sub> = <span className="break-all text-foreground">{groupBits(fromDecimal(decA, 2).padStart(width, "0").slice(-width))}</span>
                    <sub>2</sub>
                  </li>
                  <li>
                    B = {b.value}
                    <sub>{b.base}</sub> = <span className="text-foreground">{decB.toString()}</span>
                    <sub>10</sub> = <span className="break-all text-foreground">{groupBits(fromDecimal(decB, 2).padStart(width, "0").slice(-width))}</span>
                    <sub>2</sub>
                  </li>
                  <li>
                    A {opInfo.symbol} B ={" "}
                    <span className="text-primary">{result ? result.value.toString() : "—"}</span>
                    <sub>10</sub>
                  </li>
                </ol>
              )}
          </div>
        </div>
      </section>
    </div>
  )
}

function OperandCard({
  label,
  operand,
  valid,
  onChange,
}: {
  label: string
  operand: OperandState
  valid: boolean
  onChange: (o: OperandState) => void
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={operand.value}
        aria-invalid={operand.value.trim() !== "" && !valid}
        onChange={(e) => onChange({ ...operand, value: e.target.value.toUpperCase() })}
        className={cn(
          "w-full rounded-xl border bg-background px-4 py-3 font-mono text-2xl text-foreground outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40",
          operand.value.trim() !== "" && !valid
            ? "border-destructive/60"
            : "border-border focus-visible:border-primary",
        )}
      />
      <BaseSelector
        id={`op-${label}`}
        label="Base"
        value={operand.base}
        onChange={(base) => onChange({ ...operand, base })}
      />
    </div>
  )
}

function BaseSelectorInline({ value, onChange }: { value: number; onChange: (b: number) => void }) {
  const bases = [2, 8, 10, 16]
  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      {bases.map((b) => (
        <button
          key={b}
          type="button"
          aria-pressed={value === b}
          onClick={() => onChange(b)}
          className={cn(
            "rounded-md px-2.5 py-1 font-mono text-xs font-medium transition-colors",
            value === b ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {b}
        </button>
      ))}
    </div>
  )
}

function Flag({ active, label, danger }: { active: boolean; label: string; danger?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-md px-2.5 py-1 text-xs font-medium",
        active
          ? danger
            ? "bg-chart-5/15 text-chart-5"
            : "bg-primary/15 text-primary"
          : "bg-muted text-muted-foreground/60",
      )}
    >
      {label}: {active ? "1" : "0"}
    </span>
  )
}
