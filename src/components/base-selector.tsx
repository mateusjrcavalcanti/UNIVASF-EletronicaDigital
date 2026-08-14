"use client"

import { AVAILABLE_BASES, COMMON_BASES, baseLabel } from "@/lib/base-conversion"
import { cn } from "@/lib/utils"

interface BaseSelectorProps {
  id?: string
  label: string
  value: number
  onChange: (base: number) => void
}

export function BaseSelector({ id, label, value, onChange }: BaseSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <span
        id={id ? `${id}-label` : undefined}
        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={id ? `${id}-label` : undefined}
        className="grid grid-cols-4 gap-1.5 sm:grid-cols-8"
      >
        {AVAILABLE_BASES.map((base) => {
          const selected = value === base
          const common = COMMON_BASES.includes(base as (typeof COMMON_BASES)[number])
          return (
            <button
              key={base}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${baseLabel(base)}, base ${base}`}
              onClick={() => onChange(base)}
              className={cn(
                "relative flex h-11 min-w-0 flex-col items-center justify-center rounded-lg border px-1.5 font-mono text-sm transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent",
                common && !selected && "border-primary/25",
              )}
            >
              <span className="text-sm font-semibold leading-none">{base}</span>
              {common && (
                <span
                  className={cn(
                    "mt-0.5 text-[9px] font-medium uppercase leading-none tracking-wide",
                    selected ? "text-primary/80" : "text-muted-foreground",
                  )}
                >
                  {base === 2 ? "BIN" : base === 8 ? "OCT" : base === 10 ? "DEC" : "HEX"}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
