"use client"

import { twoComplement } from "@/lib/base-conversion"
import { cn } from "@/lib/utils"

const WIDTHS = [4, 8, 12, 16] as const

interface BitVisualizerProps {
  decimal: bigint
  valid: boolean
  width: number
  onWidthChange: (width: number) => void
  embedded?: boolean
}

export function BitVisualizer({ decimal, valid, width, onWidthChange, embedded = false }: BitVisualizerProps) {
  const tc = twoComplement(valid ? decimal : 0n, width)

  return (
    <section
      aria-label="Visualizador de bits"
      className={cn(
        "flex flex-col gap-4 p-5",
        !embedded && "rounded-2xl border border-border bg-card",
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-foreground">Visualizador de bits</h3>
          <p className="text-xs text-muted-foreground">Representação em complemento de 2</p>
        </div>
        <div role="radiogroup" aria-label="Largura em bits" className="flex gap-1 rounded-lg bg-muted p-1">
          {WIDTHS.map((w) => (
            <button
              key={w}
              type="button"
              role="radio"
              aria-checked={width === w}
              onClick={() => onWidthChange(w)}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                width === w
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {w} bits
            </button>
          ))}
        </div>
      </header>

      {/* LEDs */}
      <div className="flex flex-wrap gap-1.5" role="img" aria-label={`Bits: ${tc.bits}`}>
        {tc.bitArray.map((bit, i) => {
          const bitIndex = tc.width - 1 - i
          const isSign = i === 0
          const on = bit === 1
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="font-mono text-[9px] text-muted-foreground">{bitIndex}</span>
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-md border font-mono text-sm font-semibold transition-all sm:size-9",
                  on
                    ? "border-primary bg-primary/20 text-primary led-glow"
                    : "border-border bg-background text-muted-foreground/50",
                  isSign && on && "border-chart-5 bg-chart-5/20 text-chart-5",
                  isSign && "ring-1 ring-inset ring-border",
                )}
              >
                {bit}
              </div>
              {isSign && (
                <span className="text-[8px] font-medium uppercase text-muted-foreground">sinal</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Legenda MSB / LSB / valor */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>
            MSB: <span className="font-mono text-foreground">{tc.bitArray[0]}</span>
          </span>
          <span>
            LSB: <span className="font-mono text-foreground">{tc.bitArray[tc.width - 1]}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-medium",
              tc.isNegative
                ? "bg-chart-5/15 text-chart-5"
                : "bg-primary/15 text-primary",
            )}
          >
            {tc.isNegative ? "Negativo" : "Positivo"}
          </span>
          <span className="font-mono text-sm text-foreground">
            = {valid ? tc.decimalValue.toString() : "—"}
            <sub className="text-muted-foreground">10</sub>
          </span>
        </div>
      </div>

      {tc.overflow && valid && (
        <p className="rounded-lg bg-chart-5/10 px-3 py-2 text-xs text-chart-5">
          Overflow: o valor não cabe em {width} bits e foi truncado (wrap-around).
        </p>
      )}
    </section>
  )
}
