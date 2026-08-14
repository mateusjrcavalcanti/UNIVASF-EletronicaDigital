import { useCallback, useState } from "react";
import { ArrowRightLeft, Binary, Calculator, Check, Copy, RotateCcw, Sparkles } from "lucide-react";
import type { Base } from "../lib/converter";
import { filterInput, getBaseName } from "../lib/converter";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { BitVisualizer } from "./BitVisualizer";

const BASES: Base[] = [2, 3, 5, 7, 8, 10, 12, 16, 20, 36];
const BIT_WIDTHS = [4, 8, 12, 16];

interface ConverterPanelProps {
  inputValue: string;
  inputBase: Base;
  outputBase: Base;
  outputValue: string;
  copied: boolean;
  onInputChange: (value: string) => void;
  onInputBaseChange: (base: Base) => void;
  onOutputBaseChange: (base: Base) => void;
  onConvert: () => void;
  onSwap: () => void;
  onClear: () => void;
  onCopy: () => void;
}

export function ConverterPanel({
  inputValue,
  inputBase,
  outputBase,
  outputValue,
  copied,
  onInputChange,
  onInputBaseChange,
  onOutputBaseChange,
  onConvert,
  onSwap,
  onClear,
  onCopy,
}: ConverterPanelProps) {
  const isSameBase = inputBase === outputBase;
  const [bitWidth, setBitWidth] = useState(8);

  const handleInputChange = useCallback(
    (value: string) => {
      const filtered = filterInput(value, inputBase);
      onInputChange(filtered);
    },
    [inputBase, onInputChange]
  );

  const placeholders: Record<Base, string> = {
    2: "1010",
    3: "102",
    5: "34",
    7: "26",
    8: "17",
    10: "26",
    12: "1B",
    16: "1A",
    20: "3G",
    36: "Z",
  };

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_auto_1fr]">
        {/* Entrada */}
        <div className="space-y-2">
          <label htmlFor="input-value" className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <Calculator className="size-4" />
            Valor de entrada
          </label>
          <input
            id="input-value"
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholders[inputBase]}
            aria-describedby="input-hint"
            className="w-full rounded-xl border border-border bg-bg-input px-4 py-3 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p id="input-hint" className="sr-only">
            Apenas dígitos válidos para a base de entrada são aceitos
          </p>
          <label htmlFor="input-base" className="sr-only">Base de entrada</label>
          <select
            id="input-base"
            value={inputBase}
            onChange={(e) => onInputBaseChange(Number(e.target.value) as Base)}
            className="w-full rounded-xl border border-border bg-bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {BASES.map((b) => (
              <option key={b} value={b}>
                {getBaseName(b)} (base {b})
              </option>
            ))}
          </select>
        </div>

        {/* Swap */}
        <div className="flex justify-center md:pb-8">
          <Button
            aria-label="Inverter bases"
            onClick={onSwap}
            size="icon"
            title="Inverter bases"
            variant="secondary"
          >
            <ArrowRightLeft className="size-5" />
          </Button>
        </div>

        {/* Saída */}
        <div className="space-y-2">
          <label htmlFor="output-value" className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <Sparkles className="size-4" />
            Resultado
          </label>
          <div className="relative">
            <input
              id="output-value"
              type="text"
              value={outputValue}
              readOnly
              aria-label="Resultado da conversão"
              placeholder="Aguardando..."
              className={cn(
                "w-full rounded-xl border border-border bg-bg-input px-4 py-3 font-mono text-lg",
                outputValue && "text-accent"
              )}
            />
            {outputValue && (
              <Button
                aria-label="Copiar resultado"
                onClick={onCopy}
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                variant="ghost"
              >
                {copied ? (
                  <Check className="size-4 text-success" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            )}
          </div>
          <span aria-live="polite" className="sr-only">
            {copied ? "Resultado copiado para a área de transferência" : ""}
          </span>
          <label htmlFor="output-base" className="sr-only">Base de saída</label>
          <select
            id="output-base"
            value={outputBase}
            onChange={(e) => onOutputBaseChange(Number(e.target.value) as Base)}
            className="w-full rounded-xl border border-border bg-bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {BASES.map((b) => (
              <option key={b} value={b}>
                {getBaseName(b)} (base {b})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-3">
        <Button
          className={cn("flex-1", !isSameBase && "animate-pulse-glow")}
          disabled={!inputValue || isSameBase}
          onClick={onConvert}
          size="default"
          variant="default"
        >
          <Binary className="size-4" />
          {isSameBase ? "Selecione bases diferentes" : "Converter"}
        </Button>
        <Button
          aria-label="Limpar"
          onClick={onClear}
          size="icon"
          variant="secondary"
        >
          <RotateCcw className="size-5" />
        </Button>
      </div>

      {isSameBase && (
        <p role="status" className="text-center text-sm text-warning">
          As bases de entrada e saída devem ser diferentes
        </p>
      )}

      {/* Visualização de Bits (somente quando a saída é binária) */}
      {outputValue && outputBase === 2 && (
        <div className="animate-fade-in space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-text-secondary">
              <Binary className="size-4 text-accent" />
              Visualização de Bits
            </h3>
            <div className="flex items-center gap-2">
              <label htmlFor="bit-width" className="text-xs text-text-secondary">
                Largura de bits
              </label>
              <select
                id="bit-width"
                value={bitWidth}
                onChange={(e) => setBitWidth(Number(e.target.value))}
                className="rounded-lg border border-border bg-bg-input px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {BIT_WIDTHS.map((w) => (
                  <option key={w} value={w}>
                    {w} bits
                  </option>
                ))}
              </select>
            </div>
          </div>
          <BitVisualizer value={inputValue} fromBase={inputBase} bitWidth={bitWidth} />
        </div>
      )}
    </div>
  );
}
