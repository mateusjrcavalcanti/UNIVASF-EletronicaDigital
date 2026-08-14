"use client"

import { AlertCircle } from "lucide-react"
import { DIGITS, baseLabel } from "@/lib/base-conversion"
import { cn } from "@/lib/utils"

interface NumberInputProps {
  value: string
  base: number
  isValid: boolean
  onChange: (value: string) => void
  onSubmit?: () => void
}

export function NumberInput({ value, base, isValid, onChange, onSubmit }: NumberInputProps) {
  const allowed = DIGITS.slice(0, base)
  const showError = value.trim() !== "" && !isValid

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="number-input"
        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
      >
        Valor de entrada
      </label>
      <div className="relative">
        <input
          id="number-input"
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          value={value}
          placeholder="0"
          aria-invalid={showError}
          aria-describedby="input-help"
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
              onSubmit?.()
            }
          }}
          className={cn(
            "w-full rounded-xl border bg-card px-4 py-4 font-mono text-3xl tracking-wide text-foreground shadow-sm transition-colors outline-none placeholder:text-muted-foreground/40 focus-visible:ring-3 focus-visible:ring-ring/40 sm:text-4xl",
            showError ? "border-destructive/60 focus-visible:ring-destructive/30" : "border-border focus-visible:border-primary",
          )}
        />
      </div>
      <p
        id="input-help"
        className={cn(
          "flex items-center gap-1.5 text-xs",
          showError ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {showError ? (
          <>
            <AlertCircle className="size-3.5" aria-hidden="true" />
            <span>
              Dígito inválido para {baseLabel(base)}. Permitidos: {allowed}
            </span>
          </>
        ) : (
          <span>
            {baseLabel(base)} · dígitos permitidos: <span className="font-mono">{allowed}</span>
          </span>
        )}
      </p>
    </div>
  )
}
