import { useCallback, useState } from "react";
import { ChevronDown, FunctionSquare, RotateCcw } from "lucide-react";
import type { Base, ConversionStep } from "../lib/converter";
import { filterInput, getBaseName } from "../lib/converter";
import { add, subtract } from "../lib/arithmetic";
import { bitwiseOp, shiftOp, type BitwiseOp, type ShiftDir } from "../lib/bitwise";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

const BASES: Base[] = [2, 3, 5, 7, 8, 10, 12, 16, 20, 36];

type Operation = "add" | "subtract" | "AND" | "OR" | "XOR" | "shiftLeft" | "shiftRight";

const OPERATIONS: { value: Operation; label: string }[] = [
  { value: "add", label: "Adição (+)" },
  { value: "subtract", label: "Subtração (−)" },
  { value: "AND", label: "AND (&)" },
  { value: "OR", label: "OR (|)" },
  { value: "XOR", label: "XOR (^)" },
  { value: "shiftLeft", label: "Shift Left (<<)" },
  { value: "shiftRight", label: "Shift Right (>>)" },
];

interface OperationResult {
  value: string;
  steps: ConversionStep[];
}

export function OperationsPanel() {
  const [operandA, setOperandA] = useState("");
  const [baseA, setBaseA] = useState<Base>(10);
  const [operandB, setOperandB] = useState("");
  const [baseB, setBaseB] = useState<Base>(10);
  const [operation, setOperation] = useState<Operation>("add");
  const [shiftAmount, setShiftAmount] = useState("1");
  const [outBase, setOutBase] = useState<Base>(2);
  const [result, setResult] = useState<OperationResult | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isShift = operation === "shiftLeft" || operation === "shiftRight";
  const shiftAmountValid = /^\d+$/.test(shiftAmount) && parseInt(shiftAmount, 10) >= 0;

  const canCalculate =
    operandA.trim() !== "" && (isShift ? shiftAmountValid : operandB.trim() !== "");

  const handleOperandAChange = useCallback(
    (value: string) => setOperandA(filterInput(value, baseA)),
    [baseA]
  );

  const handleOperandBChange = useCallback(
    (value: string) => setOperandB(filterInput(value, baseB)),
    [baseB]
  );

  const handleOperationChange = useCallback((value: Operation) => {
    setOperation(value);
    setResult(null);
    setShowSteps(false);
    setError(null);
  }, []);

  const handleCalculate = useCallback(() => {
    const a = operandA.trim();
    const b = operandB.trim();
    if (!a) return;

    try {
      let next: OperationResult;
      if (isShift) {
        if (!shiftAmountValid) return;
        const dir: ShiftDir = operation === "shiftLeft" ? "left" : "right";
        const res = shiftOp(a, baseA, dir, parseInt(shiftAmount, 10), outBase);
        next = { value: res.result.value, steps: res.steps };
      } else {
        if (!b) return;
        switch (operation) {
          case "add":
            next = add(a, baseA, b, baseB, outBase);
            break;
          case "subtract":
            next = subtract(a, baseA, b, baseB, outBase);
            break;
          case "AND":
          case "OR":
          case "XOR": {
            const op = operation as BitwiseOp;
            const res = bitwiseOp(a, baseA, b, baseB, op, outBase);
            next = { value: res.result.value, steps: res.steps };
            break;
          }
          default:
            return;
        }
      }
      setResult(next);
      setShowSteps(true);
      setError(null);
    } catch {
      setResult(null);
      setError("Não foi possível calcular. Verifique os operandos e a base selecionada.");
    }
  }, [operandA, operandB, baseA, baseB, operation, isShift, shiftAmount, shiftAmountValid, outBase]);

  const handleClear = useCallback(() => {
    setOperandA("");
    setOperandB("");
    setResult(null);
    setShowSteps(false);
    setError(null);
  }, []);

  return (
    <div className="animate-fade-in space-y-5">
      {/* Operandos */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="operand-a" className="block text-sm font-medium text-text-secondary">
            Operando A
          </label>
          <input
            id="operand-a"
            type="text"
            value={operandA}
            onChange={(e) => handleOperandAChange(e.target.value)}
            placeholder={baseA === 10 ? "26" : "1A"}
            className="w-full rounded-xl border border-border bg-bg-input px-4 py-3 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <label htmlFor="base-a" className="sr-only">
            Base do operando A
          </label>
          <select
            id="base-a"
            value={baseA}
            onChange={(e) => setBaseA(Number(e.target.value) as Base)}
            className="w-full rounded-xl border border-border bg-bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {BASES.map((b) => (
              <option key={b} value={b}>
                {getBaseName(b)} (base {b})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="operand-b" className="block text-sm font-medium text-text-secondary">
            Operando B
          </label>
          <input
            id="operand-b"
            type="text"
            value={operandB}
            onChange={(e) => handleOperandBChange(e.target.value)}
            placeholder={baseB === 10 ? "5" : "F"}
            disabled={isShift}
            aria-disabled={isShift}
            className="w-full rounded-xl border border-border bg-bg-input px-4 py-3 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
          />
          <label htmlFor="base-b" className="sr-only">
            Base do operando B
          </label>
          <select
            id="base-b"
            value={baseB}
            onChange={(e) => setBaseB(Number(e.target.value) as Base)}
            disabled={isShift}
            className="w-full rounded-xl border border-border bg-bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            {BASES.map((b) => (
              <option key={b} value={b}>
                {getBaseName(b)} (base {b})
              </option>
            ))}
          </select>
          {isShift && (
            <p className="text-xs text-text-secondary">
              Operando B não é usado em operações de shift.
            </p>
          )}
        </div>
      </div>

      {/* Operação + amount */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <label
            htmlFor="operation"
            className="flex items-center gap-2 text-sm font-medium text-text-secondary"
          >
            <FunctionSquare className="size-4" />
            Operação
          </label>
          <select
            id="operation"
            value={operation}
            onChange={(e) => handleOperationChange(e.target.value as Operation)}
            className="w-full rounded-xl border border-border bg-bg-input px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {OPERATIONS.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        {isShift && (
          <div className="space-y-2">
            <label htmlFor="shift-amount" className="block text-sm font-medium text-text-secondary">
              Quantidade de shifts
            </label>
            <input
              id="shift-amount"
              type="number"
              min={0}
              step={1}
              value={shiftAmount}
              onChange={(e) => setShiftAmount(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg-input px-4 py-3 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-accent md:w-32"
            />
          </div>
        )}
      </div>

      {/* Base de saída */}
      <div className="space-y-2">
        <label htmlFor="out-base" className="block text-sm font-medium text-text-secondary">
          Base de saída
        </label>
        <select
          id="out-base"
          value={outBase}
          onChange={(e) => setOutBase(Number(e.target.value) as Base)}
          className="w-full rounded-xl border border-border bg-bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent md:w-64"
        >
          {BASES.map((b) => (
            <option key={b} value={b}>
              {getBaseName(b)} (base {b})
            </option>
          ))}
        </select>
      </div>

      {/* Botões */}
      <div className="flex gap-3">
        <Button className="flex-1" disabled={!canCalculate} onClick={handleCalculate}>
          Calcular
        </Button>
        <Button aria-label="Limpar" onClick={handleClear} size="icon" variant="secondary">
          <RotateCcw className="size-5" />
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-center text-sm text-accent">
          {error}
        </p>
      )}

      {/* Resultado */}
      {result && (
        <div className="mt-5 space-y-4">
          <div
            data-testid="operation-result"
            className="rounded-xl border border-border bg-bg-card p-4 text-center"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              Resultado
            </p>
            <p className="mt-1 break-all font-mono text-3xl font-bold text-accent">
              {result.value}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              {getBaseName(outBase)} (base {outBase})
            </p>
          </div>

          {/* Passo a passo */}
          <div className="rounded-2xl border border-border bg-bg-secondary p-5">
            <button
              onClick={() => setShowSteps((s) => !s)}
              aria-expanded={showSteps}
              aria-controls="operations-steps-content"
              className="flex items-center gap-2 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
            >
              <ChevronDown className={cn("size-4 transition-transform", showSteps && "rotate-180")} />
              Passo a passo da operação
            </button>

            {showSteps && (
              <div
                id="operations-steps-content"
                data-testid="operation-steps"
                className="mt-4 space-y-3"
              >
                {result.steps.map((step, index) => (
                  <StepItem key={index} index={index} step={step} />
                ))}
                <div className="border-t border-border pt-3">
                  <p className="text-center font-mono text-lg font-bold text-accent">
                    Resultado: {result.value}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StepItem({ step, index }: { step: ConversionStep; index: number }) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-bg-card p-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
        {index + 1}
      </span>
      <div className="space-y-1">
        <p className="text-sm">{step.description}</p>
        {step.math && (
          <code className="block rounded-lg bg-bg-primary px-2 py-1 font-mono text-xs text-info">
            {step.math}
          </code>
        )}
        {step.result && <p className="text-sm font-semibold text-success">= {step.result}</p>}
      </div>
    </div>
  );
}
