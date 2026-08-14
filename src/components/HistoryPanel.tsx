import { Clock, Trash2, X } from "lucide-react";
import type { ConversionRecord } from "../lib/converter";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

interface HistoryPanelProps {
  records: ConversionRecord[];
  onSelect: (record: ConversionRecord) => void;
  onClear: () => void;
  onClose: () => void;
}

export function HistoryPanel({ records, onSelect, onClear, onClose }: HistoryPanelProps) {
  return (
    <div className="animate-slide-in rounded-2xl border border-border bg-bg-secondary p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Clock className="size-5 text-accent" />
          Histórico
        </h2>
        <div className="flex items-center gap-2">
          {records.length > 0 && (
            <Button
              aria-label="Limpar histórico"
              className="text-xs text-accent hover:text-accent-hover"
              onClick={onClear}
              size="sm"
              variant="ghost"
            >
              <Trash2 className="mr-1 size-3" />
              Limpar
            </Button>
          )}
          <Button aria-label="Fechar" onClick={onClose} size="icon" variant="ghost">
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {records.length === 0 ? (
        <p role="status" className="py-8 text-center text-text-secondary">
          Nenhuma conversão registrada ainda
        </p>
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {records.map((record) => (
            <button
              key={record.id}
              onClick={() => onSelect(record)}
              aria-label={`Recarregar conversão: ${record.inputValue} (base ${record.inputBase}) para ${record.outputValue} (base ${record.outputBase})`}
              className={cn(
                "w-full rounded-xl border border-border bg-bg-card p-3 text-left",
                "transition-all hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">
                  <span className="text-success">{record.inputValue}</span>
                  <sub className="text-text-secondary">{record.inputBase}</sub>
                  {" → "}
                  <span className="text-accent">{record.outputValue}</span>
                  <sub className="text-text-secondary">{record.outputBase}</sub>
                </span>
                <span className="text-xs text-text-secondary">
                  {formatTime(record.timestamp)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
