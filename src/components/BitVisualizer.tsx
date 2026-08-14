import { useMemo } from "react";
import type { Base } from "../lib/converter";
import { convertToDecimal } from "../lib/converter";
import { toTwosComplement } from "../lib/twosComplement";
import { cn } from "../lib/utils";

interface BitVisualizerProps {
  value: string;
  fromBase: Base;
  bitWidth?: number;
}

/**
 * Visualizador de bits em complemento de 2.
 *
 * Cada bit é exibido como um "LED" quadrado: aceso (verde) para 1,
 * apagado (cinza escuro) para 0. O bit de sinal (MSB) é destacado em
 * vermelho quando 1 (negativo) e azul quando 0 (positivo).
 */
export function BitVisualizer({ value, fromBase, bitWidth = 8 }: BitVisualizerProps) {
  const { binary, decimal, hex, isNegative } = useMemo(
    () => toTwosComplement(value, fromBase, bitWidth),
    [value, fromBase, bitWidth]
  );

  const rawDecimal = useMemo(() => {
    const dec = convertToDecimal(value, fromBase);
    return parseFloat(dec.value);
  }, [value, fromBase]);

  const isInteger = Number.isInteger(rawDecimal) && !Number.isNaN(rawDecimal);
  const width = Math.max(1, Math.floor(bitWidth));
  const mod = Math.pow(2, width);
  const truncatedInt = Math.trunc(rawDecimal);
  const wrapped = ((truncatedInt % mod) + mod) % mod;
  const truncated = isInteger && rawDecimal !== wrapped;

  if (!value) return null;

  if (!isInteger) {
    return (
      <div className="rounded-xl border border-border bg-bg-card p-4">
        <p className="text-sm text-warning">
          A visualização de bits requer um número inteiro (sem parte fracionária).
        </p>
      </div>
    );
  }

  const bits = binary.split("");

  return (
    <div className="rounded-xl border border-border bg-bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">MSB</span> = bit de sinal —
          <span className={cn("font-semibold", isNegative ? "text-accent" : "text-info")}>
            {isNegative ? " negativo" : " positivo"}
          </span>
        </p>
        {truncated && (
          <p className="text-xs text-warning">
            Valor truncado (módulo 2^{width}) para caber em {width} bits
          </p>
        )}
      </div>

      {/* LEDs */}
      <div className="mt-3 flex flex-wrap items-end justify-center gap-1 sm:gap-1.5" role="img" aria-label={`Bits em complemento de 2: ${binary}`}>
        {bits.map((bit, i) => {
          const isSign = i === 0;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                aria-label={`Bit ${bits.length - 1 - i}: ${bit}`}
                className={cn(
                  "size-5 rounded-md border transition-all duration-200 sm:size-9",
                  bit === "1"
                    ? isSign
                      ? "border-red-400 bg-accent shadow-[0_0_10px_rgba(233,69,96,0.7)]"
                      : "border-success/70 bg-success shadow-[0_0_10px_rgba(78,204,163,0.6)]"
                    : isSign
                      ? "border-info/60 bg-info/25"
                      : "border-border bg-bg-input"
                )}
              />
              <span className={cn("font-mono text-[10px] leading-none", isSign ? "font-bold text-text-primary" : "text-text-secondary")}>
                {isSign ? "S" : bits.length - 1 - i}
              </span>
            </div>
          );
        })}
      </div>

      {/* Rótulos */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm">
        <span className="text-text-secondary">
          Complemento de 2:{" "}
          <strong className={cn("font-mono", isNegative ? "text-accent" : "text-success")}>
            {decimal}
          </strong>
        </span>
        <span className="text-text-secondary">
          Hex: <strong className="font-mono text-info">{hex}</strong>
        </span>
      </div>
    </div>
  );
}
