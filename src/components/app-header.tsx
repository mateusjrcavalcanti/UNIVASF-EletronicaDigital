"use client"

import { HelpCircle, History, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type Mode = "converter" | "operations" | "quiz"

const MODES: { id: Mode; label: string }[] = [
  { id: "converter", label: "Conversor" },
  { id: "operations", label: "Operações" },
  { id: "quiz", label: "Quiz" },
]

interface AppHeaderProps {
  mode: Mode
  onModeChange: (mode: Mode) => void
  onHelp: () => void
  onHistory: () => void
  theme: "dark" | "light"
  onToggleTheme: () => void
}

export function AppHeader({
  mode,
  onModeChange,
  onHelp,
  onHistory,
  theme,
  onToggleTheme,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-4 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-background">
              <img
                src={`${import.meta.env.BASE_URL}icons/brand-mark-64.png`}
                alt=""
                width="40"
                height="40"
                aria-hidden="true"
              />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                Conversor de <span className="text-primary">Bases Numéricas</span>
              </span>
              <span className="text-[11px] text-muted-foreground">Eletrônica Digital</span>
            </div>
          </div>

          {/* Ações no mobile */}
          <div className="flex items-center gap-1 md:hidden">
            <Button variant="ghost" size="icon-sm" onClick={onHistory} aria-label="Histórico">
              <History aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onHelp} aria-label="Ajuda">
              <HelpCircle aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleTheme}
              aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            >
              {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </Button>
          </div>
        </div>

        <nav
          aria-label="Modos"
          className="flex items-center gap-1 rounded-xl bg-muted p-1"
          role="tablist"
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => onModeChange(m.id)}
              className={cn(
                "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:flex-none",
                mode === m.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </nav>

        {/* Ações no desktop */}
        <div className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="icon-sm" onClick={onHistory} aria-label="Histórico">
            <History aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onHelp} aria-label="Ajuda">
            <HelpCircle aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
          >
            {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
