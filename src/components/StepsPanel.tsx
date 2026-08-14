import { ChevronDown, X } from "lucide-react";
import type { ConversionStep } from "../lib/converter";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

interface StepsPanelProps {
  steps: ConversionStep[];
  result: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function StepsPanel({ steps, result, isOpen, onToggle, onClose }: StepsPanelProps) {
  return (
    <div className="animate-fade-in rounded-2xl border border-border bg-bg-secondary p-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls="steps-content"
          className="flex items-center gap-2 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
        >
          <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
          Passo a passo da conversão
        </button>
        <Button aria-label="Fechar" onClick={onClose} size="icon" variant="ghost">
          <X className="size-4" />
        </Button>
      </div>

      {isOpen && (
        <div id="steps-content" className="mt-4 space-y-3">
          {steps.map((step, index) => (
            <StepItem key={index} index={index} step={step} />
          ))}
          <div className="border-t border-border pt-3">
            <p className="text-center font-mono text-lg font-bold text-accent">
              Resultado: {result}
            </p>
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
