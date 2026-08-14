"use client"

import { ArrowRightLeft, Zap } from "lucide-react"
import { useEffect, useMemo } from "react"
import { BaseSelector } from "@/components/base-selector"
import { BitVisualizer } from "@/components/bit-visualizer"
import { ConversionSteps } from "@/components/conversion-steps"
import { NumberInput } from "@/components/number-input"
import { ResultDisplay } from "@/components/result-display"
import { Button } from "@/components/ui/button"
import { convert, isValid, toDecimal } from "@/lib/base-conversion"
import type { HistoryItem } from "@/lib/use-history"

export interface ConverterState {
  value: string
  fromBase: number
  toBase: number
  bitWidth: number
}

interface ConversionPanelProps {
  state: ConverterState
  setState: (updater: (prev: ConverterState) => ConverterState) => void
  onCommit: (item: Omit<HistoryItem, "id" | "timestamp">) => void
}

export function ConversionPanel({ state, setState, onCommit }: ConversionPanelProps) {
  const { value, fromBase, toBase, bitWidth } = state

  const valid = useMemo(() => isValid(value, fromBase), [value, fromBase])
  const decimal = useMemo(() => (valid ? toDecimal(value, fromBase) : 0n), [value, fromBase, valid])
  const result = useMemo(
    () => (valid ? convert(value, fromBase, toBase) : ""),
    [value, fromBase, toBase, valid],
  )

  // Registra no histórico com debounce quando há resultado válido
  useEffect(() => {
    if (!valid || value.trim() === "") return
    const timer = setTimeout(() => {
      onCommit({ value: value.toUpperCase(), fromBase, toBase, result })
    }, 900)
    return () => clearTimeout(timer)
  }, [valid, value, fromBase, toBase, result, onCommit])

  const setValue = (v: string) => setState((p) => ({ ...p, value: v }))
  const setFromBase = (b: number) => setState((p) => ({ ...p, fromBase: b }))
  const setToBase = (b: number) => setState((p) => ({ ...p, toBase: b }))
  const setBitWidth = (w: number) => setState((p) => ({ ...p, bitWidth: w }))

  const swap = () =>
    setState((p) => ({
      ...p,
      fromBase: p.toBase,
      toBase: p.fromBase,
      value: isValid(p.value, p.fromBase) ? convert(p.value, p.fromBase, p.toBase) : p.value,
    }))

  return (
    <div className="flex flex-col gap-5">
      {/* Entrada + Resultado lado a lado no desktop */}
      <div className="grid items-start gap-5 2xl:grid-cols-2">
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <NumberInput value={value} base={fromBase} isValid={valid} onChange={setValue} />

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-end">
            <BaseSelector id="from-base" label="Base de origem" value={fromBase} onChange={setFromBase} />

            <div className="flex justify-center md:pb-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={swap}
                aria-label="Inverter bases"
                className="md:size-10 md:p-0"
              >
                <ArrowRightLeft aria-hidden="true" />
                <span className="md:sr-only">Inverter bases</span>
              </Button>
            </div>

            <BaseSelector id="to-base" label="Base de destino" value={toBase} onChange={setToBase} />
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={!valid}
            onClick={() => valid && onCommit({ value: value.toUpperCase(), fromBase, toBase, result })}
          >
            <Zap aria-hidden="true" />
            <span>Converter</span>
          </Button>
        </div>

        <div className="min-w-0">
          <ResultDisplay
            inputValue={value}
            fromBase={fromBase}
            toBase={toBase}
            result={result}
            valid={valid}
          >
            <BitVisualizer
              decimal={decimal}
              valid={valid}
              width={bitWidth}
              onWidthChange={setBitWidth}
              embedded
            />
          </ResultDisplay>
        </div>
      </div>

      <ConversionSteps
        inputValue={value}
        decimal={decimal}
        fromBase={fromBase}
        toBase={toBase}
        valid={valid}
      />
    </div>
  )
}
