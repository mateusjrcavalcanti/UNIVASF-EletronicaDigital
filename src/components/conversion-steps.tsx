"use client"

import { ListOrdered } from "lucide-react"
import {
  fromDecimal,
  polynomialExpansion,
  successiveDivisions,
} from "@/lib/base-conversion"
import { cn } from "@/lib/utils"

interface ConversionStepsProps {
  inputValue: string
  decimal: bigint
  fromBase: number
  toBase: number
  valid: boolean
  embedded?: boolean
}

export function ConversionSteps({
  inputValue,
  decimal,
  fromBase,
  toBase,
  valid,
  embedded = false,
}: ConversionStepsProps) {
  return (
    <section
      className={cn(
        !embedded && "overflow-hidden rounded-2xl border border-border bg-card",
        embedded && "border-t border-border",
      )}
    >
      <header className="flex w-full items-center gap-3 px-5 py-4 text-left">
        <span className="flex items-center gap-2.5">
          <ListOrdered className="size-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">
            Como chegamos nesse resultado?
          </span>
        </span>
      </header>

      <div className="border-t border-border px-5 py-4">
          {!valid ? (
            <p className="text-sm text-muted-foreground">
              Digite um valor válido para ver os passos.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              <PolynomialBlock inputValue={inputValue} fromBase={fromBase} decimal={decimal} />
              {toBase !== 10 && (
                <DivisionBlock decimal={decimal} toBase={toBase} />
              )}
            </div>
          )}
      </div>
    </section>
  )
}

function PolynomialBlock({
  inputValue,
  fromBase,
  decimal,
}: {
  inputValue: string
  fromBase: number
  decimal: bigint
}) {
  const steps = polynomialExpansion(inputValue, fromBase)
  const clean = inputValue.replace("-", "").toUpperCase()

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        1 · Expansão polinomial (base {fromBase} → decimal)
      </h4>
      <p className="font-mono text-sm text-foreground">
        {clean}
        <sub className="text-muted-foreground">{fromBase}</sub>
      </p>
      <div className="flex flex-col gap-1.5 font-mono text-sm">
        <p className="flex flex-wrap gap-x-2 gap-y-1 text-muted-foreground">
          {steps.map((s, i) => (
            <span key={i}>
              <span className="text-foreground">{s.digit}</span>
              {" × "}
              {fromBase}
              <sup>{s.power}</sup>
              {i < steps.length - 1 ? " +" : ""}
            </span>
          ))}
        </p>
        <p className="flex flex-wrap gap-x-2 gap-y-1 text-muted-foreground">
          {steps.map((s, i) => (
            <span key={i}>
              {s.product.toString()}
              {i < steps.length - 1 ? " +" : ""}
            </span>
          ))}
        </p>
        <p className="text-primary">
          = {decimal.toString()}
          <sub>10</sub>
        </p>
      </div>
    </div>
  )
}

function DivisionBlock({ decimal, toBase }: { decimal: bigint; toBase: number }) {
  const steps = successiveDivisions(decimal, toBase)
  const result = fromDecimal(decimal, toBase)

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        2 · Divisões sucessivas (decimal → base {toBase})
      </h4>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full border-collapse font-mono text-sm">
          <thead>
            <tr className="bg-muted text-xs text-muted-foreground">
              <th className="px-3 py-2 text-left font-medium">Dividendo</th>
              <th className="px-3 py-2 text-left font-medium">÷ {toBase}</th>
              <th className="px-3 py-2 text-left font-medium">Quociente</th>
              <th className="px-3 py-2 text-left font-medium">Resto</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-2 text-foreground">{s.dividend.toString()}</td>
                <td className="px-3 py-2 text-muted-foreground">{toBase}</td>
                <td className="px-3 py-2 text-foreground">{s.quotient.toString()}</td>
                <td className="px-3 py-2 font-semibold text-primary">{s.remainderDigit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground">
        Lendo os restos de baixo para cima:{" "}
        <span className="font-mono text-primary">
          {result}
          <sub>{toBase}</sub>
        </span>
      </p>
    </div>
  )
}
