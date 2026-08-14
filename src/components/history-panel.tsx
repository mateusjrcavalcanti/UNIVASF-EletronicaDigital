"use client"

import { Clock, RotateCcw, Trash2, X } from "lucide-react"
import { useEffect } from "react"
import { CopyButton } from "@/components/copy-button"
import { Button } from "@/components/ui/button"
import type { HistoryItem } from "@/lib/use-history"

interface HistoryPanelProps {
  open: boolean
  history: HistoryItem[]
  onClose: () => void
  onReuse: (item: HistoryItem) => void
  onClear: () => void
}

export function HistoryPanel({ open, history, onClose, onReuse, onClear }: HistoryPanelProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Histórico">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <aside className="relative flex h-full w-full max-w-sm flex-col border-l border-border bg-card shadow-xl duration-200 animate-in slide-in-from-right">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock className="size-4 text-primary" aria-hidden="true" />
            Histórico
          </span>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Fechar histórico">
            <X aria-hidden="true" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Nenhuma conversão ainda. Suas conversões recentes aparecerão aqui.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background p-3"
                >
                  <button
                    type="button"
                    onClick={() => onReuse(item)}
                    className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left outline-none"
                  >
                    <span className="truncate font-mono text-sm text-foreground">
                      {item.value}
                      <sub>{item.fromBase}</sub> → {item.result}
                      <sub>{item.toBase}</sub>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      base {item.fromBase} → base {item.toBase}
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <CopyButton text={item.result} size="icon-sm" variant="ghost" label="Copiar" />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onReuse(item)}
                      aria-label="Reutilizar conversão"
                    >
                      <RotateCcw aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {history.length > 0 && (
          <footer className="border-t border-border p-4">
            <Button variant="destructive" size="sm" className="w-full" onClick={onClear}>
              <Trash2 aria-hidden="true" />
              Limpar histórico
            </Button>
          </footer>
        )}
      </aside>
    </div>
  )
}
