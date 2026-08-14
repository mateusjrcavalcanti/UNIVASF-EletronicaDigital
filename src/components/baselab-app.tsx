"use client"

import { useCallback, useEffect, useState } from "react"
import { AppHeader, type Mode } from "@/components/app-header"
import { ConversionPanel, type ConverterState } from "@/components/conversion-panel"
import { HelpDialog } from "@/components/help-dialog"
import { HistoryPanel } from "@/components/history-panel"
import { OperationsPanel } from "@/components/operations-panel"
import { QuizPanel } from "@/components/quiz-panel"
import { isValid } from "@/lib/base-conversion"
import { type HistoryItem, useHistory } from "@/lib/use-history"
import { useTheme } from "@/lib/use-theme"

export function ConverterApp() {
  const [mode, setMode] = useState<Mode>("converter")
  const [helpOpen, setHelpOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { history, addHistory, clearHistory } = useHistory()

  const [converter, setConverter] = useState<ConverterState>({
    value: "101101",
    fromBase: 2,
    toBase: 10,
    bitWidth: 8,
  })

  // Lê parâmetros compartilhados da URL na primeira renderização
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const v = params.get("v")
    const from = Number(params.get("from"))
    const to = Number(params.get("to"))
    if (v && from && to && isValid(v, from)) {
      setConverter((prev) => ({ ...prev, value: v.toUpperCase(), fromBase: from, toBase: to }))
    }
  }, [])

  const handleReuse = useCallback((item: HistoryItem) => {
    setConverter((prev) => ({
      ...prev,
      value: item.value,
      fromBase: item.fromBase,
      toBase: item.toBase,
    }))
    setMode("converter")
    setHistoryOpen(false)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader
        mode={mode}
        onModeChange={setMode}
        onHelp={() => setHelpOpen(true)}
        onHistory={() => setHistoryOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8 sm:py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl text-balance">
            {mode === "converter" && "Conversor de bases numéricas"}
            {mode === "operations" && "Operações entre bases"}
            {mode === "quiz" && "Treine suas conversões"}
          </h1>
          <p className="text-sm text-muted-foreground text-pretty">
            {mode === "converter" &&
              "Converta entre bases, visualize bits e entenda cada passo do cálculo."}
            {mode === "operations" &&
              "Some, subtraia e aplique operações bit a bit com carry, borrow e overflow."}
            {mode === "quiz" && "Responda conversões, mantenha sua sequência e suba no placar."}
          </p>
        </div>

        {mode === "converter" && (
          <ConversionPanel state={converter} setState={setConverter} onCommit={addHistory} />
        )}
        {mode === "operations" && <OperationsPanel />}
        {mode === "quiz" && (
          <div className="mx-auto max-w-xl">
            <QuizPanel />
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-border">
        <div className="mx-auto max-w-[1600px] px-4 py-5 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          Conversor de Bases Numéricas · ferramenta educacional para Eletrônica Digital
        </div>
      </footer>

      <HistoryPanel
        open={historyOpen}
        history={history}
        onClose={() => setHistoryOpen(false)}
        onReuse={handleReuse}
        onClear={clearHistory}
      />
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
